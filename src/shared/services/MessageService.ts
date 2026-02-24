import axios from 'axios';
import { PaginatedMessageResult, SearchMessageResponse, Message } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add token if needed
api.interceptors.request.use(async (config) => {
    const { useAuthStore } = await import('../store/authStore');
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const MessageService = {
    getChatHistory: async (roomId: string, limit: number = 20, lastKey?: string): Promise<PaginatedMessageResult> => {
        const response = await api.get<PaginatedMessageResult>(`/api/chat/history/${roomId}`, {
            params: { limit, lastKey },
        });
        return response.data;
    },

    searchMessages: async (roomId: string, query: string, limit: number = 10, lastKey?: string): Promise<SearchMessageResponse> => {
        const response = await api.get<SearchMessageResponse>(`/api/chat/${roomId}/search`, {
            params: { q: query, limit, lastKey },
        });
        return response.data;
    },

    recallMessage: async (roomId: string, messageId: string): Promise<void> => {
        await api.post('/messages/recall', { roomId, messageId });
    },

    forwardMessage: async (originalRoomId: string, originalMessageId: string, targetRoomId: string): Promise<Message> => {
        const response = await api.post<Message>('/api/chat/forward', {
            originalRoomId,
            originalMessageId,
            targetRoomId,
        });
        return response.data;
    },
};
