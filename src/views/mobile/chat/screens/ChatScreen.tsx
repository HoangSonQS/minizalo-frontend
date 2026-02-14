import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, FlatList, ActivityIndicator, Text, KeyboardAvoidingView, Platform } from "react-native";
import { useRoute } from "@react-navigation/native";
import ChatHeader from "../components/ChatHeader";
import ChatFooter from "../components/ChatFooter";
import MessageBubble from "../components/MessageBubble";
import { chatService, MessageDynamo } from "@/shared/services/chatService";
import { useUserStore } from "@/shared/store/userStore";
import { formatTime } from "@/shared/utils/dateUtils";

export default function ChatScreen() {
    const route = useRoute<any>();
    const { id, name } = route.params || {};
    const roomId = typeof id === "string" ? id : "";
    const displayName = typeof name === "string" ? name : "Người dùng";

    const [messages, setMessages] = useState<MessageDynamo[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const currentUserId = useUserStore((s) => s.profile?.id);
    const isFetchingRef = useRef(false);

    // Fetch chat history with timeout protection
    const fetchMessages = useCallback(async () => {
        if (!roomId || isFetchingRef.current) return;
        isFetchingRef.current = true;

        try {
            // Add 5s timeout to prevent hanging
            const timeoutPromise = new Promise<null>((_, reject) =>
                setTimeout(() => reject(new Error("Timeout")), 5000)
            );
            const result = await Promise.race([
                chatService.getChatHistory(roomId),
                timeoutPromise,
            ]);
            if (result?.messages) {
                setMessages(result.messages.reverse());
            }
        } catch (err) {
            console.log("Error/timeout fetching messages:", err);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [roomId]);

    useEffect(() => {
        fetchMessages();

        // Poll every 10 seconds (not 5s to avoid request pile-up)
        const interval = setInterval(fetchMessages, 10000);

        // Safety: force stop loading after 3s even if API hangs
        const loadingTimeout = setTimeout(() => setLoading(false), 3000);

        return () => {
            clearInterval(interval);
            clearTimeout(loadingTimeout);
        };
    }, [fetchMessages]);

    // Send message
    const handleSend = async (content: string) => {
        if (!roomId || sending) return;
        setSending(true);

        // Optimistic: add message to list immediately
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

        // Scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        try {
            await chatService.sendMessage(roomId, content);
            // Refresh to get the real message from server
            await fetchMessages();
        } catch (err) {
            console.log("Error sending message:", err);
        } finally {
            setSending(false);
        }
    };

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
                showSenderName={false}
            />
        );
    };

    return (
        <View className="flex-1 bg-[#0e0e0e]">
            <ChatHeader name={displayName} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                className="flex-1"
            >
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#0091FF" />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.messageId}
                        renderItem={renderMessage}
                        contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={() => {
                            flatListRef.current?.scrollToEnd({ animated: false });
                        }}
                        ListEmptyComponent={() => (
                            <View className="flex-1 justify-center items-center">
                                <Text className="text-gray-500">Hãy gửi tin nhắn đầu tiên! 👋</Text>
                            </View>
                        )}
                    />
                )}

                <ChatFooter onSend={handleSend} />
            </KeyboardAvoidingView>
        </View>
    );
}
