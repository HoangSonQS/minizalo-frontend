import { Platform } from "react-native";
import { Slot } from "expo-router";
import { AuthGuard } from "@/shared/guards/AuthGuard";
import WebSidebar from "@/views/web/components/WebSidebar";

export default function TabsLayout() {
    const isWeb = Platform.OS === "web";

    return (
        <AuthGuard mode="requireAuth">
            {isWeb ? (
                <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
                    <WebSidebar />
                    <main style={{ flex: 1, minWidth: 0 }}>
                        <Slot />
                    </main>
                </div>
            ) : (
                <Slot />
            )}
        </AuthGuard>
    );
}
