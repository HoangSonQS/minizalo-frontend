import axios from "axios";
import { useAuthStore } from "@/shared/store/authStore";

export type FriendCategory = {
    id: string;
    name: string;
    color: string;
};

export type FriendCategoryAssignment = {
    targetUserId: string;
    categoryId: string | null;
};

// Dùng chung base URL /api giống authService/userService
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

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshed = await useAuthStore.getState().refreshAuth();
                if (refreshed) {
                    const token = useAuthStore.getState().accessToken;
                    if (token) {
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    }
                }
            } catch {
                // ignore
            }
            useAuthStore.getState().clear();
        }
        return Promise.reject(error);
    }
);

export const friendCategoryService = {
    async listCategories(): Promise<FriendCategory[]> {
        const { data } = await api.get<FriendCategory[]>("/friend-categories", {
            headers: getAuthHeaders(),
        });
        return data;
    },

    async createCategory(payload: { name: string; color: string }): Promise<FriendCategory> {
        const { data } = await api.post<FriendCategory>("/friend-categories", payload, {
            headers: getAuthHeaders(),
        });
        return data;
    },

    async updateCategory(id: string, payload: { name: string; color: string }): Promise<FriendCategory> {
        const { data } = await api.put<FriendCategory>(`/friend-categories/${id}`, payload, {
            headers: getAuthHeaders(),
        });
        return data;
    },

    async deleteCategory(id: string): Promise<void> {
        await api.delete(`/friend-categories/${id}`, { headers: getAuthHeaders() });
    },

    async listAssignments(): Promise<FriendCategoryAssignment[]> {
        const { data } = await api.get<FriendCategoryAssignment[]>("/friend-categories/assignments", {
            headers: getAuthHeaders(),
        });
        return data;
    },

    /**
     * categoryId = null => hủy phân loại
     */
    async assignCategory(targetUserId: string, categoryId: string | null): Promise<FriendCategoryAssignment> {
        const { data } = await api.post<FriendCategoryAssignment>(
            "/friend-categories/assignments",
            { targetUserId, categoryId },
            { headers: getAuthHeaders() }
        );
        return data;
    },
};

export default friendCategoryService;

