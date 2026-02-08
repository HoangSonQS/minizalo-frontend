import { ReactNode } from "react";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/shared/store/authStore";

type AuthGuardMode = "requireAuth" | "guestOnly";

interface AuthGuardProps {
    mode: AuthGuardMode;
    children: ReactNode;
    loginPath?: string;
    homePath?: string;
}

/**
 * Auth Router Guard - dùng chung cho Web & Mobile.
 * - requireAuth: redirect sang login nếu chưa đăng nhập.
 * - guestOnly: redirect sang home nếu đã đăng nhập.
 */
export function AuthGuard({
    mode,
    children,
    loginPath = "/(auth)/login",
    homePath = "/(tabs)",
}: AuthGuardProps) {
    const { accessToken, isHydrated } = useAuthStore();

    // Chưa hydrate: với requireAuth không render nội dung bảo vệ (tránh lóe tab rồi mới redirect)
    if (!isHydrated) {
        if (mode === "requireAuth") {
            return <Redirect href={loginPath as any} />;
        }
        return <>{children}</>;
    }

    if (mode === "requireAuth") {
        if (!accessToken) {
            return <Redirect href={loginPath as any} />;
        }
    }

    if (mode === "guestOnly") {
        if (accessToken) {
            return <Redirect href={homePath as any} />;
        }
    }

    return <>{children}</>;
}
