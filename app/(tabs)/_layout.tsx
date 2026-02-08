import { Slot } from "expo-router";
import { AuthGuard } from "@/shared/guards/AuthGuard";

export default function TabsLayout() {
    return (
        <AuthGuard mode="requireAuth">
            <Slot />
        </AuthGuard>
    );
}
