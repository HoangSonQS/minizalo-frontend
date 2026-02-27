import { ReactNode, useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/shared/store/authStore";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { userService } from "@/shared/services/userService";

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
    const { accessToken, refreshToken, isHydrated, refreshAuth, clear, user, setUser } = useAuthStore();
    const [isValidating, setIsValidating] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

    // Validate token with server when app loads
    useEffect(() => {
        const validateToken = async () => {
            if (isHydrated && refreshToken && isTokenValid === null) {
                setIsValidating(true);
                try {
                    const success = await refreshAuth();
                    setIsTokenValid(success);
                    if (success) {
                        // Fetch user profile if not already loaded
                        if (!user) {
                            try {
                                const profile = await userService.getProfile();
                                setUser({
                                    id: profile.id,
                                    username: profile.username,
                                    fullName: profile.displayName || profile.username,
                                    avatarUrl: profile.avatarUrl || undefined,
                                });
                            } catch {
                                // Profile fetch failed but auth is still valid
                            }
                        }
                    } else {
                        clear(); // Clear invalid tokens
                    }
                } catch {
                    setIsTokenValid(false);
                    clear(); // Clear invalid tokens
                }
                setIsValidating(false);
            } else if (isHydrated && !refreshToken) {
                setIsTokenValid(false);
            }
        };
        validateToken();
    }, [isHydrated, refreshToken]);


    // Show loading while hydrating or validating
    if (!isHydrated || (refreshToken && isValidating)) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0068FF" />
            </View>
        );
    }

    if (mode === "requireAuth") {
        if (!accessToken || isTokenValid === false) {
            return <Redirect href={loginPath as any} />;
        }
    }

    if (mode === "guestOnly") {
        if (accessToken && isTokenValid !== false) {
            return <Redirect href={homePath as any} />;
        }
    }

    return <>{children}</>;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
});
