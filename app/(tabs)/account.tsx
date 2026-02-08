import { useCallback } from "react";
import { Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AccountInfoView from "@/views/web/profile/AccountInfoView";
import { ProfileScreen } from "@/views/mobile/profile";
import { useUserStore } from "@/shared/store/userStore";
import { isAuthenticated } from "@/shared/store/authStore";

export default function AccountScreen() {
    const { profile, fetchProfile } = useUserStore();

    // Refetch profile mỗi khi mở tab Cá nhân (có token) để luôn có dữ liệu mới
    useFocusEffect(
        useCallback(() => {
            if (Platform.OS === "web") return;
            if (isAuthenticated()) fetchProfile();
        }, [fetchProfile])
    );

    if (Platform.OS === "web") {
        return <AccountInfoView />;
    }
    return <ProfileScreen user={profile} />;
}
