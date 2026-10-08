import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { generateHero } from "../src/production-assets";
import { backupFiles, restoreFiles } from "../src/publishing-backup";
import { SESv2Client } from "@aws-sdk/client-sesv2";
import {
  saveSesSettings,
  checkSes,
  newsletterReady,
  subscribe,
  sendOutbox,
  queueEmail,
} from "../src/ses-newsletter";
import { submitApplication } from "../src/careers";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import {
  loadSpecifications,
  importSpecifications,
} from "../src/page-spec-import";
import { query, pool } from "../src/db";
import {
  queuePages,
  runPipelineTask,
  assembleReadyRuns,
  retryRun,
  cancelRun,
} from "../src/publishing-pipeline";
import {
  consoleList,
  consoleOverview,
  consoleSettings,
  listSchema,
} from "../src/admin-console-data";
import { saveProviderCredentials } from "../src/provider-credentials";
import {
  confirmSubscription,
  unsubscribe,
  tokenHash,
} from "../src/ses-newsletter";
test("isolated database verifies repeat imports, draft CAS, retries and subscription state", async () => {
  const db = await PGlite.create(),
    server = new PGLiteSocketServer({
      db,
      host: "127.0.0.1",
      port: 16439,
      maxConnections: 20,
    });
  const tmp = await mkdtemp(path.join(os.tmpdir(), "netofficials-publishing-"));
  process.env.DATABASE_URL = "postgres://postgres@127.0.0.1:16439/postgres";
  process.env.PROVIDER_ENCRYPTION_KEY = "ab".repeat(32);
  process.env.PERSISTENT_ASSET_DIR = path.join(tmp, "assets");
  process.env.PRIVATE_CV_DIR = path.join(tmp, "cvs");
  const originalFetch = globalThis.fetch;
  try {
    for (const file of (await readdir("db"))
      .filter((f) => f.endsWith(".sql") && !f.startsWith("002-"))
      .sort())
      await db.exec(
        (await readFile("db/" + file, "utf8")).replace(
          "CREATE EXTENSION IF NOT EXISTS pgcrypto;",
          "",
        ),
      );
    await server.start();
    const specs = await loadSpecifications();
    for (const spec of specs.pages)
      await query(
        "INSERT INTO pages(id,path,template,title,kind) VALUES($1,$2,'site-plan',$3,'service')",
        [spec.databaseId, spec.path, spec.title],
      );
    const first = await importSpecifications(specs, true),
      second = await importSpecifications(specs, true);
    assert.ok("importId" in first && "importId" in second);
    assert.equal(first.importId, second.importId);
    assert.equal((await query("SELECT * FROM page_specs")).length, specs.pages.length);
    const about = specs.pages.find((p) => p.path === "/about")!;
    const [base] = await query(
      "INSERT INTO revisions(page_id,content,validation,origin) VALUES($1,$2,'{}','test') RETURNING id",
      [
        about.databaseId,
        JSON.stringify({
          title: "Original About",
          description: "Original description",
          texts: {},
          schemaVersion: 1,
        }),
      ],
    );
    await query(
      "UPDATE pages SET draft_revision_id=$1,published_revision_id=$1 WHERE id=$2",
      [base.id, about.databaseId],
    );
    const [run] = await queuePages({
      paths: ["/about"],
      provider: "openrouter",
      model: "mock/model",
      imageModel: "mock/image",
    });
    const [broaderRun] = await queuePages({
      paths: ["/services"],
      provider: "openrouter",
      model: "mock/model",
      imageModel: "mock/image",
    });
    assert.ok(
      broaderRun,
      "Broader generation does not require pilot acceptance",
    );
    await query("UPDATE pipeline_runs SET status='cancelled' WHERE id=$1", [
      broaderRun,
    ]);
    await saveProviderCredentials({
      provider: "openrouter",
      apiKey: "mock-only-key",
    });
    globalThis.fetch = async (url, options) => {
      if (String(url).endsWith("/models"))
        return Response.json({
          data: [
            {
              id: "mock/model",
              supported_parameters: ["temperature", "response_format"],
            },
          ],
        });
      const body = JSON.parse(String(options?.body)),
        request = JSON.parse(body.messages[1].content);
      let result: unknown;
      if (request.requirements && request.schema) {
        assert.equal(body.temperature, 0.4);
        result = {
          searchIntent: "navigational",
          audience: "Buyers evaluating Netofficials",
          primaryKeyword: "about netofficials",
          secondaryKeywords: ["india software company"],
          entities: ["software development"],
          buyerQuestions: ["Who is Netofficials?"],
          angle: "A team planned around your project",
          outline: [],
          internalLinks: [{ path: "/contact", anchor: "contact" }],
          metaTitle: "About Netofficials | India Software Development",
          metaDescription: "Learn who Netofficials is and how the India-based team plans software projects with international clients before any build starts.",
          images: [],
        };
      } else if (request.exactSectionIds) {
        assert.equal(body.temperature, 0);
        result = Object.fromEntries(
          about.sections.map((s) => [
            s.id,
            {
              recommended_component:
                s.id === "hero"
                  ? "HeroSplit"
                  : s.id === "cta-banner"
                    ? "DarkCtaBand"
                    : "CardGrid3Col",
              spacing_above: 0,
              background: "#ffffff",
              max_width: "1320px",
              mobile_stack: "Stack",
            },
          ]),
        );
      } else {
        assert.equal(body.temperature, 0.5);
        result = Object.fromEntries(
          request.exactFields.map((key: string) => [
            key,
            key === "h1"
              ? "About Netofficials"
              : key === "subheadline"
                ? "India-based development services for businesses planning software."
                : key === "heading"
                  ? "Section heading"
                  : "",
          ]),
        );
      }
      return Response.json({
        model: "mock/model",
        usage: { total_tokens: 100 },
        choices: [
          {
            finish_reason: "stop",
            message: { content: JSON.stringify(result) },
          },
        ],
      });
    };
    // An owner edits the draft while generation is running.
    const [newer] = await query(
      "INSERT INTO revisions(page_id,content,validation,origin) VALUES($1,$2,'{}','owner') RETURNING id",
      [
        about.databaseId,
        JSON.stringify({
          title: "Newer About",
          description: "Owner updated description",
          texts: {},
          schemaVersion: 1,
        }),
      ],
    );
    await query("UPDATE pages SET draft_revision_id=$1 WHERE id=$2", [
      newer.id,
      about.databaseId,
    ]);
    // Every hero is an image slot; this test covers text, so the hero
    // illustration is supplied as an already generated asset.
    await query(
      "UPDATE pipeline_tasks SET status='completed',result=$2 WHERE run_id=$1 AND kind='asset'",
      [run, JSON.stringify({ id: "00000000-0000-4000-8000-000000000001", hash: "a".repeat(64), alt: "About illustration", width: 1200, height: 900, mime: "image/webp" })],
    );
    // One brief task, then one task per section.
    for (let i = 0; i < about.sections.length + 1; i++) assert.equal(await runPipelineTask(), true);
    const [page] = await query("SELECT * FROM pages WHERE id=$1", [
      about.databaseId,
    ]);
    assert.equal(page.published_revision_id, base.id);
    assert.equal(page.draft_revision_id, newer.id);
    const [completed] = await query("SELECT * FROM pipeline_runs WHERE id=$1", [
      run,
    ]);
    assert.equal(
      completed.status,
      "review",
      JSON.stringify(
        await query(
          "SELECT kind,section_id,error FROM pipeline_tasks WHERE run_id=$1 AND status='failed' UNION ALL SELECT 'run',status,error FROM pipeline_runs WHERE id=$1",
          [run],
        ),
      ),
    );
    assert.ok(completed.result_revision_id);
    const [revision] = await query(
      "SELECT content,validation FROM revisions WHERE id=$1",
      [completed.result_revision_id],
    );
    assert.equal(revision.content.schemaVersion, 3);
    assert.match(revision.validation.warnings[0], /newer draft/);
    // Review no longer requires an illustration or content quality approval.
    const { reviewPage } = await import("../src/admin-review");
    await query("UPDATE pages SET draft_revision_id=$1 WHERE id=$2", [completed.result_revision_id, about.databaseId]);
    const [reviewOwner] = await query("INSERT INTO owners(email,password_hash) VALUES('review@example.test','test') RETURNING id");
    await reviewPage(about.databaseId, completed.result_revision_id, reviewOwner.id);
    const { publishPage } = await import("../src/admin-publish");
    // Mock copy fails content QA, so publishing needs a recorded override.
    await assert.rejects(publishPage(about.databaseId, reviewOwner.id), /Publishing blocked/);
    const publishedPage = await publishPage(about.databaseId, reviewOwner.id, undefined, "Integration test override");
    assert.equal(publishedPage.published_revision_id, completed.result_revision_id);
    assert.equal(publishedPage.path, "/about");
    await assert.rejects(publishPage(about.databaseId, reviewOwner.id, "00000000-0000-4000-8000-000000000001"), /Revision missing/);
    await query("UPDATE pages SET draft_revision_id=$1 WHERE id=$2", [newer.id, about.databaseId]);
    // Accepted revisions keep their review history independently of later drafts.
    await query(
      "INSERT INTO revision_reviews(revision_id,status) VALUES($1,'accepted') ON CONFLICT(revision_id) DO UPDATE SET status='accepted'",
      [completed.result_revision_id],
    );
    await query(
      "UPDATE pipeline_runs SET review_status='pending' WHERE id=$1",
      [run],
    );
    assert.equal(
      (
        await query(
          "SELECT status FROM revision_reviews WHERE revision_id=$1",
          [completed.result_revision_id],
        )
      )[0].status,
      "accepted",
    );
    // Selective regeneration carries reviewed fields forward and blocks duplicates.
    await query("UPDATE pages SET draft_revision_id=$1 WHERE id=$2", [
      completed.result_revision_id,
      about.databaseId,
    ]);
    const firstSection = specs.pages.find((p) => p.path === "/about")!
      .sections[0].id;
    const [selective] = await queuePages({
      paths: ["/about"],
      provider: "openrouter",
      model: "mock/model",
      imageModel: "mock/image",
      scope: "sections",
      sectionIds: [firstSection],
      baseRevisionId: completed.result_revision_id,
    });
    assert.equal(
      (
        await query(
          "SELECT count(*)::int n FROM pipeline_tasks WHERE run_id=$1 AND status='queued'",
          [selective],
        )
      )[0].n,
      1,
    );
    await assert.rejects(
      queuePages({
        paths: ["/about"],
        provider: "openrouter",
        model: "mock/model",
        imageModel: "mock/image",
      }),
      /already active/,
    );
    await runPipelineTask();
    const [selectiveRun] = await query(
      "SELECT * FROM pipeline_runs WHERE id=$1",
      [selective],
    );
    const [selectiveRevision] = await query(
      "SELECT content FROM revisions WHERE id=$1",
      [selectiveRun.result_revision_id],
    );
    assert.deepEqual(
      selectiveRevision.content.pageSections.slice(1),
      revision.content.pageSections.slice(1),
    );
    const [cancelled] = await queuePages({
      paths: ["/about"],
      provider: "openrouter",
      model: "mock/model",
      imageModel: "mock/image",
    });
    await cancelRun(cancelled);
    assert.equal(
      (
        await query("SELECT status FROM pipeline_runs WHERE id=$1", [cancelled])
      )[0].status,
      "cancelled",
    );
    assert.equal(
      (
        await query(
          "SELECT count(*)::int n FROM pipeline_tasks WHERE run_id=$1 AND status='queued'",
          [cancelled],
        )
      )[0].n,
      0,
    );
    const [lateRun] = await queuePages({
      paths: ["/about"],
      provider: "openrouter",
      model: "mock/model",
      imageModel: "mock/image",
      scope: "sections",
      sectionIds: [firstSection],
      baseRevisionId: selectiveRun.result_revision_id,
    });
    const responseFetch = globalThis.fetch;
    globalThis.fetch = async (url, options) => {
      if (String(url).includes("/chat/completions")) await cancelRun(lateRun);
      return responseFetch(url, options);
    };
    await runPipelineTask();
    globalThis.fetch = responseFetch;
    const [late] = await query(
      "SELECT status,result_revision_id FROM pipeline_runs WHERE id=$1",
      [lateRun],
    );
    assert.equal(late.status, "cancelled");
    assert.equal(
      late.result_revision_id,
      null,
      "Late provider results cannot create an adopted draft",
    );
    const pageInventory = await consoleList(
      "pages",
      listSchema.parse({ size: 25 }),
    );
    assert.equal(pageInventory.total, specs.pages.length);
    assert.equal(pageInventory.rows.length, 25);
    assert.equal("content" in pageInventory.rows[0], false);
    assert.throws(() => listSchema.parse({ size: 10000 }));
    await query(
      "INSERT INTO settings(key,value) VALUES('ses_credentials','{\"ciphertext\":\"must-not-leak\"}')",
    );
    assert.equal("ses_credentials" in (await consoleSettings()).values, false);
    await query("DELETE FROM settings WHERE key='ses_credentials'");
    for (let i = 0; i < 205; i++)
      await query(
        "INSERT INTO leads(request_id,data,status) VALUES(gen_random_uuid(),$1,'New')",
        [JSON.stringify({ service: "Software" })],
      );
    const metrics = await consoleOverview(30);
    assert.equal(metrics.counts.enquiries, 205);
    assert.equal(metrics.counts.unprocessed, 205);
    assert.equal(
      (await consoleList("leads", listSchema.parse({ page: 9, size: 25 }))).rows
        .length,
      5,
    );
    for (const resource of [
      "production",
      "media",
      "subscribers",
      "outbox",
      "vacancies",
      "applications",
      "activity",
    ]) {
      const result = await consoleList(resource, listSchema.parse({}));
      assert.equal(typeof result.total, "number");
    }
    assert.ok(
      (
        await consoleList("production", listSchema.parse({ status: "history" }))
      ).rows.some((r) => r.status === "cancelled"),
    );
    const [mobileRun] = await queuePages({
      paths: ["/mobile-app-development"],
      provider: "openrouter",
      model: "mock/model",
      imageModel: "mock/image",
    });
    await query(
      "UPDATE pipeline_tasks SET status='completed',result='{}' WHERE run_id=$1",
      [mobileRun],
    );
    await query(
      "UPDATE pipeline_tasks SET status='failed',error='Missing image credential' WHERE run_id=$1 AND kind='asset'",
      [mobileRun],
    );
    const successfulBefore = (
      await query(
        "SELECT id FROM pipeline_tasks WHERE run_id=$1 AND status='completed'",
        [mobileRun],
      )
    ).length;
    await query("UPDATE pipeline_runs SET status='failed' WHERE id=$1", [
      mobileRun,
    ]);
    await retryRun(mobileRun);
    assert.equal(
      (
        await query(
          "SELECT id FROM pipeline_tasks WHERE run_id=$1 AND status='completed'",
          [mobileRun],
        )
      ).length,
      successfulBefore,
    );
    assert.equal(
      (
        await query(
          "SELECT id FROM pipeline_tasks WHERE run_id=$1 AND status='queued'",
          [mobileRun],
        )
      ).length,
      1,
    );
    const confirmation = "1".repeat(64),
      unsub = "2".repeat(64);
    await query(
      "INSERT INTO newsletter_subscribers(email,confirmation_hash,confirmation_expires_at,unsubscribe_hash) VALUES('subscriber@example.test',$1,now()+interval '1 hour',$2)",
      [tokenHash(confirmation), tokenHash(unsub)],
    );
    assert.equal(await confirmSubscription(confirmation), true);
    assert.equal(await confirmSubscription(confirmation), false);
    const png = await sharp({
      create: { width: 480, height: 360, channels: 3, background: "#ffffff" },
    })
      .png()
      .toBuffer();
    globalThis.fetch = async (url, options) =>
      String(url).endsWith("/images/models")
        ? Response.json({
            data: [
              {
                id: "mock/image",
                supported_parameters: { aspect_ratio: { values: ["4:3"] } },
              },
            ],
          })
        : String(url).endsWith("/endpoints")
          ? Response.json({
              endpoints: [
                {
                  provider_tag: "mock",
                  supported_parameters: {
                    aspect_ratio: { values: ["4:3"] },
                    quality: { values: ["low", "medium", "high"] },
                    output_format: { values: ["png"] },
                  },
                },
              ],
            })
          : (assert.equal(JSON.parse(String(options?.body)).quality, "medium"), Response.json({
              data: [
                { media_type: "image/png", b64_json: png.toString("base64") },
              ],
              usage: { cost: 0.01 },
            }));
    const asset = await generateHero({
      runId: mobileRun,
      sectionId: "hero",
      model: "mock/image",
      prompt: "Flat conceptual illustration",
      ratio: "4:3",
      alt: "Conceptual mobile illustration",
    });
    assert.equal(asset.reference.mime, "image/webp");
    assert.equal(asset.reference.width, 480);
    const [stored] = await query("SELECT * FROM generated_assets WHERE id=$1", [
      asset.reference.id,
    ]);
    assert.ok(stored.source_filename.endsWith(".png"));
    assert.ok(stored.filename.endsWith(".webp"));
    assert.equal(stored.review_status, "pending");
    await cancelRun(mobileRun);
    const mobileSpec = specs.pages.find(
      (p) => p.path === "/mobile-app-development",
    )!;
    const mobileBase = {
      ...revision.content,
      title: "Mobile applications",
      pageBlueprint: Object.fromEntries(
        mobileSpec.sections.map((s) => [
          s.id,
          {
            recommended_component:
              s.id === "cta-banner" ? "DarkCtaBand" : "HeroSplit",
            spacing_above: 0,
            background: "#ffffff",
            max_width: "1320px",
            mobile_stack: "Stack",
          },
        ]),
      ),
      pageSections: mobileSpec.sections.map((s) => ({
        id: s.id,
        order: s.order,
        fields: Object.fromEntries(s.fields.map((key) => [key, ""])),
        evidenceIds: [],
        omitted: false,
        ...(s.hero ? { asset: asset.reference } : {}),
      })),
    };
    const [mobileDraft] = await query(
      "INSERT INTO revisions(page_id,content,validation,origin) VALUES($1,$2,'{}','test') RETURNING id",
      [mobileSpec.databaseId, JSON.stringify(mobileBase)],
    );
    await query("UPDATE pages SET draft_revision_id=$1 WHERE id=$2", [
      mobileDraft.id,
      mobileSpec.databaseId,
    ]);
    const [imageOnly] = await queuePages({
      paths: [mobileSpec.path],
      provider: "openrouter",
      model: "mock/model",
      imageModel: "mock/image",
      scope: "image",
      baseRevisionId: mobileDraft.id,
    });
    const imageTasks = await query(
      "SELECT kind,section_id,status,result FROM pipeline_tasks WHERE run_id=$1",
      [imageOnly],
    );
    assert.equal(imageTasks.filter((t) => t.status === "queued").length, 1);
    assert.equal(imageTasks.find((t) => t.status === "queued")!.kind, "asset");
    assert.deepEqual(
      imageTasks.find((t) => t.kind === "section" && t.section_id === "hero")!
        .result,
      mobileBase.pageSections.find((s: {id:string}) => s.id === "hero")!.fields,
    );
    await cancelRun(imageOnly);
    const files = await backupFiles();
    assert.equal(files.length, 2);
    await restoreFiles(files);
    await assert.rejects(
      restoreFiles([{ ...files[0], filename: "../escape.png" }]),
      /Invalid/,
    );
    await assert.rejects(
      generateHero({
        runId: mobileRun,
        sectionId: "hero",
        model: "mock/image",
        prompt: "Flat art",
        ratio: "1:1",
        alt: "Conceptual art",
      }),
      /aspect ratio/,
    );
    const originalSend = SESv2Client.prototype.send;
    let production = false;
    (SESv2Client.prototype as any).send = async (command: any) => {
      const name = command.constructor.name;
      if (name === "GetAccountCommand")
        return { SendingEnabled: true, ProductionAccessEnabled: production };
      if (name === "GetEmailIdentityCommand")
        return { VerifiedForSendingStatus: true };
      if (name === "GetSuppressedDestinationCommand")
        throw Object.assign(new Error("Missing"), {
          name: "NotFoundException",
        });
      return { MessageId: "mock-ses-message" };
    };
    try {
      process.env.SITE_URL = "https://netofficials.example";
      await saveSesSettings({
        region: "us-east-1",
        accessKeyId: "ABCDEFGHIJKLMNOP",
        secretAccessKey: "x".repeat(40),
        identity: "netofficials.example",
        sender: "hello@netofficials.example",
        replyTo: "hello@netofficials.example",
        notificationRecipient: "owner@netofficials.example",
        careersRecipient: "careers@netofficials.example",
        configurationSet: "netofficials",
        snsTopicArn: "arn:aws:sns:us-east-1:123456789012:netofficials",
        retentionDays: 180,
      });
      await checkSes(true);
      assert.equal(await newsletterReady(), false);
      production = true;
      await checkSes(false);
      assert.equal(await newsletterReady(), false);
      await query(
        "UPDATE settings SET value=jsonb_set(value,'{deliveryConfirmed}','true'::jsonb) WHERE key='ses_delivery_status'",
      );
      assert.equal(await newsletterReady(), true);
      await subscribe("new@example.test");
      await subscribe("new@example.test");
      assert.equal(
        (
          await query(
            "SELECT id FROM newsletter_subscribers WHERE email='new@example.test'",
          )
        ).length,
        1,
      );
      assert.equal(
        (
          await query(
            "SELECT id FROM email_outbox WHERE recipient='new@example.test'",
          )
        ).length,
        1,
      );
      assert.equal(await sendOutbox(), true);
      assert.equal(
        (
          await query(
            "SELECT status FROM email_outbox WHERE recipient='new@example.test'",
          )
        )[0].status,
        "sent",
      );
      await query(
        "UPDATE newsletter_subscribers SET status='suppressed' WHERE email='new@example.test'",
      );
      await queueEmail(
        "new@example.test",
        "Confirmation",
        "Body",
        "newsletter-confirm",
        "test-suppression",
      );
      await sendOutbox();
      assert.equal(
        (
          await query(
            "SELECT status FROM email_outbox WHERE dedupe_key='test-suppression'",
          )
        )[0].status,
        "suppressed",
      );
    } finally {
      SESv2Client.prototype.send = originalSend;
    }
    const [closed] = await query(
      "INSERT INTO vacancies(slug,title,department,location,employment_type,description,status,verified) VALUES('test-role','Test role','Engineering','India','Full-time','Verified test fixture in an isolated database only.','closed',true) RETURNING id",
    );
    const application = new FormData();
    for (const [key, value] of Object.entries({
      vacancyId: closed.id,
      name: "Test applicant",
      email: "applicant@example.test",
      consent: "on",
    }))
      application.set(key, value);
    application.set(
      "cv",
      new File([Buffer.from("%PDF-1.7\nexample\n%%EOF")], "cv.pdf", {
        type: "application/pdf",
      }),
    );
    await assert.rejects(submitApplication(application), /not accepting/);
    await query("UPDATE vacancies SET status='open' WHERE id=$1", [closed.id]);
    delete process.env.CLAMAV_HOST;
    await assert.rejects(
      submitApplication(application),
      /scanning is unavailable/,
    );
    assert.equal((await query("SELECT id FROM career_applications")).length, 0);
    await unsubscribe(unsub);
    assert.equal(
      (
        await query(
          "SELECT status FROM newsletter_subscribers WHERE email='subscriber@example.test'",
        )
      )[0].status,
      "unsubscribed",
    );
    await query(
      "UPDATE newsletter_subscribers SET status='pending',confirmation_hash=$1,confirmation_expires_at=now()-interval '1 hour'",
      [tokenHash(confirmation)],
    );
    assert.equal(await confirmSubscription(confirmation), false);
  } finally {
    globalThis.fetch = originalFetch;
    await pool().end();
    await server.stop();
    await db.close();
    await rm(tmp, { recursive: true, force: true });
  }
});



