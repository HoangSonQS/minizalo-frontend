import axios from 'axios';
import { PaginatedMessageResult, SearchMessageResponse, Message } from '../types';
import { useAuthStore } from '../store/authStore';

// Config Base URL (same pattern as chatService)
const rawBase =
    typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL
        ? process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "")
        : "http://localhost:8080/api";
const API_URL = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add token
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add interceptor for 401 refresh
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

export const MessageService = {
    getChatHistory: async (roomId: string, limit: number = 20, lastKey?: string): Promise<PaginatedMessageResult> => {
        const response = await api.get<PaginatedMessageResult>(`/chat/history/${roomId}`, {
            params: { limit, lastKey },
        });
        return response.data;
    },

    searchMessages: async (roomId: string, query: string, limit: number = 10, lastKey?: string): Promise<SearchMessageResponse> => {
        const response = await api.get<SearchMessageResponse>(`/chat/${roomId}/search`, {
            params: { q: query, limit, lastKey },
        });
        return response.data;
    },

    recallMessage: async (roomId: string, messageId: string): Promise<void> => {
        await api.post('/messages/recall', { roomId, messageId });
    },

    setReaction: async (roomId: string, messageId: string, emoji: string): Promise<void> => {
        await api.put(`/chat/${roomId}/messages/${messageId}/reactions`, { emoji });
    },

    removeReaction: async (roomId: string, messageId: string): Promise<void> => {
        await api.delete(`/chat/${roomId}/messages/${messageId}/reactions`);
    },

    forwardMessage: async (originalRoomId: string, originalMessageId: string, targetRoomId: string): Promise<Message> => {
        const response = await api.post<Message>('/chat/forward', {
            originalRoomId,
            originalMessageId,
            targetRoomId,
        });
        return response.data;
    },

    uploadFile: async (file: File): Promise<{ fileName: string; fileUrl: string; fileType: string; size: number }> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};
