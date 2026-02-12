import React from "react";
import { Platform, View, Text } from "react-native";
import BlockedListScreen from "@/views/mobile/profile/BlockedListScreen";

export default function BlockedRoute() {
    if (Platform.OS === "web") {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Text>Danh sách chặn hiện chỉ hỗ trợ trên mobile.</Text>
            </View>
        );
    }

    return <BlockedListScreen />;
}

