import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { MessageDynamo } from "@/shared/services/chatService";
import { formatTime } from "@/shared/utils/dateUtils";

interface ReplyPreview {
    senderName?: string;
    content: string;
}

interface MessageBubbleProps {
    message: MessageDynamo;
    isMe: boolean;
    showSenderName?: boolean; // for group chats
    onLongPress?: (message: MessageDynamo) => void;
    onPress?: (message: MessageDynamo) => void;
    replyPreview?: ReplyPreview | null;
}

// Tạo màu nhất quán cho mỗi tên (giống Zalo)
function getNameColor(name: string): string {
    const colors = [
        "#e74c3c", // đỏ
        "#3498db", // xanh dương
        "#2ecc71", // xanh lá
        "#e67e22", // cam
        "#9b59b6", // tím
        "#1abc9c", // xanh ngọc
        "#f39c12", // vàng
        "#e91e63", // hồng
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

export default function MessageBubble({
    message,
    isMe,
    showSenderName,
    onLongPress,
    onPress,
    replyPreview,
}: MessageBubbleProps) {
    const senderName = message.senderName;
    const isRecalled = message.recalled;
    const time =
        message.createdAt && !isNaN(Date.parse(message.createdAt))
            ? formatTime(message.createdAt)
            : "";

    const handlePress = () => {
        if (onPress) {
            onPress(message);
        }
    };

    const handleLongPress = () => {
        if (onLongPress) {
            onLongPress(message);
        }
    };

    const bubbleBackground = isMe ? "#0091FF" : "#2a2a2a";
    const textColor = isRecalled ? "#9ca3af" : "#ffffff";

    return (
        <View
            style={{
                paddingHorizontal: 12,
                paddingVertical: 2,
                alignItems: isMe ? "flex-end" : "flex-start",
            }}
        >
            <TouchableOpacity
                activeOpacity={0.8}
                delayLongPress={250}
                onPress={handlePress}
                onLongPress={handleLongPress}
            >
                {/* Bubble */}
                <View
                    style={{
                        maxWidth: "75%",
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        backgroundColor: bubbleBackground,
                        borderRadius: 16,
                        ...(isMe
                            ? { borderBottomRightRadius: 4 }
                            : { borderBottomLeftRadius: 4 }),
                        opacity: isRecalled ? 0.8 : 1,
                    }}
                >
                    {/* Preview reply (nếu có) */}
                    {replyPreview && (
                        <View
                            style={{
                                marginBottom: 6,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderLeftWidth: 2,
                                borderLeftColor: "#6b7280",
                                backgroundColor: "#111827",
                                borderRadius: 6,
                            }}
                        >
                            {replyPreview.senderName && (
                                <Text
                                    style={{
                                        color: "#9ca3af",
                                        fontSize: 11,
                                        fontWeight: "600",
                                        marginBottom: 2,
                                    }}
                                >
                                    {replyPreview.senderName}
                                </Text>
                            )}
                            <Text
                                numberOfLines={2}
                                style={{
                                    color: "#e5e7eb",
                                    fontSize: 11,
                                }}
                            >
                                {replyPreview.content}
                            </Text>
                        </View>
                    )}

                    {/* Tên người gửi trong group */}
                    {showSenderName && !isMe && senderName && (
                        <Text
                            style={{
                                fontSize: 12,
                                color: getNameColor(senderName),
                                fontWeight: "700",
                                marginBottom: 2,
                            }}
                        >
                            {senderName}
                        </Text>
                    )}

                    <Text
                        style={{
                            color: textColor,
                            fontSize: 15,
                            lineHeight: 20,
                            fontStyle: isRecalled ? "italic" : "normal",
                        }}
                    >
                        {isRecalled ? "Tin nhắn đã được thu hồi" : message.content}
                    </Text>
                    {time ? (
                        <Text
                            style={{
                                fontSize: 11,
                                marginTop: 4,
                                color: isMe ? "#b3d9ff" : "#888",
                                textAlign: "right",
                            }}
                        >
                            {time}
                        </Text>
                    ) : null}
                </View>

                {/* Reactions – hiển thị nhỏ phía dưới bong bóng */}
                {Array.isArray(message.reactions) && message.reactions.length > 0 && (
                    <View
                        style={{
                            flexDirection: "row",
                            alignSelf: isMe ? "flex-end" : "flex-start",
                            marginTop: 2,
                            marginRight: isMe ? 8 : 0,
                            marginLeft: !isMe ? 8 : 0,
                            backgroundColor: "#111827",
                            borderRadius: 999,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                        }}
                    >
                        {Object.entries(
                            message.reactions.reduce<Record<string, number>>((acc, r) => {
                                if (!r?.emoji) return acc;
                                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                return acc;
                            }, {})
                        ).map(([emoji, count]) => (
                            <View
                                key={emoji}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginHorizontal: 2,
                                }}
                            >
                                <Text style={{ fontSize: 11, marginRight: 2 }}>{emoji}</Text>
                                <Text
                                    style={{
                                        color: "#e5e7eb",
                                        fontSize: 9,
                                        fontWeight: "600",
                                    }}
                                >
                                    {count}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}
