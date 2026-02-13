import { View, Text, Platform } from "react-native";
import React from "react";

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

    return (
        <View className="flex-1 items-center justify-center bg-zalo-background">
            <Text className="text-2xl font-bold text-zalo-blue-primary">
                Tin nhắn (Mobile)
            </Text>
            <Text style={{ marginTop: 8, color: "#666", fontSize: 14 }}>
                Danh sách tin nhắn - đang phát triển
            </Text>
        </View>
    );
}
