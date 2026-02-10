import { Platform } from "react-native";
import { useEffect } from "react";
import EditProfileView from "@/views/web/profile/EditProfileView";
import { EditProfileScreen } from "@/views/mobile/profile";
import { useUserStore } from "@/shared/store/userStore";

export default function AccountEditScreen() {
    const { profile, fetchProfile, updateProfile } = useUserStore();

    // Tải data người đăng nhập khi mở màn Chỉnh sửa (nếu chưa có profile)
    useEffect(() => {
        if (Platform.OS !== "web" && !profile) {
            fetchProfile();
        }
    }, [profile, fetchProfile]);

    if (Platform.OS === "web") {
        return <EditProfileView />;
    }
    return (
        <EditProfileScreen
            user={profile}
            onSave={updateProfile}
        />
    );
}
