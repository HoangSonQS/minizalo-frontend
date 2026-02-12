import React from "react";
import { Platform, View, Text } from "react-native";
import AddFriendMobileScreen from "@/views/mobile/contacts/AddFriendMobileScreen";
import SearchUsersScreen from "@/views/web/components/SearchUsersScreen";
import { useUserStore } from "@/shared/store/userStore";

export default function ContactsAddScreen() {
    const { profile } = useUserStore();
    const currentUserId = profile?.id ?? null;

    if (Platform.OS === "web") {
        // Web: dùng lại màn search users hiện có
        return (
            <div style={{ height: "100vh" }}>
                <SearchUsersScreen
                    externalQuery=""
                    onOpenChat={() => {}}
                />
            </div>
        );
    }

    // Mobile: màn thêm bạn riêng
    return <AddFriendMobileScreen />;
}

