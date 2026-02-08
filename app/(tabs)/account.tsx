import { Platform, View, Text } from "react-native";
import AccountInfoView from "@/views/web/profile/AccountInfoView";

export default function AccountScreen() {
    if (Platform.OS === "web") {
        return <AccountInfoView />;
    }
    return (
        <View style={{ flex: 1, padding: 24, backgroundColor: "#f2f4f7" }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#0068FF" }}>
                Thông tin tài khoản
            </Text>
            <Text style={{ marginTop: 8, color: "#666" }}>
                Trang thông tin tài khoản - đang phát triển.
            </Text>
        </View>
    );
}
