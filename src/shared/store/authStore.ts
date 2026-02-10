import { create } from "zustand";
import authService from "@/shared/services/authService";
import type { LoginRequest, JwtResponse } from "@/shared/services/types";

type AuthState = {
    accessToken: string | null;
    refreshToken: string | null;
    isHydrated: boolean;
    setTokens: (accessToken: string, refreshToken: string) => void;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<boolean>;
    setHydrated: () => void;
    clear: () => void;
};

// Không persist auth: reload app → vào màn đăng nhập (không tự vào Tin nhắn).
// Nếu sau muốn giữ đăng nhập khi reload, bật lại persist với AsyncStorage.
export const useAuthStore = create<AuthState>()((set, get) => ({
    accessToken: null,
    refreshToken: null,
    isHydrated: true,

    setHydrated: () => set({ isHydrated: true }),

    setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

    login: async (data: LoginRequest) => {
        const res: JwtResponse = await authService.signin(data);
        set({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
        });
    },

    logout: async () => {
        const { accessToken } = get();
        if (accessToken) {
            try {
                await authService.logout(accessToken);
            } catch {
                // ignore network error on logout
            }
        }
        set({ accessToken: null, refreshToken: null });
    },

    refreshAuth: async (): Promise<boolean> => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
            const res = await authService.refreshToken(refreshToken);
            set({
                accessToken: res.accessToken,
                refreshToken: res.refreshToken,
            });
            return true;
        } catch {
            set({ accessToken: null, refreshToken: null });
            return false;
        }
    },

    clear: () => set({ accessToken: null, refreshToken: null }),
}));

export const isAuthenticated = (): boolean => {
    return !!useAuthStore.getState().accessToken;
};
