/** app.config.js: Expo đọc file này để expo-constants / expo-linking có scheme khi chạy. */
const appJson = require("./app.json");
module.exports = () => appJson;
