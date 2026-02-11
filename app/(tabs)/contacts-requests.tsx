import React from "react";
import { Platform, View, Text } from "react-native";
import FriendRequestsMobile from "@/views/mobile/contacts/FriendRequestsMobile";
import FriendRequestsScreen from "@/views/web/components/FriendRequestsScreen";
import { useUserStore } from "@/shared/store/userStore";

export default function ContactsRequestsScreen() {
    const { profile } = useUserStore();
    const currentUserId = profile?.id ?? null;

    if (Platform.OS === "web") {
        return (
            <div style={{ height: "100vh" }}>
                <FriendRequestsScreen currentUserId={currentUserId} />
            </div>
        );
    }

    return <FriendRequestsMobile />;
}

