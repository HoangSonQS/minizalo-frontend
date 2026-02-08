import { View, Text, Platform } from "react-native";

export default function AccountEditScreen() {
    const isWeb = Platform.OS === "web";
    return (
        <View style={isWeb ? { flex: 1, padding: 24, backgroundColor: "#f2f4f7" } : undefined}>
            <Text style={isWeb ? { fontSize: 24, fontWeight: "bold", color: "#0068FF" } : undefined}>
                Chỉnh sửa thông tin tài khoản
            </Text>
            <Text style={isWeb ? { marginTop: 8, color: "#666" } : undefined}>
                Trang chỉnh sửa - đang phát triển.
            </Text>
        </View>
    );
}
