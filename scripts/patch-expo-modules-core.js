/**
 * Sửa expo-modules-core cho web:
 * 1. Trỏ package.json main/exports về index.js (bản npm thiếu src/).
 * 2. Ghi stub index.js (requireOptionalNativeModule, CodedError) để expo-constants không crash.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const coreDir = path.join(root, "node_modules", "expo-modules-core");
const pkgPath = path.join(coreDir, "package.json");
const indexPath = path.join(coreDir, "index.js");
const stubPath = path.join(__dirname, "expo-modules-core-web-stub.js");

if (!fs.existsSync(pkgPath)) {
  process.exit(0);
}

// 1. Patch package.json
let json;
try {
  json = fs.readFileSync(pkgPath, "utf8");
} catch {
  process.exit(0);
}

if (!/"main"\s*:\s*"index\.js"/.test(json) || !/"default"\s*:\s*"\.\/index\.js"/.test(json)) {
  const fixed = json
    .replace(/"main"\s*:\s*"src\/index\.ts"/g, '"main": "index.js"')
    .replace(/"default"\s*:\s*"\.\/src\/index\.ts"/g, '"default": "./index.js"');
  if (fixed !== json) {
    fs.writeFileSync(pkgPath, fixed);
    console.log("patched expo-modules-core/package.json");
  }
}

// 2. Ghi stub index.js cho web (requireOptionalNativeModule, CodedError)
if (fs.existsSync(stubPath)) {
  const stub = fs.readFileSync(stubPath, "utf8");
  fs.writeFileSync(indexPath, stub);
  console.log("patched expo-modules-core/index.js (web stub)");
}
