import { $, glob } from "zx";

/**
 * Reset the local d1 database violently.
 * This will only work locally
 */

await $`rm -rf ./.wrangler ./drizzle`;
await $`pnpm drizzle:generate`;
await $`wrangler d1 migrations apply rcf-d1-dev --local`;

const sqliteFiles = await glob("./.wrangler/**/*.sqlite");
console.log({ sqliteFiles });

if (sqliteFiles.length !== 1) {
  console.error("Expected exactly one sqlite file under .wrangler");
  process.exit(1);
}

const statements = `
.schema
pragma table_list`;

await $`echo ${statements} | sqlite3 ${sqliteFiles[0]}`;

console.log(`sqlite3 ${sqliteFiles[0]}`);

// await $`sqlite3 ${sqliteFiles[0]} < scripts/reset-sqlite.sql`;
