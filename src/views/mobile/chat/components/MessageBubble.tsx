import React from "react";
import { View, Text } from "react-native";

interface MessageBubbleProps {
    content: string;
    senderName?: string;
    time: string;
    isMe: boolean;
    showSenderName?: boolean; // for group chats
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

export default function MessageBubble({ content, senderName, time, isMe, showSenderName }: MessageBubbleProps) {
    return (
        <View style={{
            paddingHorizontal: 12,
            paddingVertical: 2,
            alignItems: isMe ? "flex-end" : "flex-start",
        }}>
            {/* Bubble */}
            <View
                style={{
                    maxWidth: "75%",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: isMe ? "#0091FF" : "#2a2a2a",
                    borderRadius: 16,
                    ...(isMe
                        ? { borderBottomRightRadius: 4 }
                        : { borderBottomLeftRadius: 4 }),
                }}
            >
                {/* Sender name inside bubble for group chats */}
                {showSenderName && !isMe && senderName && (
                    <Text style={{
                        fontSize: 12,
                        color: getNameColor(senderName),
                        fontWeight: "700",
                        marginBottom: 2,
                    }}>
                        {senderName}
                    </Text>
                )}

                <Text style={{ color: "#fff", fontSize: 15, lineHeight: 20 }}>
                    {content}
                </Text>
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
            </View>
        </View>
    );
}
