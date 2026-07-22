import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

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
const required = [
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_STORAGE_BUCKET",
  "FIREBASE_MESSAGING_SENDER_ID",
  "FIREBASE_APP_ID",
  "FIREBASE_MEASUREMENT_ID",
];

const missing = required.filter((key) => !env[key]);
if (missing.length > 0) {
  throw new Error(`Missing Firebase env values: ${missing.join(", ")}`);
}

const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
  measurementId: env.FIREBASE_MEASUREMENT_ID,
};

const output = `import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};
const roleLists = ${JSON.stringify({
  owners: (env.FIREBASE_OWNER_EMAILS || "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean),
  editors: (env.FIREBASE_EDITOR_EMAILS || "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean),
}, null, 2)};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

isSupported()
  .then((supported) => {
    if (supported) getAnalytics(app);
  })
  .catch(() => {});

window.KANGNAM_FIREBASE = {
  app,
  auth,
  roleLists,
  onAuthStateChanged,
  signInWithPopup: () => signInWithPopup(auth, googleProvider),
  signOut: () => signOut(auth)
};

window.dispatchEvent(new CustomEvent("kangnam-firebase-ready"));

export { app, auth };
`;

mkdirSync(resolve(root, "app"), { recursive: true });
writeFileSync(resolve(root, "app", "firebase-config.js"), output, "utf8");
console.log("Generated app/firebase-config.js from .env.local");
