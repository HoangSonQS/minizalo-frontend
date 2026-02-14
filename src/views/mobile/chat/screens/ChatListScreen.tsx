import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, FlatList, ActivityIndicator, Text, RefreshControl, AppState } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { ChatListHeader } from "../components/ChatListHeader";
import { PinnedCloudItem } from "../components/PinnedCloudItem";
import { ChatItem } from "../components/ChatItem";
import { chatService, ChatRoomResponse } from "@/shared/services/chatService";
import { formatTime } from "@/shared/utils/dateUtils";

export default function ChatListScreen() {
    const router = useRouter();
    const [chats, setChats] = useState<ChatRoomResponse[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchChats().finally(() => setRefreshing(false));
    }, []);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchChats = async () => {
        try {
            setError(null);
            const data = await chatService.getChatRooms();
            setChats(data);
        } catch (err: any) {
            console.log("Error fetching chats:", err);
            if (chats.length === 0) {
                setError(err.message || "Failed to fetch chats");
            }
        }
    };

    // Auto-fetch when screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchChats();

            // Auto-refresh every 10 seconds while focused
            const interval = setInterval(() => {
                fetchChats();
            }, 10000);

            return () => clearInterval(interval);
        }, [])
    );

    const renderItem = ({ item }: { item: ChatRoomResponse }) => {
        const avatarUri = item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || "User")}&background=random&color=fff`;
        const lastMsg = item.lastMessage?.content
            ? (item.lastMessage.type === 'IMAGE' ? '[Hình ảnh]' : item.lastMessage.type === 'FILE' ? '[Tập tin]' : item.lastMessage.content)
            : "Chưa có tin nhắn";

        let timeDisplay = "";
        if (item.lastMessage?.createdAt) {
            timeDisplay = formatTime(item.lastMessage.createdAt);
        } else if (item.createdAt) {
            timeDisplay = formatTime(item.createdAt);
        }

        return (
            <ChatItem
                avatar={{ uri: avatarUri }}
                name={item.name || "Người dùng"}
                message={lastMsg}
                time={timeDisplay}
                unreadCount={item.unreadCount}
                isVerified={false}
                onPress={() => router.push(`/chat/${item.id}?name=${encodeURIComponent(item.name || "")}`)}
            />
        );
    };

    return (
        <View className="flex-1 bg-black">
            <ChatListHeader />
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0068FF" />
                </View>
            ) : error ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-red-400 mb-2">Không thể tải danh sách tin nhắn</Text>
                    <Text className="text-gray-400 text-xs">{error}</Text>
                    <Text className="text-blue-400 mt-4" onPress={onRefresh}>Thử lại</Text>
                </View>
            ) : chats.length === 0 ? (
                <FlatList
                    contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    data={[]}
                    renderItem={null}
                    ListEmptyComponent={() => (
                        <View className="items-center">
                            <Text className="text-gray-400">Chưa có cuộc trò chuyện nào</Text>
                        </View>
                    )}
                />
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={(item) => item.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListHeaderComponent={() => (
                        <View>
                            <PinnedCloudItem />
                        </View>
                    )}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}
