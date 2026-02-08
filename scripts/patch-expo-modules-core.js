/**
 * Patch expo-modules-core: dùng bản gốc (src/index.ts) cho CẢ web và native.
 * - Native cần requireNativeModule thật → không ghi đè index.js bằng stub.
 * - Web dùng requireNativeModule.web.ts (có sẵn trong package).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const coreDir = path.join(root, "node_modules", "expo-modules-core");
const pkgPath = path.join(coreDir, "package.json");
const indexPath = path.join(coreDir, "index.js");

if (!fs.existsSync(pkgPath)) {
  process.exit(0);
}

let json;
try {
  json = fs.readFileSync(pkgPath, "utf8");
} catch {
  process.exit(0);
}

// Khôi phục main/exports về src/index.ts nếu đang trỏ sang index.js (stub cũ)
if (/"main"\s*:\s*"index\.js"/.test(json)) {
  const fixed = json
    .replace(/"main"\s*:\s*"index\.js"/g, '"main": "src/index.ts"')
    .replace(/"default"\s*:\s*"\.\/index\.js"/g, '"default": "./src/index.ts"');
  if (fixed !== json) {
    fs.writeFileSync(pkgPath, fixed);
    console.log("patched expo-modules-core/package.json (restored src/index.ts)");
  }
}

// Xóa index.js stub nếu có (để native dùng bản gốc, tránh requireNativeModule is undefined)
if (fs.existsSync(indexPath)) {
  try {
    fs.unlinkSync(indexPath);
    console.log("removed expo-modules-core/index.js (stub)");
  } catch (e) {
    console.warn("could not remove expo-modules-core/index.js (delete manually if needed):", e.code);
  }
}

// 3. Patch expo-constants (web) để dùng global.__EXPO_APP_MANIFEST khi APP_MANIFEST không có
const constantsDir = path.join(root, "node_modules", "expo-constants", "build");
const exponentWebPath = path.join(constantsDir, "ExponentConstants.web.js");
if (fs.existsSync(exponentWebPath)) {
  let content = fs.readFileSync(exponentWebPath, "utf8");
  const search = "return process.env.APP_MANIFEST || {};";
  const replace =
    "return (typeof global !== 'undefined' && global.__EXPO_APP_MANIFEST) || process.env.APP_MANIFEST || {};";
  if (content.includes(search) && !content.includes("global.__EXPO_APP_MANIFEST")) {
    content = content.replace(search, replace);
    fs.writeFileSync(exponentWebPath, content);
    console.log("patched expo-constants/ExponentConstants.web.js (manifest fallback)");
  }
}
