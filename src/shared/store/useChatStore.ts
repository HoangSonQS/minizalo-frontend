import { create } from 'zustand';
import { Message } from '../types';

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

    setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),

    addMessage: (roomId, message) => set((state) => {
        const roomMessages = state.messages[roomId] || [];
        // Prevent duplicates
        if (roomMessages.some(m => m.id === message.id)) return state;

        return {
            messages: {
                ...state.messages,
                [roomId]: [...roomMessages, message],
            },
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
