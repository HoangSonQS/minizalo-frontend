import ChatScreen from "@/views/mobile/chat/screens/ChatScreen";
import { Stack } from "expo-router";
import { Platform, Text } from "react-native";
import React from "react";

// Lazy load Web component
const ChatScreenWeb = React.lazy(() => import("@/views/web/chat/ChatScreenWeb"));

export default function ChatRoute() {
    if (Platform.OS === "web") {
        return (
            <React.Suspense fallback={<Text>Loading...</Text>}>
                <ChatScreenWeb />
            </React.Suspense>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ChatScreen />
        </>
    );
}
