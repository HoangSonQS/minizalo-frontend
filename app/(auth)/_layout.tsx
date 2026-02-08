import { Slot } from "expo-router";
import { AuthGuard } from "@/shared/guards/AuthGuard";

export default function AuthLayout() {
    return (
        <AuthGuard mode="guestOnly">
            <Slot />
        </AuthGuard>
    );
}
