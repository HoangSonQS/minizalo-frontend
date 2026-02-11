import axios from "axios";
import { useAuthStore } from "@/shared/store/authStore";
import type {
    FriendResponseDto,
    MessageResponse,
    SendFriendRequestPayload,
} from "./types";

// Cấu hình base URL giống authService/userService (luôn có /api ở cuối)
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

// Reuse logic refresh token giống userService
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

export const friendService = {
    async sendFriendRequest(payload: SendFriendRequestPayload): Promise<FriendResponseDto> {
        const { data } = await api.post<FriendResponseDto>("/friends/request", payload, {
            headers: getAuthHeaders(),
        });
        return data;
    },

    async acceptFriendRequest(requestId: string): Promise<FriendResponseDto> {
        const { data } = await api.post<FriendResponseDto>(
            `/friends/accept/${requestId}`,
            {},
            { headers: getAuthHeaders() }
        );
        return data;
    },

    async rejectFriendRequest(requestId: string): Promise<MessageResponse> {
        const { data } = await api.delete<MessageResponse>(
            `/friends/reject/${requestId}`,
            { headers: getAuthHeaders() }
        );
        return data;
    },

    async deleteFriend(friendId: string): Promise<MessageResponse> {
        const { data } = await api.delete<MessageResponse>(`/friends/${friendId}`, {
            headers: getAuthHeaders(),
        });
        return data;
    },

    async getFriends(): Promise<FriendResponseDto[]> {
        const { data } = await api.get<FriendResponseDto[]>("/friends", {
            headers: getAuthHeaders(),
        });
        return data;
    },

    async getPendingRequests(): Promise<FriendResponseDto[]> {
        const { data } = await api.get<FriendResponseDto[]>("/friends/requests", {
            headers: getAuthHeaders(),
        });
        return data;
    },

    async getSentRequests(): Promise<FriendResponseDto[]> {
        const { data } = await api.get<FriendResponseDto[]>("/friends/requests/sent", {
            headers: getAuthHeaders(),
        });
        return data;
    },

    async cancelSentRequest(requestId: string): Promise<MessageResponse> {
        const { data } = await api.delete<MessageResponse>(`/friends/request/${requestId}`, {
            headers: getAuthHeaders(),
        });
        return data;
    },

    async blockUser(userId: string): Promise<MessageResponse> {
        const { data } = await api.post<MessageResponse>(
            `/friends/block/${userId}`,
            {},
            { headers: getAuthHeaders() }
        );
        return data;
    },

    async unblockUser(userId: string): Promise<MessageResponse> {
        const { data } = await api.delete<MessageResponse>(
            `/friends/block/${userId}`,
            { headers: getAuthHeaders() }
        );
        return data;
    },

    async getBlockedUsers(): Promise<FriendResponseDto[]> {
        const { data } = await api.get<FriendResponseDto[]>("/friends/blocked", {
            headers: getAuthHeaders(),
        });
        return data;
    },
};

export default friendService;

