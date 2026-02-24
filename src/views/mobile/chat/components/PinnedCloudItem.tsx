import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const PinnedCloudItem = () => {
    return (
        <TouchableOpacity className="flex-row items-center bg-[#1a1a1a] px-4 py-2.5 border-b border-[#333]">
            <View className="relative mr-3" >
                <View className="w-[52px] h-[52px] rounded-full bg-[#1e3a5f] items-center justify-center overflow-hidden">
                    <Ionicons name="cloud-outline" size={28} color="#4da6ff" />
                </View>
            </View>

            <View className="flex-1 justify-center h-[52px]">
                <View className="flex-row justify-between items-center">
                    <Text className="text-[16px] font-normal text-white">Cloud của tôi</Text>
                </View>
                <View className="flex-row items-center mt-0.5">
                    <Text className="text-[14px] text-blue-400" numberOfLines={1}>Cuộc trò chuyện này đang được ghim</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};
