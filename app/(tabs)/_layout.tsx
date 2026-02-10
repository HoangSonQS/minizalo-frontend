import { Platform } from "react-native";
import { Slot } from "expo-router";
import { Tabs } from "expo-router/tabs";
import { Ionicons } from "@expo/vector-icons";
import { AuthGuard } from "@/shared/guards/AuthGuard";
import WebSidebar from "@/views/web/components/WebSidebar";

// Icon tab bar (mobile) - giống Zalo: Tin nhắn (chat), Danh bạ (people), Khám phá (grid), Nhật ký (time), Cá nhân (person)
type IconName = keyof typeof Ionicons.glyphMap;
const TabIcon = ({
    name,
    focused,
    color,
    size = 24,
}: {
    name: IconName;
    focused: boolean;
    color: string;
    size?: number;
}) => (
    <Ionicons
        name={focused ? name : (`${name}-outline` as IconName)}
        size={size}
        color={color}
    />
);

export default function TabsLayout() {
    const isWeb = Platform.OS === "web";

    if (isWeb) {
        return (
            <AuthGuard mode="requireAuth">
                <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
                    <WebSidebar />
                    <main style={{ flex: 1, minWidth: 0 }}>
                        <Slot />
                    </main>
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard mode="requireAuth">
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: "#0068FF",
                    tabBarInactiveTintColor: "#8e8e93",
                    tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#e0e0e0", height: 60, paddingBottom: 8 },
                    tabBarLabelStyle: { fontSize: 11, marginBottom: 4 },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Tin nhắn",
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon name="chatbubble-ellipses" focused={focused} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="contacts"
                    options={{
                        title: "Danh bạ",
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon name="people" focused={focused} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="explore"
                    options={{
                        title: "Khám phá",
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon name="grid" focused={focused} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="work"
                    options={{
                        title: "Nhật ký",
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon name="time" focused={focused} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="account"
                    options={{
                        title: "Cá nhân",
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon name="person" focused={focused} color={color} />
                        ),
                    }}
                />

                {/* Hidden tabs */}
                <Tabs.Screen name="account-edit" options={{ href: null }} />
                <Tabs.Screen name="settings" options={{ href: null }} />
                <Tabs.Screen name="data" options={{ href: null }} />
                <Tabs.Screen name="files" options={{ href: null }} />
                <Tabs.Screen name="language" options={{ href: null }} />
                <Tabs.Screen name="support" options={{ href: null }} />
                <Tabs.Screen name="zalo-cloud" options={{ href: null }} />
            </Tabs>
        </AuthGuard>
    );
}
