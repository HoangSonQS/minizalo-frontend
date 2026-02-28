import "../src/shared/styles/global.css";
import { LogBox } from "react-native";
import { Stack } from "expo-router";

// Ẩn cảnh báo SafeAreaView deprecated (app dùng react-native-safe-area-context; cảnh báo từ RN/dependency)
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

export default function RootLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
                gestureEnabled: true,
                gestureDirection: "horizontal",
                fullScreenGestureEnabled: true,
            }}
        >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen
                name="chat/[id]"
                options={{
                    animation: "slide_from_right",
                    gestureEnabled: true,
                    fullScreenGestureEnabled: true,
                }}
            />
        </Stack>
    );
}
