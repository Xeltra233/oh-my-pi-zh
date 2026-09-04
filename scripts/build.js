#!/usr/bin/env node
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, "..");

console.log("🔨 Building oh-my-pi-zh with esbuild...");
const cmd = `npx -y esbuild "${join(root, "src/extension.ts")}" --bundle --platform=node --target=node22 --format=esm --outfile="${join(root, "dist/extension.js")}" --external:@earendil-works/*`;

execSync(cmd, { stdio: "inherit" });
console.log("✅ Build complete: dist/extension.js");
