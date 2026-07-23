import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.admin.local");

function loadEnv(path) {
  const env = {};
  const text = readFileSync(path, "utf8");

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    env[key] = value;
  }

  return env;
}

const env = loadEnv(envPath);
const primaryAdminEmail = (env.PRIMARY_ADMIN_EMAIL || "").trim().toLowerCase();

if (!primaryAdminEmail) {
  throw new Error("Missing admin env value: PRIMARY_ADMIN_EMAIL");
}

const output = `window.KANGNAM_ADMIN_CONFIG = ${JSON.stringify({ primaryAdminEmail }, null, 2)};
window.dispatchEvent(new CustomEvent("kangnam-admin-config-ready"));
`;

mkdirSync(resolve(root, "app"), { recursive: true });
writeFileSync(resolve(root, "app", "admin-config.js"), output, "utf8");
console.log("Generated app/admin-config.js from .env.admin.local");
