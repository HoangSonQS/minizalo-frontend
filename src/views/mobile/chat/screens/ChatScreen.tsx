import React, { useState, useCallback, useRef, useEffect } from "react";
import {
    View,
    FlatList,
    Text,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Dimensions,
    Modal,
    TouchableOpacity,
    Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import ChatHeader from "../components/ChatHeader";
import ChatFooter from "../components/ChatFooter";
import MessageBubble from "../components/MessageBubble";
import { chatService, MessageDynamo, MessageReaction } from "@/shared/services/chatService";
import { MessageService } from "@/shared/services/MessageService";
import { webSocketService } from "@/shared/services/WebSocketService";
import { useUserStore } from "@/shared/store/userStore";
import { formatTime } from "@/shared/utils/dateUtils";
import GroupInfoScreen from "../components/GroupInfoScreen";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function ChatScreen() {
    const route = useRoute<any>();
    const { id, name, type } = route.params || {};
    const roomId = typeof id === "string" ? id : "";
    const displayName = typeof name === "string" ? name : "Người dùng";
    const roomType = typeof type === "string" ? type : "DIRECT";

    const [messages, setMessages] = useState<MessageDynamo[]>([]);
    const [sending, setSending] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

    const [selectedMessage, setSelectedMessage] = useState<MessageDynamo | null>(null);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [showPinnedList, setShowPinnedList] = useState(false);
    const [replyTo, setReplyTo] = useState<{
        messageId: string;
        senderName?: string;
        content: string;
    } | null>(null);

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

    // ─── WebSocket: subscribe to room for realtime ───
    useEffect(() => {
        if (!roomId) return;

        // Fetch history
        fetchMessages();

        // Activate WebSocket
        webSocketService.activate();

        // Subscribe to room topic (tin nhắn mới)
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

        // Subscribe recall events
        const recallTopic = `/topic/chat/${roomId}/recall`;
        webSocketService.subscribe(recallTopic, (stompMessage) => {
            try {
                const payload = JSON.parse(stompMessage.body) as {
                    messageId?: string;
                    recalledAt?: string;
                };
                if (!payload?.messageId) return;
                setMessages((prev) =>
                    prev.map((m) =>
                        m.messageId === payload.messageId
                            ? {
                                  ...m,
                                  recalled: true,
                                  recalledAt: payload.recalledAt || new Date().toISOString(),
                              }
                            : m
                    )
                );
            } catch (err) {
                console.log("Error parsing recall WS message:", err);
            }
        });

        // Subscribe reaction events
        const reactionTopic = `/topic/chat/${roomId}/reaction`;
        webSocketService.subscribe(reactionTopic, (stompMessage) => {
            try {
                const payload = JSON.parse(stompMessage.body) as {
                    messageId?: string;
                    userId?: string;
                    emoji?: string | null;
                };
                if (!payload?.messageId || !payload.userId) return;
                setMessages((prev) =>
                    prev.map((m) => {
                        if (m.messageId !== payload.messageId) return m;
                        const reactions = Array.isArray(m.reactions) ? [...m.reactions] : [];
                        const filtered = reactions.filter((r) => r.userId !== payload.userId);
                        if (payload.emoji) {
                            filtered.push({
                                userId: payload.userId,
                                emoji: payload.emoji,
                            } as MessageReaction);
                        }
                        return { ...m, reactions: filtered };
                    })
                );
            } catch (err) {
                console.log("Error parsing reaction WS message:", err);
            }
        });

        // Subscribe pin events
        const pinTopic = `/topic/chat/${roomId}/pin`;
        webSocketService.subscribe(pinTopic, (stompMessage) => {
            try {
                const payload = JSON.parse(stompMessage.body) as {
                    messageId?: string;
                    isPinned?: boolean;
                };
                if (!payload?.messageId) return;
                setMessages((prev) =>
                    prev.map((m) =>
                        m.messageId === payload.messageId
                            ? { ...m, pinned: !!payload.isPinned }
                            : m
                    )
                );
            } catch (err) {
                console.log("Error parsing pin WS message:", err);
            }
        });

        return () => {
            webSocketService.unsubscribe(topic);
            webSocketService.unsubscribe(recallTopic);
            webSocketService.unsubscribe(reactionTopic);
            webSocketService.unsubscribe(pinTopic);
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
            replyToMessageId: replyTo?.messageId ?? "",
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
            // Gửi qua WebSocket trước; nếu không được thì fallback sang REST
            const sentViaWs = webSocketService.sendChatMessage(
                roomId,
                content,
                "TEXT",
                replyTo?.messageId
            );
            if (!sentViaWs) {
                console.log("WS not connected, falling back to REST");
                await chatService.sendMessage(roomId, content, replyTo?.messageId);
                await fetchMessages();
            }
        } catch (err) {
            console.log("Error sending message:", err);
        } finally {
            setSending(false);
            setReplyTo(null);
        }
    };

    const handleMessagePress = (message: MessageDynamo) => {
        // Sẽ dùng cho reply / xem chi tiết sau
        console.log("Pressed message:", message.messageId);
    };

    const handleMessageLongPress = (message: MessageDynamo) => {
        setSelectedMessage(message);
        setShowActionSheet(true);
    };

    const closeActionSheet = () => {
        setShowActionSheet(false);
        setSelectedMessage(null);
    };

    const handleRecall = () => {
        if (!selectedMessage || !roomId) return;
        if (selectedMessage.senderId !== currentUserId) {
            // Không cho thu hồi tin nhắn không phải của mình
            return;
        }

        Alert.alert(
            "Thu hồi tin nhắn",
            "Bạn có chắc muốn thu hồi tin nhắn này?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Thu hồi",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await MessageService.recallMessage(roomId, selectedMessage.messageId);
                            setMessages((prev) =>
                                prev.map((m) =>
                                    m.messageId === selectedMessage.messageId
                                        ? {
                                              ...m,
                                              recalled: true,
                                              recalledAt: new Date().toISOString(),
                                          }
                                        : m
                                )
                            );
                        } catch (err: any) {
                            console.log("Error recalling message:", err);
                            const status = err?.response?.status;
                            if (status === 400) {
                                Alert.alert(
                                    "Không thể thu hồi",
                                    "Tin nhắn đã gửi quá 5 phút nên không thể thu hồi nữa."
                                );
                            } else {
                                Alert.alert(
                                    "Lỗi",
                                    "Không thu hồi được tin nhắn. Vui lòng thử lại."
                                );
                            }
                        } finally {
                            closeActionSheet();
                        }
                    },
                },
            ]
        );
    };

    const handleStartReply = () => {
        if (!selectedMessage) return;
        setReplyTo({
            messageId: selectedMessage.messageId,
            senderName: selectedMessage.senderName,
            content: selectedMessage.content || "[Tin nhắn]",
        });
        setShowActionSheet(false);
    };

    const handleTogglePin = () => {
        if (!selectedMessage || !roomId) return;
        const nextPin = !selectedMessage.pinned;
        webSocketService.sendPin({
            roomId,
            messageId: selectedMessage.messageId,
            pin: nextPin,
        });
        closeActionSheet();
    };

    // ─── Render ───
    const renderMessage = ({ item }: { item: MessageDynamo }) => {
        const isMe = item.senderId === currentUserId;
        let timeDisplay = "";
        if (item.createdAt) {
            timeDisplay = formatTime(item.createdAt);
        }
        const replySource =
            item.replyToMessageId &&
            messages.find((m) => m.messageId === item.replyToMessageId);

        return (
            <MessageBubble
                message={item}
                isMe={isMe}
                showSenderName={roomType === "GROUP"}
                onPress={handleMessagePress}
                onLongPress={handleMessageLongPress}
                replyPreview={
                    replySource
                        ? {
                              senderName: replySource.senderName,
                              content: replySource.content || "[Tin nhắn]",
                          }
                        : null
                }
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

            {/* Header pinned messages */}
            {messages.some((m) => m.pinned) && (
                (() => {
                    const pinned = messages.filter((m) => m.pinned);
                    const latest = pinned[pinned.length - 1];
                    if (!latest) return null;
                    return (
                <View
                    style={{
                        paddingHorizontal: 12,
                        paddingTop: 4,
                    }}
                >
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={{
                                backgroundColor: "#111827",
                                borderRadius: 10,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                            onPress={() => {
                                // Mở danh sách tin nhắn đã ghim dạng overlay (Modal)
                                setShowPinnedList(true);
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    flex: 1,
                                }}
                            >
                                <Text style={{ color: "#facc15", marginRight: 6 }}>📌</Text>
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        color: "#e5e7eb",
                                        fontSize: 12,
                                        flex: 1,
                                    }}
                                >
                                    {latest.content || "[Tin nhắn đã ghim]"}
                                </Text>
                            </View>

                            {/* Số lượng + icon mở rộng danh sách */}
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginLeft: 8,
                                }}
                            >
                                {pinned.length > 1 && (
                                    <Text
                                        style={{
                                            color: "#9ca3af",
                                            fontSize: 11,
                                            marginRight: 6,
                                        }}
                                    >
                                        +{pinned.length - 1}
                                    </Text>
                                )}
                                <Text style={{ color: "#9ca3af", fontSize: 14 }}>▾</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    );
                })()
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

                <ChatFooter
                    onSend={handleSend}
                    replyTo={replyTo}
                    onCancelReply={() => setReplyTo(null)}
                />
            </KeyboardAvoidingView>

            {/* Action sheet khi nhấn giữ tin nhắn */}
            <Modal
                transparent
                animationType="fade"
                visible={showActionSheet && !!selectedMessage}
                onRequestClose={closeActionSheet}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.4)",
                        justifyContent: "flex-end",
                    }}
                    onPress={closeActionSheet}
                >
                    <View
                        style={{
                            backgroundColor: "#1f2933",
                            paddingBottom: 24,
                            paddingTop: 8,
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                        }}
                    >
                        <View
                            style={{
                                alignSelf: "center",
                                width: 40,
                                height: 4,
                                borderRadius: 999,
                                backgroundColor: "#4b5563",
                                marginBottom: 12,
                            }}
                        />

                        {/* Hàng reaction giống Zalo */}
                        {selectedMessage && !selectedMessage.recalled && (
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-around",
                                    marginBottom: 16,
                                    paddingHorizontal: 24,
                                }}
                            >
                                {["❤️", "👍", "😂", "😮", "😢", "😡"].map((emoji) => (
                                    <TouchableOpacity
                                        key={emoji}
                                        onPress={async () => {
                                            if (!selectedMessage || !roomId || !currentUserId) return;
                                            try {
                                                const currentReaction = (selectedMessage.reactions || []).find(
                                                    (r) => r.userId === currentUserId
                                                );
                                                if (currentReaction && currentReaction.emoji === emoji) {
                                                    await MessageService.removeReaction(
                                                        roomId,
                                                        selectedMessage.messageId
                                                    );
                                                } else {
                                                    await MessageService.setReaction(
                                                        roomId,
                                                        selectedMessage.messageId,
                                                        emoji
                                                    );
                                                }
                                            } catch (err) {
                                                console.log("Error sending reaction:", err);
                                            } finally {
                                                closeActionSheet();
                                            }
                                        }}
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 22,
                                            backgroundColor: "#111827",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Text style={{ fontSize: 24 }}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {selectedMessage?.senderId === currentUserId && !selectedMessage.recalled && (
                            <TouchableOpacity
                                onPress={handleRecall}
                                style={{
                                    paddingVertical: 12,
                                    paddingHorizontal: 20,
                                }}
                            >
                                <Text style={{ color: "#f97373", fontSize: 16, fontWeight: "600" }}>
                                    Thu hồi tin nhắn
                                </Text>
                            </TouchableOpacity>
                        )}

                        {selectedMessage && !selectedMessage.recalled && (
                            <TouchableOpacity
                                onPress={handleStartReply}
                                style={{
                                    paddingVertical: 12,
                                    paddingHorizontal: 20,
                                }}
                            >
                                <Text style={{ color: "#e5e7eb", fontSize: 16 }}>
                                    Trả lời
                                </Text>
                            </TouchableOpacity>
                        )}

                        {selectedMessage && (
                            <TouchableOpacity
                                onPress={handleTogglePin}
                                style={{
                                    paddingVertical: 12,
                                    paddingHorizontal: 20,
                                }}
                            >
                                <Text style={{ color: "#e5e7eb", fontSize: 16 }}>
                                    {selectedMessage.pinned ? "Bỏ ghim" : "Ghim"}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={closeActionSheet}
                            style={{
                                paddingVertical: 12,
                                paddingHorizontal: 20,
                            }}
                        >
                            <Text style={{ color: "#e5e7eb", fontSize: 16 }}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Danh sách tin nhắn đã ghim - overlay dạng bottom sheet */}
            <Modal
                transparent
                animationType="slide"
                visible={showPinnedList}
                onRequestClose={() => setShowPinnedList(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.4)",
                        justifyContent: "flex-end",
                    }}
                    onPress={() => setShowPinnedList(false)}
                >
                    <View
                        style={{
                            backgroundColor: "#111827",
                            paddingTop: 12,
                            paddingBottom: 24,
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                            maxHeight: "60%",
                        }}
                    >
                        <Text
                            style={{
                                color: "#e5e7eb",
                                fontSize: 16,
                                fontWeight: "600",
                                textAlign: "center",
                                marginBottom: 8,
                            }}
                        >
                            Tin nhắn đã ghim
                        </Text>

                        <View
                            style={{
                                maxHeight: "100%",
                            }}
                        >
                            {messages.filter((m) => m.pinned).length === 0 ? (
                                <Text
                                    style={{
                                        color: "#9ca3af",
                                        textAlign: "center",
                                        paddingVertical: 12,
                                    }}
                                >
                                    Chưa có tin nhắn nào được ghim.
                                </Text>
                            ) : (
                                messages
                                    .filter((m) => m.pinned)
                                    .map((m) => (
                                        <TouchableOpacity
                                            key={m.messageId}
                                            onPress={() => {
                                                const index = messages.findIndex(
                                                    (x) => x.messageId === m.messageId
                                                );
                                                if (index >= 0) {
                                                    flatListRef.current?.scrollToIndex({
                                                        index,
                                                        animated: true,
                                                    });
                                                }
                                                setShowPinnedList(false);
                                            }}
                                            style={{
                                                paddingHorizontal: 16,
                                                paddingVertical: 10,
                                                borderBottomWidth: 0.5,
                                                borderBottomColor: "#374151",
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: "#e5e7eb",
                                                    fontSize: 14,
                                                    marginBottom: 4,
                                                }}
                                                numberOfLines={2}
                                            >
                                                {m.content || "[Tin nhắn]"}
                                            </Text>
                                            <Text
                                                style={{
                                                    color: "#9ca3af",
                                                    fontSize: 12,
                                                }}
                                            >
                                                {formatTime(m.createdAt)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
