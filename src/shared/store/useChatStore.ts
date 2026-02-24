import { create } from 'zustand';
import { Message } from '../types';
import { useAuthStore } from './authStore';

interface ChatState {
    messages: Record<string, Message[]>; // roomId -> messages
    rooms: import('../types').ChatRoom[];
    typingUsers: Record<string, string[]>; // roomId -> userIds
    currentRoomId: string | null;

    // Actions
    setRooms: (rooms: import('../types').ChatRoom[]) => void;
    upsertRoom: (room: import('../types').ChatRoom) => void;
    setCurrentRoom: (roomId: string | null) => void;
    addMessage: (roomId: string, message: Message) => void;
    setMessages: (roomId: string, messages: Message[]) => void;
    prependMessages: (roomId: string, messages: Message[]) => void;
    updateMessage: (roomId: string, messageId: string, updates: Partial<Message>) => void;
    setTyping: (roomId: string, userId: string, isTyping: boolean) => void;
    clearTyping: (roomId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: {},
    rooms: [],
    typingUsers: {},
    currentRoomId: null,

    setRooms: (rooms) => set({ rooms }),

    upsertRoom: (room) => set((state) => {
        const existingIndex = state.rooms.findIndex(r => r.id === room.id);
        if (existingIndex >= 0) {
            const newRooms = [...state.rooms];
            newRooms[existingIndex] = { ...newRooms[existingIndex], ...room };
            // Sort by updatedAt desc
            newRooms.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            return { rooms: newRooms };
        } else {
            return { rooms: [room, ...state.rooms] };
        }
    }),

    setCurrentRoom: (roomId) => set((state) => {
        if (!roomId) return { currentRoomId: null };
        const newRooms = state.rooms.map(room => 
            room.id === roomId ? { ...room, unreadCount: 0 } : room
        );
        return { currentRoomId: roomId, rooms: newRooms };
    }),

    addMessage: (roomId, message) => set((state) => {
        const roomMessages = state.messages[roomId] || [];
        // Prevent duplicates by ID
        if (roomMessages.some(m => m.id === message.id)) return state;

        // Bỏ tin nhắn optimistic (temp-*) của sender khi nhận được real message
        let filteredMessages = [...roomMessages];
        if (!message.id.startsWith('temp-')) {
            const tempIdx = filteredMessages.findIndex(m => m.id.startsWith('temp-') && m.senderId === message.senderId);
            if (tempIdx !== -1) {
                // Xóa tin nhắn temp đầu tiên tìm thấy
                filteredMessages.splice(tempIdx, 1);
            }
        }

        const currentUserId = useAuthStore.getState().user?.id;

        const newRooms = state.rooms.map((room) => {
            if (room.id === roomId) {
                // Chỉ set unreadCount > 0 nếu:
                // 1. Không phải phòng đang mở
                // 2. Không phải tin nhắn nháp (temp-)
                // 3. Không phải tin nhắn do chính user gửi (từ thiết bị/tab khác)
                const isUnread = state.currentRoomId !== roomId && !message.id.startsWith('temp-') && message.senderId !== currentUserId;
                return {
                    ...room,
                    lastMessage: message,
                    updatedAt: message.createdAt || new Date().toISOString(),
                    unreadCount: isUnread ? (room.unreadCount || 0) + 1 : room.unreadCount
                };
            }
            return room;
        });

        newRooms.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        return {
            messages: {
                ...state.messages,
                [roomId]: [...filteredMessages, message],
            },
            rooms: newRooms,
        };
    }),

    setMessages: (roomId, messages) => set((state) => ({
        messages: {
            ...state.messages,
            [roomId]: messages,
        },
    })),

    prependMessages: (roomId, messages) => set((state) => ({
        messages: {
            ...state.messages,
            [roomId]: [...messages, ...(state.messages[roomId] || [])],
        },
    })),

    updateMessage: (roomId, messageId, updates) => set((state) => {
        const roomMessages = state.messages[roomId] || [];
        const newMessages = roomMessages.map((msg) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
        );
        return {
            messages: {
                ...state.messages,
                [roomId]: newMessages,
            },
        };
    }),

    setTyping: (roomId, userId, isTyping) => set((state) => {
        const currentTyping = state.typingUsers[roomId] || [];
        let newTyping = [...currentTyping];

        if (isTyping) {
            if (!newTyping.includes(userId)) {
                newTyping.push(userId);
            }
        } else {
            newTyping = newTyping.filter(id => id !== userId);
        }

        return {
            typingUsers: {
                ...state.typingUsers,
                [roomId]: newTyping,
            },
        };
    }),

    clearTyping: (roomId) => set((state) => ({
        typingUsers: {
            ...state.typingUsers,
            [roomId]: [],
        },
    })),
}));
