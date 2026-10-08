import { isDeepStrictEqual } from "node:util";
import { loadSpecifications } from "../src/page-spec-import";
import { credentialStatus } from "../src/provider-credentials";
import { query, pool } from "../src/db";
try {
  const source = await loadSpecifications();
  const saved = await query(
    "SELECT s.path,s.page_id,s.specification,i.checksum FROM page_specs s JOIN page_spec_imports i ON i.id=s.import_id WHERE s.import_id=(SELECT id FROM page_spec_imports ORDER BY created_at DESC LIMIT 1)",
  );
  const mismatches = source.pages
    .filter((page) => {
      const stored = saved.find((row) => row.path === page.path);
      return (
        !stored ||
        stored.page_id !== page.databaseId ||
        stored.checksum !== source.checksum ||
        !isDeepStrictEqual(stored.specification, page)
      );
    })
    .map((page) => page.path);
  console.log(
    JSON.stringify(
      {
        pages: saved.length,
        sections: source.sectionCount,
        heroes: source.heroes,
        mismatches,
        credentials: await credentialStatus(),
      },
      null,
      2,
    ),
  );
  if (mismatches.length || saved.length !== source.pages.length)
    process.exitCode = 1;
} finally {
  await pool().end();
}
