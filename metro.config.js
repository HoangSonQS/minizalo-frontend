const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Tắt NativeWind cho web để tránh lỗi "Cannot use import.meta outside a module"
// (NativeWind/Metro có thể emit import.meta, script web load không phải type=module)
const isWeb = process.env.EXPO_PUBLIC_METRO_WEB === "1";

// Chạy app.manifest.inject.js trước main để expo-linking có manifest/scheme (tránh Render Error trên web)
function addManifestInject(conf) {
  if (!conf.serializer || !conf.serializer.getModulesRunBeforeMainModule) return conf;
  const defaultGetModules = conf.serializer.getModulesRunBeforeMainModule.bind(conf.serializer);
  conf.serializer.getModulesRunBeforeMainModule = function (entryPath) {
    const injectPath = path.resolve(__dirname, "app.manifest.inject.js");
    return [injectPath, ...defaultGetModules(entryPath)];
  };
  return conf;
}

const finalConfig = isWeb ? config : withNativeWind(config, { input: "./src/shared/styles/global.css" });
module.exports = addManifestInject(finalConfig);
