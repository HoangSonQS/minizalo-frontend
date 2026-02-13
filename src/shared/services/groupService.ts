import axios from "axios";
import { useAuthStore } from "@/shared/store/authStore";
import { ChatRoom } from "../types";

// Cấu hình base URL
const rawBase =
    typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL
        ? process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "")
        : "http://localhost:8080/api";
const API_BASE_URL = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;

function getAuthHeaders() {
    const token = useAuthStore.getState().accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Reuse interceptor logic if needed - skipped for brevity as it duplicates friendService logic
// Ideally, create a centralized 'apiClient'

export interface GroupResponse {
    id: string;
    name: string;
    avatarUrl?: string; // Corrected from image to avatarUrl based on backend model usually
    // Add other fields as per backend response
}

export const groupService = {
    async getUsersGroups(): Promise<GroupResponse[]> {
        const { data } = await api.get<GroupResponse[]>("/group/my-groups", {
            headers: getAuthHeaders(),
        });
        return data;
    },
};
