import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons, SimpleLineIcons } from "@expo/vector-icons";

interface ChatFooterProps {
    onSend?: (message: string) => void;
}

export default function ChatFooter({ onSend }: ChatFooterProps) {
    const [message, setMessage] = useState("");

    const handleSend = () => {
        const trimmed = message.trim();
        if (trimmed.length === 0) return;
        onSend?.(trimmed);
        setMessage("");
    };

    return (
        <View className="flex-row items-center px-2 py-2 bg-[#1a1a1a] border-t border-[#333]" style={{ paddingBottom: 30, paddingLeft: 20, paddingRight: 20 }}>
            {/* Sticker Icon */}
            <TouchableOpacity className="mr-2">
                <MaterialIcons name="emoji-emotions" size={26} color="#888" />
            </TouchableOpacity>

            {/* Input Field */}
            <View className="flex-1 mr-2">
                <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Tin nhắn"
                    placeholderTextColor="#666"
                    className="text-base text-white py-1"
                    multiline
                    onSubmitEditing={handleSend}
                />
            </View>

            {/* Right Icons */}
            <View className="flex-row items-center space-x-3">
                {message.trim().length > 0 ? (
                    <TouchableOpacity onPress={handleSend}>
                        <Ionicons name="send" size={26} color="#0091FF" />
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity>
                            <SimpleLineIcons name="options" size={22} color="#888" />
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Ionicons name="mic-outline" size={26} color="#888" />
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Ionicons name="image-outline" size={26} color="#888" />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}
