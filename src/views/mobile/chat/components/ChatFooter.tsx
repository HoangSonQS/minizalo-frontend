import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons, SimpleLineIcons } from "@expo/vector-icons";

export default function ChatFooter() {
    const [message, setMessage] = useState("");

    return (
        <View className="flex-row items-center px-2 py-2 bg-white border-t border-gray-200" style={{ paddingBottom: 30, paddingLeft: 20, paddingRight: 20 }}>
            {/* Sticker Icon */}
            <TouchableOpacity className="mr-2">
                <MaterialIcons name="emoji-emotions" size={26} color="#767676" />
            </TouchableOpacity>

            {/* Input Field */}
            <View className="flex-1 mr-2">
                <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Tin nhắn"
                    placeholderTextColor="#767676"
                    className="text-base text-gray-800 py-1"
                    multiline
                />
            </View>

            {/* Right Icons: More, Mic, Image */}
            <View className="flex-row items-center space-x-3">
                <TouchableOpacity>
                    <SimpleLineIcons name="options" size={22} color="#767676" />
                </TouchableOpacity>

                <TouchableOpacity>
                    <Ionicons name="mic-outline" size={26} color="#767676" />
                </TouchableOpacity>

                <TouchableOpacity>
                    <Ionicons name="image-outline" size={26} color="#767676" />
                </TouchableOpacity>

                {message.length > 0 && (
                    <TouchableOpacity>
                        <Ionicons name="send" size={26} color="#0091FF" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
