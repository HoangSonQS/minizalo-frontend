/**
 * Chạy trước main bundle (chỉ khi build web) để expo-constants / expo-linking có manifest.
 * expo-linking cần scheme từ manifest; nếu APP_MANIFEST không được Metro inject thì dùng config này.
 */
(function () {
  if (typeof global === "undefined") return;
  try {
    var config = require("./app.config.js");
    var resolved = typeof config === "function" ? config() : config;
    if (resolved && resolved.expo) {
      global.__EXPO_APP_MANIFEST = resolved;
    }
  } catch (e) {
    try {
      global.__EXPO_APP_MANIFEST = require("./app.json");
    } catch (_) {}
  }
})();
