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

export default function TabsLayout() {
    const isWeb = Platform.OS === "web";
    return (
        <View style={isWeb ? styles.container : undefined} className={isWeb ? undefined : "flex-1 items-center justify-center bg-zalo-background"}>
            <Text style={isWeb ? styles.title : undefined} className={isWeb ? undefined : "text-2xl font-bold text-zalo-blue-primary"}>
                MiniZalo - Tabs Screen
            </Text>
        </View>
    );
}
