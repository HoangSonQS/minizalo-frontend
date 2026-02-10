import { View, Text, Platform } from "react-native";
import ChatListScreen from "@/views/mobile/chat/screens/ChatListScreen";

const styles = {
    container: {
        flex: 1,
        alignItems: "center" as const,
        justifyContent: "center" as const,
        backgroundColor: "#F2F4F7",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold" as const,
        color: "#0068FF",
    },
};

export default function TabsIndex() {
    const isWeb = Platform.OS === "web";

    if (!isWeb) {
        return <ChatListScreen />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                MiniZalo - Tabs Screen
            </Text>
            {!isWeb && (
                <Text style={{ marginTop: 8, color: "#666", fontSize: 14 }}>
                    Danh sách tin nhắn - đang phát triển
                </Text>
            )}
        </View>
    );
}
