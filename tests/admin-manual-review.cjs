const { build } = require("esbuild");
const assert = require("node:assert/strict");
const Module = require("node:module");
const path = require("node:path");
(async () => {
  const bundle = await build({
    stdin: {
      contents:
        'export {POST} from "./app/api/admin/route"; export {getDesign} from "./src/designs"; export {contentSchema} from "./src/content";',
      resolveDir: process.cwd(),
      loader: "ts",
    },
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    packages: "external",
    plugins: [
      {
        name: "test-database",
        setup(build) {
          build.onResolve({ filter: /^@\/db$/ }, () => ({
            path: "db",
            namespace: "test",
          }));
          build.onResolve({ filter: /^@\/auth$/ }, () => ({
            path: "auth",
            namespace: "test",
          }));
          build.onLoad({ filter: /.*/, namespace: "test" }, (args) => ({
            contents:
              args.path === "db"
                ? "export const query=(sql,params)=>globalThis.reviewQuery(sql,params); export const transaction=(fn)=>fn({query:async(sql,params)=>({rows:await globalThis.reviewQuery(sql,params)})});"
                : 'export async function requireOwner(){if(!globalThis.reviewAuthorized)throw new Error("Unauthorized"); return {id:"test"};} export function assertOrigin(req){if(req.headers.get("origin")!=="http://review.test")throw new Error("Invalid origin");}',
            loader: "js",
          }));
        },
      },
    ],
  });
  const filename = path.join(
    process.cwd(),
    "tests",
    "manual-review-bundle.cjs",
  );
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  mod._compile(bundle.outputFiles[0].text, filename);
  const { POST, getDesign, contentSchema } = mod.exports;
  const id = "00000000-0000-4000-8000-000000000001",
    revisionId = "00000000-0000-4000-8000-000000000002";
  const design = getDesign("custom-software");
  const content = contentSchema.parse({
    title: design.title,
    description: "A sufficiently detailed description for this page.",
    texts: design.texts,
    author: "Owner supplied name",
    unresolved: ["Review company facts manually"],
    sources: [id],
    claims: [{ text: "Owner reviewed claim", factId: id }],
  });
  const p = {
    id,
    path: design.path,
    template: design.id,
    draft_revision_id: revisionId,
    brief: { evidenceApproved: false },
  };
  const revision = {
    id: revisionId,
    content,
    origin: "ai:test",
    validation: {
      errors: [
        "Source is not approved",
        "AI altered a manually maintained fact or price: t2",
      ],
    },
  };
  let queries = [];
  globalThis.reviewAuthorized = true;
  globalThis.reviewQuery = async (sql, params) => {
    queries.push(sql);
    if (sql.startsWith("SELECT * FROM pages")) return [p];
    if (sql.startsWith("SELECT * FROM revisions")) return [revision];
    if (sql.startsWith("SELECT path FROM pages")) {
      assert.ok(!sql.includes("published_revision_id"), "Draft page references must be accepted when publishing");
      return ["/contact", "/how-we-work", "/services"].map(path => ({path}));
    }
    if (sql.startsWith("UPDATE pages SET published_revision_id=$1")) {
      p.published_revision_id = params[0];
      p.title = params[1];
      return [p];
    }
    if (sql.startsWith("UPDATE pages SET published_revision_id=NULL")) {
      p.published_revision_id = null;
      return [p];
    }
    return [];
  };
  const call = (action, extra = {}) =>
    POST(
      new Request("http://review.test/api/admin", {
        method: "POST",
        headers: {
          Origin: "http://review.test",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, id, ...extra }),
      }),
    );
  const published = await call("publish");
  assert.equal(published.status, 200);
  assert.equal((await published.json()).page.published_revision_id, revisionId);
  assert.ok(
    queries.some((sql) =>
      sql.includes("UPDATE pages SET published_revision_id=$1"),
    ),
  );
  const unpublished = await call("unpublish");
  assert.equal(unpublished.status, 200);
  assert.equal((await unpublished.json()).page.published_revision_id, null);
  queries = [];
  const revoked = await call("approve-fact", { approved: false });
  assert.equal(revoked.status, 200);
  assert.ok(!queries.some((sql) => sql.includes("UPDATE pages")));
  content.texts[Object.keys(content.texts)[0]] = "<script>alert(1)</script>";
  const unsafe = await call("publish");
  assert.equal(unsafe.status, 400);
  assert.match(await unsafe.text(), /Executable markup/);
  content.texts = { ...design.texts };
  content.schemaVersion = 2;
  content.hero = { heading: "Custom software", body: "Discuss your project with our team.", ctaLabel: "Contact us", ctaPath: "/contact" };
  content.sections = [{id: "section-1", heading: "Next steps", level: 2, paragraphs: ["Review the available services and delivery process."], items: [], cards: [], faqs: [], table: {columns: [], rows: []}, links: [{label: "How we work", path: "/how-we-work"}, {label: "Services", path: "/services"}]}];
  p.brief = {sitePlan: true, headings: [{id: "section-1", heading: "Next steps", level: 2}]};
  const withDraftLinks = await call("publish");
  assert.equal(withDraftLinks.status, 200, await withDraftLinks.text());
  content.hero.ctaPath = "/missing-page";
  const missingLink = await call("publish");
  assert.equal(missingLink.status, 400);
  assert.match(await missingLink.text(), /Unresolved page reference: \/missing-page/);
  for (const initialStatus of ["queued", "running", "completed"]) {
    let jobStatus = initialStatus;
    globalThis.reviewQuery = async (sql, params) => {
      if (sql.startsWith("UPDATE jobs SET status='cancelled'")) {
        assert.equal(params[0], id);
        assert.ok(sql.includes("status IN ('running','queued')"));
        assert.ok(sql.includes("lease_token=NULL"));
        if (["running", "queued"].includes(jobStatus)) {
          jobStatus = "cancelled";
          return [{ id }];
        }
      }
      return [];
    };
    const response = await call("cancel");
    assert.equal(response.status, 200);
    assert.equal(jobStatus, initialStatus === "completed" ? "completed" : "cancelled");
    assert.match((await response.json()).message, initialStatus === "completed" ? /no longer active/ : /Generation cancelled/);
  }
  globalThis.reviewAuthorized = false;
  assert.notEqual((await call("publish")).status, 200);
  assert.notEqual((await call("cancel")).status, 200);
  console.log(
    "Manual publication accepts unapproved references and old evidence errors; changing research does not unpublish pages; markup and authentication checks remain enforced.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
