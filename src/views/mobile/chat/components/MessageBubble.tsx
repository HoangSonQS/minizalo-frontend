import React from "react";
import { View, Text } from "react-native";

interface MessageBubbleProps {
    content: string;
    senderName?: string;
    time: string;
    isMe: boolean;
    showSenderName?: boolean; // for group chats
}

export default function MessageBubble({ content, senderName, time, isMe, showSenderName }: MessageBubbleProps) {
    return (
        <View className={`px-3 py-1 ${isMe ? "items-end" : "items-start"}`}>
            {/* Sender name for group chats */}
            {showSenderName && !isMe && senderName && (
                <Text className="text-xs text-gray-400 ml-2 mb-0.5">{senderName}</Text>
            )}

            {/* Bubble */}
            <View
                className={`max-w-[75%] px-3 py-2 ${isMe
                        ? "bg-[#0091FF] rounded-2xl rounded-br-sm"
                        : "bg-[#2a2a2a] rounded-2xl rounded-bl-sm"
                    }`}
            >
                <Text className="text-white text-[15px] leading-5">{content}</Text>
                <Text
                    className={`text-[11px] mt-1 ${isMe ? "text-blue-200" : "text-gray-400"
                        } text-right`}
                >
                    {time}
                </Text>
            </View>
        </View>
    );
}
