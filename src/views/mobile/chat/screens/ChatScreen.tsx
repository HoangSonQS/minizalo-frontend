import React from "react";
import { View, KeyboardAvoidingView, Platform, FlatList } from "react-native";
import ChatHeader from "../components/ChatHeader";
import ChatFooter from "../components/ChatFooter";
import { useLocalSearchParams } from "expo-router";

export default function ChatScreen() {
    // Determine ID and Name from params. In a real app, we might fetch details by ID.
    // For now, we'll try to get 'name' from params or default to "User".
    const params = useLocalSearchParams();
    const { id, name } = params;

    const displayName = typeof name === 'string' ? name : "Người dùng";

    return (
        <View className="flex-1 bg-white">
            <ChatHeader name={displayName} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                className="flex-1"
            >
                <View className="flex-1">
                    {/* Placeholder for message list */}
                    <FlatList
                        data={[]}
                        renderItem={null}
                        contentContainerStyle={{ flexGrow: 1 }}
                    />
                </View>

                <ChatFooter />
            </KeyboardAvoidingView>
        </View>
    );
}
