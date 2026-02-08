import "../src/shared/styles/global.css";
import { LogBox } from "react-native";
import { Slot } from "expo-router";

// Ẩn cảnh báo SafeAreaView deprecated (app dùng react-native-safe-area-context; cảnh báo từ RN/dependency)
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

export default function RootLayout() {
    return <Slot />;
}
