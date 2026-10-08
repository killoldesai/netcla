import { parse } from "csv-parse/sync";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { transaction } from "./db";
import { internalPath, type PageSpecification } from "./page-spec-schema";
const sourceDirectory = () =>
  process.env.PAGE_SPEC_SOURCE_DIR ?? "research docs/Claude";

export function reconcileSpecifications(
  files: { name: string; text: string }[],
) {
  const pages = new Map<string, PageSpecification>();
  let rawRows = 0;
  for (const file of files) {
    const rows = parse(file.text, {
      columns: true,
      bom: true,
      skip_empty_lines: true,
    }) as Record<string, string>[];
    rawRows += rows.length;
    const grouped = new Map<string, Record<string, string>[]>();
    for (const row of rows) {
      for (const key of [
        "url",
        "database_page_id",
        "section_id",
        "section_order",
        "section_fields",
        "section_content_prompt",
      ])
        if (!row[key]?.trim())
          throw new Error("Missing required column " + key);
      internalPath.parse(row.url);
      if (!/^[a-f0-9-]{36}$/i.test(row.database_page_id))
        throw new Error("Invalid database page identity");
      grouped.set(row.url, [...(grouped.get(row.url) ?? []), row]);
    }
    for (const [path, pageRows] of grouped) {
      const ids = pageRows.map((r) => r.section_id);
      if (new Set(ids).size !== ids.length)
        throw new Error("Duplicate sections: " + path);
      const ordered = [...pageRows].sort(
        (a, b) => Number(a.section_order) - Number(b.section_order),
      );
      if (ordered.some((r, i) => Number(r.section_order) !== i))
        throw new Error("Invalid section ordering: " + path);
      if (ordered[0]?.section_id !== "page-blueprint")
        throw new Error("Missing page blueprint: " + path);
      if (
        pageRows.some(
          (r) => r.database_page_id !== pageRows[0].database_page_id,
        )
      )
        throw new Error("Conflicting page identities: " + path);
      const previous = pages.get(path);
      if (previous && previous.databaseId !== pageRows[0].database_page_id)
        throw new Error("Conflicting source page identities: " + path);
      pages.set(path, {
        path,
        databaseId: pageRows[0].database_page_id,
        title: pageRows[0].proposed_title,
        source: file.name,
        blueprintPrompt: ordered[0].section_content_prompt,
        originalRows: pageRows,
        sections: ordered.slice(1).map((r) => {
          const fields = r.section_fields.split("|").map((f) => f.trim());
          if (
            new Set(fields).size !== fields.length ||
            fields.some((f) => !/^[a-z][a-z0-9_]*$/.test(f))
          )
            throw new Error("Invalid section field list: " + path);
          return {
            id: r.section_id,
            order: Number(r.section_order),
            name: r.section_name,
            layout: r.section_layout,
            fields,
            originalPrompt: r.section_content_prompt,
            hero:
              r.section_id === "hero" &&
              r.image_required.toLowerCase() === "yes",
            imagePrompt: r.image_prompt,
            ratio: r.image_aspect_ratio,
            originalRow: r,
          };
        }),
      });
    }
  }
  const checksum = createHash("sha256")
    .update(JSON.stringify(files))
    .digest("hex");
  return {
    checksum,
    files,
    rawRows,
    pages: [...pages.values()],
    sectionCount: [...pages.values()].reduce(
      (n, p) => n + p.sections.length,
      0,
    ),
    heroes: [...pages.values()].flatMap((p) => p.sections).filter((s) => s.hero)
      .length,
  };
}
export async function loadSpecifications() {
  const names = ["core-service-sections.csv", "hub-and-static-sections.csv"];
  try { await readFile(sourceDirectory() + "/supplemental-page-sections.csv"); names.push("supplemental-page-sections.csv"); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  const reconciled = reconcileSpecifications(
    await Promise.all(
      names.map(async (name) => ({
        name,
        text: await readFile(sourceDirectory() + "/" + name, "utf8"),
      })),
    ),
  );
  const promptSources = await Promise.all(
    ["master-icon-prompt.txt", "generation-pipeline-prompts.docx"].map(
      async (name) => ({
        name,
        encoding: name.endsWith("docx") ? "base64" : "utf8",
        content: (await readFile(sourceDirectory() + "/" + name)).toString(
          name.endsWith("docx") ? "base64" : "utf8",
        ),
      }),
    ),
  );
  return {
    ...reconciled,
    promptSources,
    checksum: createHash("sha256")
      .update(
        JSON.stringify({ files: reconciled.files, prompts: promptSources }),
      )
      .digest("hex"),
  };
}
export async function importSpecifications(
  input: Awaited<ReturnType<typeof loadSpecifications>>,
  apply = false,
) {
  return transaction(async (c) => {
    for (const page of input.pages) {
      const existing = await c.query("SELECT id FROM pages WHERE path=$1", [
        page.path,
      ]);
      if (existing.rows[0]?.id !== page.databaseId)
        throw new Error("Database identity unresolved: " + page.path);
    }
    if (!apply) return { ...summary(input), applied: false };
    const found = await c.query(
      "SELECT id FROM page_spec_imports WHERE checksum=$1",
      [input.checksum],
    );
    if (found.rows[0])
      return {
        ...summary(input),
        applied: true,
        unchanged: true,
        importId: found.rows[0].id,
      };
    const sources = input.promptSources;
    const imported = await c.query(
      "INSERT INTO page_spec_imports(checksum,sources,summary) VALUES($1,$2,$3) RETURNING id",
      [
        input.checksum,
        JSON.stringify({ csv: input.files, prompts: sources }),
        JSON.stringify(summary(input)),
      ],
    );
    for (const page of input.pages)
      await c.query(
        "INSERT INTO page_specs(import_id,page_id,path,specification) VALUES($1,$2,$3,$4)",
        [imported.rows[0].id, page.databaseId, page.path, JSON.stringify(page)],
      );
    return { ...summary(input), applied: true, importId: imported.rows[0].id };
  });
}
function summary(input: Awaited<ReturnType<typeof loadSpecifications>>) {
  return {
    checksum: input.checksum,
    rawRows: input.rawRows,
    pages: input.pages.length,
    sections: input.sectionCount,
    heroes: input.heroes,
  };
}
