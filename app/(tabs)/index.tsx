import { View, Text, Platform } from "react-native";

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
    return (
        <View style={isWeb ? styles.container : undefined} className={isWeb ? undefined : "flex-1 items-center justify-center bg-zalo-background"}>
            <Text style={isWeb ? styles.title : undefined} className={isWeb ? undefined : "text-2xl font-bold text-zalo-blue-primary"}>
                {isWeb ? "MiniZalo - Tabs Screen" : "Tin nhắn"}
            </Text>
            {!isWeb && (
                <Text style={{ marginTop: 8, color: "#666", fontSize: 14 }}>
                    Danh sách tin nhắn - đang phát triển
                </Text>
            )}
        </View>
    );
}
