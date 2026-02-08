import axios from "axios";
import { useAuthStore } from "@/shared/store/authStore";
import type { UserProfile, UserProfileUpdateRequest } from "./types";

const API_BASE_URL =
    typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL
        ? process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "")
        : "http://localhost:8080/api";

function getAuthHeaders() {
    const token = useAuthStore.getState().accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

export const userService = {
    getProfile: async (): Promise<UserProfile> => {
        const { data } = await api.get<UserProfile>("/users/me", {
            headers: getAuthHeaders(),
        });
        return data;
    },

    updateProfile: async (body: UserProfileUpdateRequest): Promise<UserProfile> => {
        const { data } = await api.put<UserProfile>("/users/profile", body, {
            headers: getAuthHeaders(),
        });
        return data;
    },

    uploadAvatar: async (file: File): Promise<UserProfile> => {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await api.put<UserProfile>("/users/avatar", formData, {
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "multipart/form-data",
            },
        });
        return data;
    },
};

export default userService;
