import { View, Text, Platform } from "react-native";

export default function FilesScreen() {
    const isWeb = Platform.OS === "web";
    return (
        <View style={isWeb ? { flex: 1, padding: 24, backgroundColor: "#f2f4f7" } : undefined}>
            <Text style={isWeb ? { fontSize: 24, fontWeight: "bold", color: "#0068FF" } : undefined}>
                Thư mục
            </Text>
            <Text style={isWeb ? { marginTop: 8, color: "#666" } : undefined}>
                Trang thư mục / tệp - đang phát triển.
            </Text>
        </View>
    );
}
