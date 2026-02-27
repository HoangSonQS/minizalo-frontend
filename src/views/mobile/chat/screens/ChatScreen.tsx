import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, FlatList, Text, KeyboardAvoidingView, Platform, Animated, Dimensions } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import ChatHeader from "../components/ChatHeader";
import ChatFooter from "../components/ChatFooter";
import MessageBubble from "../components/MessageBubble";
import { chatService, MessageDynamo } from "@/shared/services/chatService";
import { webSocketService } from "@/shared/services/WebSocketService";
import { useUserStore } from "@/shared/store/userStore";
import { formatTime } from "@/shared/utils/dateUtils";
import GroupInfoScreen from "../components/GroupInfoScreen";
import ChatOptionsScreen from "./ChatOptionsScreen";
import { useChatStore } from "@/shared/store/useChatStore";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function ChatScreen() {
    const route = useRoute<any>();
    const router = useRouter();
    const { id, name, type } = route.params || {};
    const roomId = typeof id === "string" ? id : "";
    const displayName = typeof name === "string" ? name : "Người dùng";
    const roomType = typeof type === "string" ? type : "DIRECT";

    const [messages, setMessages] = useState<MessageDynamo[]>([]);
    const [sending, setSending] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const [showChatOptions, setShowChatOptions] = useState(false);
    const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
    const slideOptionsAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

    const openGroupInfo = () => {
        setShowGroupInfo(true);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeGroupInfo = () => {
        Animated.timing(slideAnim, {
            toValue: SCREEN_WIDTH,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setShowGroupInfo(false));
    };

    const openChatOptions = () => {
        setShowChatOptions(true);
        Animated.spring(slideOptionsAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
        }).start();
    };

    const closeChatOptions = () => {
        Animated.timing(slideOptionsAnim, {
            toValue: SCREEN_WIDTH,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setShowChatOptions(false));
    };

    const currentUserId = useUserStore((s) => s.profile?.id);

    // ─── Load chat history ───
    const fetchMessages = useCallback(async () => {
        if (!roomId) return;
        try {
            const result = await chatService.getChatHistory(roomId);
            console.log("📜 History result:", result?.messages?.length ?? 0, "messages");
            if (result?.messages && result.messages.length > 0) {
                setMessages(result.messages.reverse());
            }
        } catch (err) {
            console.log("Error fetching messages:", err);
        } finally {
            setLoaded(true);
        }
    }, [roomId]);

    // ─── Reset Unread Count via Store ───
    useEffect(() => {
        if (roomId) {
            useChatStore.getState().setCurrentRoom(roomId as string);
        }
        return () => {
            useChatStore.getState().setCurrentRoom(null);
        };
    }, [roomId]);

    // ─── WebSocket: subscribe to room for realtime ───
    useEffect(() => {
        if (!roomId) return;

        // Fetch history
        fetchMessages();

        // Activate WebSocket
        webSocketService.activate();

        // Subscribe to room topic
        const topic = `/topic/chat/${roomId}`;
        webSocketService.subscribe(topic, (stompMessage) => {
            try {
                const newMsg: MessageDynamo = JSON.parse(stompMessage.body);
                console.log("📨 WS message received:", newMsg.messageId);

                setMessages((prev) => {
                    // Don't add duplicates
                    if (prev.some((m) => m.messageId === newMsg.messageId)) {
                        return prev;
                    }
                    // Remove optimistic temp messages
                    const filtered = prev.filter(
                        (m) => !m.messageId.startsWith("temp-")
                    );
                    return [...filtered, newMsg];
                });

                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 150);
            } catch (err) {
                console.log("Error parsing WS message:", err);
            }
        });

        return () => {
            webSocketService.unsubscribe(topic);
        };
    }, [roomId, fetchMessages]);

    // ─── Send message ───
    const handleSend = async (content: string) => {
        if (!roomId || sending || !content.trim()) return;
        setSending(true);

        // Optimistic UI
        const optimisticMsg: MessageDynamo = {
            messageId: `temp-${Date.now()}`,
            chatRoomId: roomId,
            senderId: currentUserId || "",
            senderName: "Tôi",
            content,
            attachments: [],
            type: "TEXT",
            createdAt: new Date().toISOString(),
            replyToMessageId: "",
            read: false,
            readBy: [],
            reactions: [],
            recalled: false,
            recalledAt: "",
            pinned: false,
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        try {
            // Try WebSocket first
            const sentViaWs = webSocketService.sendChatMessage(roomId, content);
            if (!sentViaWs) {
                // Fallback to REST
                console.log("WS not connected, falling back to REST");
                await chatService.sendMessage(roomId, content);
                await fetchMessages();
            }
        } catch (err) {
            console.log("Error sending message:", err);
        } finally {
            setSending(false);
        }
    };

    // ─── Render ───
    const renderMessage = ({ item }: { item: MessageDynamo }) => {
        const isMe = item.senderId === currentUserId;
        let timeDisplay = "";
        if (item.createdAt) {
            timeDisplay = formatTime(item.createdAt);
        }
        return (
            <MessageBubble
                content={item.content || ""}
                senderName={item.senderName}
                time={timeDisplay}
                isMe={isMe}
                showSenderName={roomType === "GROUP"}
            />
        );
    };

    return (
        <View className="flex-1 bg-[#0e0e0e]">
            <ChatHeader
                name={displayName}
                roomType={roomType}
                onMenuPress={() => {
                    if (roomType === "GROUP") {
                        openGroupInfo();
                    } else {
                        openChatOptions();
                    }
                }}
            />

            {/* Group Info - Slide from right */}
            {showGroupInfo && (
                <Animated.View
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 100,
                        transform: [{ translateX: slideAnim }],
                    }}
                >
                    <GroupInfoScreen
                        roomId={roomId}
                        onClose={closeGroupInfo}
                    />
                </Animated.View>
            )}

            {/* Chat Options (Personal) - Slide from right */}
            {showChatOptions && (
                <Animated.View
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 100,
                        transform: [{ translateX: slideOptionsAnim }],
                    }}
                >
                    <ChatOptionsScreen
                        roomId={roomId}
                        name={displayName}
                        avatarUrl={useChatStore.getState().rooms.find(r => r.id === roomId)?.avatarUrl || undefined}
                        onClose={closeChatOptions}
                    />
                </Animated.View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                className="flex-1"
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.messageId}
                    renderItem={renderMessage}
                    contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => {
                        if (messages.length > 0) {
                            flatListRef.current?.scrollToEnd({ animated: false });
                        }
                    }}
                    ListEmptyComponent={() => (
                        <View className="flex-1 justify-center items-center">
                            <Text className="text-gray-500">
                                {loaded ? "Hãy gửi tin nhắn đầu tiên! 👋" : "Đang tải tin nhắn..."}
                            </Text>
                        </View>
                    )}
                />

                <ChatFooter onSend={handleSend} />
            </KeyboardAvoidingView>
        </View>
    );
}
