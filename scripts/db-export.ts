import { loadEnvLocal } from "./load-env-local.mjs";
import { exportMeetingsFromDatabase } from "../lib/koseki/meetings";

loadEnvLocal();

async function main() {
  const count = await exportMeetingsFromDatabase();
  console.log(`Exported ${count} meeting(s) to content/koseki-monthly-meeting/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
