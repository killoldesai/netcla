import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { assetRoot } from "./production-assets";
import { cvRoot } from "./careers";
export const publishingTables = [
  "page_spec_imports",
  "page_specs",
  "pipeline_runs",
  "pipeline_tasks",
  "generated_assets",
  "newsletter_subscribers",
  "email_outbox",
  "vacancies",
  "career_applications",
  "revision_reviews",
];
export async function backupFiles() {
  const entries: {
    kind: string;
    filename: string;
    hash: string;
    data: string;
  }[] = [];
  for (const [kind, root] of [
    ["assets", assetRoot()],
    ["cvs", cvRoot()],
  ]) {
    const files = await readdir(root).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return [];
      throw error;
    });
    for (const filename of files) {
      if (
        !(
          kind === "assets"
            ? /^[a-f0-9]{64}\.(png|webp|svg)$/
            : /^[a-f0-9-]{36}\.(pdf|docx)$/
        ).test(filename)
      )
        continue;
      const bytes = await readFile(path.join(root, filename));
      entries.push({
        kind,
        filename,
        hash: createHash("sha256").update(bytes).digest("hex"),
        data: bytes.toString("base64"),
      });
    }
  }
  return entries;
}
export async function restoreFiles(input: unknown) {
  if (!Array.isArray(input)) throw new Error("Invalid persistent file backup");
  for (const file of input) {
    if (
      !file ||
      !["assets", "cvs"].includes(file.kind) ||
      typeof file.filename !== "string" ||
      !(
        file.kind === "assets"
          ? /^[a-f0-9]{64}\.(png|webp|svg)$/
          : /^[a-f0-9-]{36}\.(pdf|docx)$/
      ).test(file.filename) ||
      typeof file.data !== "string" ||
      file.data.length > 30000000
    )
      throw new Error("Invalid persistent file record");
    const bytes = Buffer.from(file.data, "base64");
    if (createHash("sha256").update(bytes).digest("hex") !== file.hash)
      throw new Error("Backup file checksum failed");
    const root = file.kind === "assets" ? assetRoot() : cvRoot();
    await mkdir(root, { recursive: true, mode: 0o700 });
    const target = path.join(root, file.filename);
    try {
      const current = await readFile(target);
      if (createHash("sha256").update(current).digest("hex") !== file.hash)
        throw new Error("Existing file differs from backup");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      await writeFile(target, bytes, { flag: "wx", mode: 0o600 });
    }
  }
}
