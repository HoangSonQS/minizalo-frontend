const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Tắt NativeWind cho web để tránh lỗi "Cannot use import.meta outside a module"
// (NativeWind/Metro có thể emit import.meta, script web load không phải type=module)
const isWeb = process.env.EXPO_PUBLIC_METRO_WEB === "1";

module.exports = isWeb ? config : withNativeWind(config, { input: "./src/shared/styles/global.css" });
