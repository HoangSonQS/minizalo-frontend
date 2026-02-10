import { Platform, View, Text } from "react-native";
import { SettingsScreen as SettingsScreenMobile } from "@/views/mobile/profile";

export default function SettingsScreen() {
    const isWeb = Platform.OS === "web";
    if (!isWeb) {
        return <SettingsScreenMobile />;
    }
    return (
        <View style={{ flex: 1, padding: 24, backgroundColor: "#f2f4f7" }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#0068FF" }}>
                Cài đặt
            </Text>
            <Text style={{ marginTop: 8, color: "#666" }}>
                Trang cài đặt - đang phát triển.
            </Text>
        </View>
    );
}
