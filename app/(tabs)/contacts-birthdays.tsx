import React from "react";
import { Platform } from "react-native";
import BirthdayListMobileScreen from "@/views/mobile/contacts/BirthdayListMobileScreen";
import { useUserStore } from "@/shared/store/userStore";
import FriendsListScreen from "@/views/web/components/FriendsListScreen";

export default function ContactsBirthdaysScreen() {
    const { profile } = useUserStore();
    const currentUserId = profile?.id ?? null;

    if (Platform.OS === "web") {
        // Web: tạm dùng danh sách bạn bè, backend chưa có màn sinh nhật riêng
        return (
            <div style={{ height: "100vh" }}>
                <FriendsListScreen
                    currentUserId={currentUserId}
                    onOpenChat={() => {}}
                />
            </div>
        );
    }

    return <BirthdayListMobileScreen />;
}

