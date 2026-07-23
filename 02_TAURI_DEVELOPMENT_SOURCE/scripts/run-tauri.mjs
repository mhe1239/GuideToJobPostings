import { existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const mode = process.argv[2];
if (mode !== "dev" && mode !== "build") {
  console.error("사용법: node scripts/run-tauri.mjs <dev|build>");
  process.exit(2);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const environment = { ...process.env };

if (process.platform === "darwin") {
  const commandLineTools = "/Library/Developer/CommandLineTools";
  const sdk = `${commandLineTools}/SDKs/MacOSX.sdk`;
  const clang = `${commandLineTools}/usr/bin/clang`;
  const selectedToolchainWorks = spawnSync("xcrun", ["--find", "clang"], { stdio: "ignore" }).status === 0;

  if (!selectedToolchainWorks && existsSync(sdk) && existsSync(clang)) {
    environment.DEVELOPER_DIR = commandLineTools;
    environment.SDKROOT = sdk;
    environment.CC = clang;
    environment.CXX = `${commandLineTools}/usr/bin/clang++`;
    const rustTarget = process.arch === "arm64" ? "AARCH64" : "X86_64";
    environment[`CARGO_TARGET_${rustTarget}_APPLE_DARWIN_LINKER`] = clang;
    console.log("선택된 Xcode 도구를 사용할 수 없어 설치된 Command Line Tools로 Tauri를 실행합니다.");
  }
}

const executable = process.platform === "win32"
  ? resolve(root, "node_modules", ".bin", "tauri.cmd")
  : resolve(root, "node_modules", ".bin", "tauri");

if (!existsSync(executable)) {
  console.error("Tauri CLI가 없습니다. 먼저 npm install을 실행해 주세요.");
  process.exit(1);
}

const command = process.platform === "win32" ? (process.env.ComSpec || "cmd.exe") : executable;
const args = process.platform === "win32"
  ? ["/d", "/c", executable, mode]
  : [mode];

const child = spawn(command, args, {
  cwd: root,
  env: environment,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(`Tauri ${mode} 실행 실패:`, error.message);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
