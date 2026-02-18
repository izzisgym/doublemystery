import { spawn } from "node:child_process";

const MAX_ATTEMPTS = Number(process.env.MIGRATION_MAX_ATTEMPTS || 5);
const BASE_DELAY_MS = Number(process.env.MIGRATION_RETRY_BASE_MS || 3000);

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", shell: true });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code}`));
    });
    child.on("error", reject);
  });
}

async function migrateWithRetry() {
  let attempt = 0;
  while (attempt < MAX_ATTEMPTS) {
    attempt += 1;
    try {
      await run("npx", ["prisma", "migrate", "deploy"]);
      return;
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS) throw error;
      const waitMs = BASE_DELAY_MS * attempt;
      console.warn(
        `Migration attempt ${attempt}/${MAX_ATTEMPTS} failed. Retrying in ${waitMs}ms.`
      );
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}

async function main() {
  await migrateWithRetry();
  await run("next", ["start"]);
}

main().catch((error) => {
  console.error("Startup failed:", error);
  process.exit(1);
});
