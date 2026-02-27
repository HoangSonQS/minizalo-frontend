import React, { useState, useCallback, useRef } from "react";
import { View, FlatList, ActivityIndicator, Text, RefreshControl, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { ChatListHeader } from "../components/ChatListHeader";
import { PinnedCloudItem } from "../components/PinnedCloudItem";
import { ChatItem } from "../components/ChatItem";
import { chatService, ChatRoomResponse } from "@/shared/services/chatService";
import { formatTime } from "@/shared/utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";

export default function ChatListScreen() {
    const router = useRouter();
    const [chats, setChats] = useState<ChatRoomResponse[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchChats().finally(() => setRefreshing(false));
    }, []);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasLoadedOnce = useRef(false);

    const fetchChats = async (showLoading = false) => {
        try {
            if (showLoading && !hasLoadedOnce.current) setLoading(true);
            setError(null);
            const data = await chatService.getChatRooms();
            setChats(data);
            hasLoadedOnce.current = true;
            // Fade in animation
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
            }).start();
        } catch (err: any) {
            console.log("Error fetching chats:", err);
            if (chats.length === 0) {
                setError(err.message || "Failed to fetch chats");
            }
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch when screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchChats(true);

            // Auto-refresh every 30 seconds while focused (background, no loading)
            const interval = setInterval(() => {
                fetchChats(false);
            }, 30000);

            return () => clearInterval(interval);
        }, [])
    );

    const renderItem = ({ item, index }: { item: ChatRoomResponse; index: number }) => {
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
            <Animated.View style={{ opacity: fadeAnim }}>
                <ChatItem
                    avatar={{ uri: avatarUri }}
                    name={item.name || "Người dùng"}
                    message={lastMsg}
                    time={timeDisplay}
                    unreadCount={item.unreadCount}
                    isVerified={false}
                    onPress={() => router.push(`/chat/${item.id}?name=${encodeURIComponent(item.name || "")}&type=${item.type || "DIRECT"}`)}
                />
            </Animated.View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#0c0c15ff' }}>
            <ChatListHeader />
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0c0c15' }}>
                    <ActivityIndicator size="large" color="#0068FF" />
                    <Text style={{ color: '#7f8c8d', marginTop: 12, fontSize: 13 }}>Đang tải tin nhắn...</Text>
                </View>
            ) : error ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0c0c15', paddingHorizontal: 32 }}>
                    <Ionicons name="cloud-offline-outline" size={48} color="#555" />
                    <Text style={{ color: '#e74c3c', marginTop: 12, fontSize: 15, fontWeight: '500' }}>Không thể tải danh sách tin nhắn</Text>
                    <Text style={{ color: '#7f8c8d', fontSize: 12, marginTop: 4 }}>{error}</Text>
                    <Text style={{ color: '#3498db', marginTop: 16, fontSize: 14, fontWeight: '500' }} onPress={onRefresh}>Thử lại</Text>
                </View>
            ) : chats.length === 0 ? (
                <FlatList
                    contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0c0c15' }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#0068FF"
                            colors={['#0068FF']}
                        />
                    }
                    data={[]}
                    renderItem={null}
                    ListEmptyComponent={() => (
                        <View style={{ alignItems: 'center', paddingHorizontal: 32 }}>
                            <Ionicons name="chatbubbles-outline" size={56} color="#555" />
                            <Text style={{ color: '#7f8c8d', fontSize: 15, marginTop: 12 }}>Chưa có cuộc trò chuyện nào</Text>
                            <Text style={{ color: '#555', fontSize: 12, marginTop: 4 }}>Bắt đầu trò chuyện với bạn bè ngay!</Text>
                        </View>
                    )}
                />
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#0068FF"
                            colors={['#0068FF']}
                        />
                    }
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
