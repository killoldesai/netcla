import {
  loadSpecifications,
  importSpecifications,
} from "../src/page-spec-import";
import { pool } from "../src/db";
try {
  console.log(
    JSON.stringify(
      await importSpecifications(
        await loadSpecifications(),
        process.argv.includes("--apply"),
      ),
      null,
      2,
    ),
  );
} finally {
  await pool().end();
}
