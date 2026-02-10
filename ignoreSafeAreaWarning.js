/**
 * Gọi trước expo-router để ẩn cảnh báo SafeAreaView deprecated
 * (app dùng react-native-safe-area-context; cảnh báo từ RN/dependency).
 */
const { LogBox } = require("react-native");
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);
