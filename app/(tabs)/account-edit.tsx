import { Platform, View, Text } from "react-native";
import EditProfileView from "@/views/web/profile/EditProfileView";

export default function AccountEditScreen() {
    if (Platform.OS === "web") {
        return <EditProfileView />;
    }
    return (
        <View style={{ flex: 1, padding: 24, backgroundColor: "#f2f4f7" }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#0068FF" }}>
                Chỉnh sửa thông tin tài khoản
            </Text>
            <Text style={{ marginTop: 8, color: "#666" }}>
                Trang chỉnh sửa - đang phát triển (mobile).
            </Text>
        </View>
    );
}
