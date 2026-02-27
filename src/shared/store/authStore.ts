import { create } from "zustand";
import { Platform } from "react-native";
import authService from "@/shared/services/authService";
import type { LoginRequest, JwtResponse } from "@/shared/services/types";

// ──── Web persistence helpers (localStorage) ────
const WEB_STORAGE_KEY = "minizalo_auth";

function saveToWebStorage(data: { accessToken: string | null; refreshToken: string | null; user: any }) {
    if (Platform.OS !== "web") return;
    try {
        localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(data));
    } catch { /* ignore */ }
}

function loadFromWebStorage(): { accessToken: string | null; refreshToken: string | null; user: any } | null {
    if (Platform.OS !== "web") return null;
    try {
        const raw = localStorage.getItem(WEB_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return null;
}

function clearWebStorage() {
    if (Platform.OS !== "web") return;
    try {
        localStorage.removeItem(WEB_STORAGE_KEY);
    } catch { /* ignore */ }
}

// ──── Hydrate initial state from web storage ────
const persisted = loadFromWebStorage();

type AuthState = {
    accessToken: string | null;
    refreshToken: string | null;
    user: import('./../types').User | null;
    isHydrated: boolean;
    setTokens: (accessToken: string, refreshToken: string) => void;
    setUser: (user: import('./../types').User) => void;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<boolean>;
    setHydrated: () => void;
    clear: () => void;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
    accessToken: persisted?.accessToken || null,
    refreshToken: persisted?.refreshToken || null,
    user: persisted?.user || null,
    isHydrated: true,

    setHydrated: () => set({ isHydrated: true }),

    setUser: (user) => {
        set({ user });
        const { accessToken, refreshToken } = get();
        saveToWebStorage({ accessToken, refreshToken, user });
    },

    setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        const { user } = get();
        saveToWebStorage({ accessToken, refreshToken, user });
    },

    login: async (data: LoginRequest) => {
        const res: JwtResponse = await authService.signin(data);
        const newState = {
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
        };
        set(newState);
        // Persist to web storage immediately (user will be set later by profile fetch)
        saveToWebStorage({ ...newState, user: get().user });
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
        // Deactivate WebSocket
        const { webSocketService } = await import('@/shared/services/WebSocketService');
        webSocketService.deactivate();

        set({ accessToken: null, refreshToken: null, user: null });
        clearWebStorage();
    },

    refreshAuth: async (): Promise<boolean> => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
            const res = await authService.refreshToken(refreshToken);
            const newState = {
                accessToken: res.accessToken,
                refreshToken: res.refreshToken,
            };
            set(newState);
            saveToWebStorage({ ...newState, user: get().user });
            return true;
        } catch {
            set({ accessToken: null, refreshToken: null });
            clearWebStorage();
            return false;
        }
    },

    clear: () => {
        set({ accessToken: null, refreshToken: null, user: null });
        clearWebStorage();
    },
}));

export const isAuthenticated = (): boolean => {
    return !!useAuthStore.getState().accessToken;
};

