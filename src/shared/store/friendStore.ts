import { create } from "zustand";
import friendService from "@/shared/services/friendService";
import type { FriendResponseDto } from "@/shared/services/types";

type FriendState = {
    friends: FriendResponseDto[];
    requests: FriendResponseDto[];
    sentRequests: FriendResponseDto[];
    loading: boolean;
    error: string | null;
    fetchFriends: () => Promise<void>;
    fetchRequests: () => Promise<void>;
    fetchSentRequests: () => Promise<void>;
    sendRequest: (friendId: string) => Promise<void>;
    acceptRequest: (requestId: string) => Promise<void>;
    rejectRequest: (requestId: string) => Promise<void>;
    cancelSentRequest: (requestId: string) => Promise<void>;
    removeFriend: (friendId: string) => Promise<void>;
    clearError: () => void;
};

function extractErrorMessage(e: unknown, fallback: string): string {
    const anyError = e as { response?: { data?: { message?: string } | string } };
    const data = anyError?.response?.data;
    if (!data) return fallback;
    if (typeof data === "string") return data;
    if (typeof data.message === "string") return data.message;
    return fallback;
}

export const useFriendStore = create<FriendState>((set, get) => ({
    friends: [],
    requests: [],
    sentRequests: [],
    loading: false,
    error: null,

    fetchFriends: async () => {
        set({ loading: true, error: null });
        try {
            const friends = await friendService.getFriends();
            set({ friends, loading: false });
        } catch (e: unknown) {
            set({
                loading: false,
                error: extractErrorMessage(e, "Không tải được danh sách bạn bè."),
            });
        }
    },

    fetchRequests: async () => {
        set({ loading: true, error: null });
        try {
            const requests = await friendService.getPendingRequests();
            set({ requests, loading: false });
        } catch (e: unknown) {
            set({
                loading: false,
                error: extractErrorMessage(e, "Không tải được lời mời kết bạn."),
            });
        }
    },

    fetchSentRequests: async () => {
        set({ loading: true, error: null });
        try {
            const sentRequests = await friendService.getSentRequests();
            set({ sentRequests, loading: false });
        } catch (e: unknown) {
            set({
                loading: false,
                error: extractErrorMessage(e, "Không tải được các lời mời đã gửi."),
            });
        }
    },

    sendRequest: async (friendId: string) => {
        set({ error: null });
        try {
            // Gửi lời mời: phía người gửi không cần thêm vào danh sách
            // "Lời mời kết bạn" (danh sách đó dành cho các yêu cầu NHẬN được).
            // Người nhận khi đăng nhập sẽ thấy request qua API /friends/requests.
            await friendService.sendFriendRequest({ friendId });
        } catch (e: unknown) {
            set({
                error: extractErrorMessage(e, "Gửi lời mời kết bạn thất bại."),
            });
            throw e;
        }
    },

    acceptRequest: async (requestId: string) => {
        set({ error: null });
        try {
            const accepted = await friendService.acceptFriendRequest(requestId);
            set({
                requests: get().requests.filter((r) => r.id !== requestId),
                friends: [...get().friends, accepted],
            });
        } catch (e: unknown) {
            set({
                error: extractErrorMessage(e, "Chấp nhận lời mời kết bạn thất bại."),
            });
            throw e;
        }
    },

    rejectRequest: async (requestId: string) => {
        set({ error: null });
        try {
            await friendService.rejectFriendRequest(requestId);
            set({
                requests: get().requests.filter((r) => r.id !== requestId),
            });
        } catch (e: unknown) {
            set({
                error: extractErrorMessage(e, "Từ chối lời mời kết bạn thất bại."),
            });
            throw e;
        }
    },

    cancelSentRequest: async (requestId: string) => {
        set({ error: null });
        try {
            await friendService.cancelSentRequest(requestId);
            set({
                sentRequests: get().sentRequests.filter((r) => r.id !== requestId),
            });
        } catch (e: unknown) {
            set({
                error: extractErrorMessage(e, "Hủy lời mời kết bạn thất bại."),
            });
            throw e;
        }
    },

    removeFriend: async (friendId: string) => {
        set({ error: null });
        try {
            await friendService.deleteFriend(friendId);
            set({
                friends: get().friends.filter(
                    (f) => f.user.id !== friendId && f.friend.id !== friendId
                ),
            });
        } catch (e: unknown) {
            set({
                error: extractErrorMessage(e, "Xóa bạn thất bại."),
            });
            throw e;
        }
    },

    clearError: () => set({ error: null }),
}));

