import { z } from "zod";
import { serviceGroups } from "@/case-study-catalog";
import { assertOrigin, requireOwner } from "@/auth";
import { query } from "@/db";
import { boundedJSON } from "@/request-limits";
import {
  addImage, attachUpload, autoBuild, regenerateSeo, fillStack, ensureDesign, saveDesign, brainstorm, industryOptions, locationOptions, serviceOptions, createStudy, dismissIdea, draftStudy, editableFields, generateStudyImage,
  getStudy, listAll, planImages, removeImage, removeStudy, rewriteField, saveImage, saveStudy,
} from "@/case-studies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Image models can take several minutes; the request stays open until the picture is stored.
export const maxDuration = 300;

const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
const id = z.string().uuid();

export async function GET(request: Request) {
  try {
    await requireOwner();
  } catch {
    return json({ error: "Sign in to continue" }, 401);
  }
  try {
    const studyId = new URL(request.url).searchParams.get("id");
    return json(studyId ? await getStudy(id.parse(studyId)) : { ...(await listAll()), options: { services: serviceOptions, serviceGroups, industries: industryOptions, locations: locationOptions } });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Request failed" }, 400);
  }
}

export async function POST(request: Request) {
  let owner;
  try {
    owner = await requireOwner();
    assertOrigin(request);
  } catch {
    return json({ error: "Sign in to continue" }, 401);
  }
  try {
    const body = (await boundedJSON(request, 200_000)) as any;
    const audit = (action: string, entity: string) =>
      query("INSERT INTO audit_events(owner_id,action,entity_id) VALUES($1,$2,$3)", [owner.id, "case-study:" + action, entity]);
    switch (body.action) {
      case "brainstorm": {
        const input = z
          .object({ subject: z.string().trim().max(300).optional(), notes: z.string().trim().max(3000).optional(), services: z.array(z.string().max(80)).max(30).optional(), industries: z.array(z.string().max(80)).max(30).optional(), locations: z.array(z.string().max(80)).max(30).optional(), count: z.number().int().min(3).max(12).default(8) })
          .parse(body);
        return json({ ideas: await brainstorm(input) });
      }
      case "auto": {
        const input = z
          .object({ subject: z.string().trim().max(300).optional(), notes: z.string().trim().max(3000).optional(), services: z.array(z.string().max(80)).max(30).optional(), industries: z.array(z.string().max(80)).max(30).optional(), locations: z.array(z.string().max(80)).max(30).optional(), count: z.number().int().min(1).max(5).default(1) })
          .parse(body);
        const studies = await autoBuild(input);
        await audit("auto", studies[0].id);
        return json({ studies });
      }
      case "dismiss-idea":
        await dismissIdea(id.parse(body.id));
        return json({ ok: true });
      case "create": {
        const input = z
          .object({ title: z.string().trim().min(3).max(200), subject: z.string().trim().min(3).max(300), facts: z.string().max(20000).optional(), ideaId: id.optional(), services: z.array(z.string().max(80)).max(3).optional(), industry: z.string().max(80).optional(), location: z.string().max(80).optional() })
          .parse(body);
        const study = await createStudy(input);
        await audit("create", study.id);
        return json({ study });
      }
      case "save":
        return json({ study: await saveStudy(id.parse(body.id), z.object({ title: z.string().optional(), facts: z.string().max(20000).optional(), status: z.string().optional(), content: z.unknown().optional() }).parse(body.input)) });
      case "draft": {
        const study = await draftStudy(id.parse(body.id));
        await audit("draft", study.id);
        return json({ study });
      }
      case "rewrite":
        return json({ study: await rewriteField(id.parse(body.id), z.enum(editableFields).parse(body.field), z.string().max(1000).default("").parse(body.instruction ?? "")) });
      case "design":
        return json({ design: await ensureDesign(id.parse(body.id), true) });
      case "save-design":
        return json({ design: await saveDesign(id.parse(body.id), body.input) });
      case "seo":
        return json({ study: await regenerateSeo(id.parse(body.id)) });
      case "fill-stack":
        return json({ study: await fillStack(id.parse(body.id)) });
      case "plan-images":
        return json({ images: await planImages(id.parse(body.id), body.replace !== false) });
      case "add-image":
        return json({ image: await addImage(id.parse(body.id), z.object({ slot: z.string().optional(), prompt: z.string().trim().min(20).max(2000), alt: z.string().optional(), ratio: z.string().optional(), style: z.string().optional() }).parse(body.input)) });
      case "save-image":
        return json({ image: await saveImage(id.parse(body.id), z.object({ prompt: z.string().optional(), alt: z.string().optional(), ratio: z.string().optional(), slot: z.string().optional(), style: z.string().optional() }).parse(body.input)) });
      case "generate-image": {
        const image = await generateStudyImage(id.parse(body.id), body.brandStyle !== false);
        await audit("image", image.id);
        return json({ image });
      }
      case "attach-image":
        return json({ image: await attachUpload(id.parse(body.id), id.parse(body.assetId)) });
      case "delete-image":
        await removeImage(id.parse(body.id));
        return json({ ok: true });
      case "delete": {
        await removeStudy(id.parse(body.id));
        await audit("delete", body.id);
        return json({ ok: true });
      }
      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (error) {
    return json({ error: error instanceof z.ZodError ? "Check the fields and try again (" + error.issues.slice(0, 3).map((i) => i.path.join(".") + ": " + i.message).join("; ") + ")" : error instanceof Error ? error.message : "Request failed" }, 400);
  }
}
