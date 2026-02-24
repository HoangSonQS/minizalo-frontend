import { View, Text, Platform } from "react-native";
import React from "react";
import ChatListScreen from "@/views/mobile/chat/screens/ChatListScreen";

// Lazy load Web component
const HomeWeb = React.lazy(() => import("@/views/web/home/HomeWeb"));

export default function TabsIndex() {
    if (Platform.OS === "web") {
        return (
            <React.Suspense fallback={<Text>Loading...</Text>}>
                <HomeWeb />
            </React.Suspense>
        );
    }

    return <ChatListScreen />;
}
