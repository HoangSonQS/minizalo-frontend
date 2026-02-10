import React from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const ChatListHeader = () => {
    return (
        <SafeAreaView className="bg-[#0091FF]" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
            <View className="flex-row items-center px-4 py-2 bg-[#0091FF] space-x-3">
                <View className="flex-1 flex-row items-center bg-transparent">
                    <Ionicons name="search" size={24} color="white" />
                    <Text className="text-white ml-3 text-base font-medium">Tìm kiếm</Text>
                </View>
                <View className="flex-row items-center space-x-4">
                    <TouchableOpacity>
                        <Ionicons name="qr-code-outline" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="add" size={30} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};
