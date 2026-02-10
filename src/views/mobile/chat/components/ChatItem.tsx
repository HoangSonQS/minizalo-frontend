import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

interface ChatItemProps {
    avatar: any; // URL or local require
    name: string;
    message: string;
    time: string;
    unreadCount?: number;
    isVerified?: boolean; // For the checkmark
    isGroup?: boolean;
    onPress?: () => void;
}

export const ChatItem = ({ avatar, name, message, time, unreadCount, isVerified, onPress }: ChatItemProps) => {
    return (
        <TouchableOpacity onPress={onPress} className="flex-row items-center bg-white px-4 py-2.5 active:bg-gray-100">
            {/* Avatar Container */}
            <View className="relative mr-3">
                <Image source={avatar} className="w-[52px] h-[52px] rounded-full bg-gray-200" resizeMode="cover" />
                {isVerified && (
                    <View className="absolute bottom-0 right-0 bg-white rounded-full p-[1.5px]">
                        <View className="w-3 h-3 bg-white rounded-full items-center justify-center border border-gray-100">
                            <Text className="text-[7px] font-bold text-yellow-500">v</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Content Container */}
            <View className="flex-1 border-b border-gray-100 pb-2.5 justify-center h-[60px]">
                {/* Top Row: Name + Time */}
                <View className="flex-row justify-between items-center mb-0.5">
                    <View className="flex-row items-center flex-1 mr-2">
                        <Text className="text-[16px] font-normal text-gray-900" numberOfLines={1}>{name}</Text>
                        {isVerified && (
                            <View className="ml-1 bg-yellow-400 rounded-full w-3 h-3 justify-center items-center">
                                <Text className="text-[8px] text-white">✓</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-[12px] text-gray-500">{time}</Text>
                </View>

                {/* Bottom Row: Message + Badge */}
                <View className="flex-row justify-between items-center">
                    <Text
                        className={`text-[14px] flex-1 mr-4 ${unreadCount ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {message}
                    </Text>

                    {unreadCount && unreadCount > 0 ? (
                        <View className="bg-red-500 rounded-full min-w-[16px] h-[16px] items-center justify-center px-1">
                            <Text className="text-white text-[10px] font-bold">
                                {unreadCount > 5 ? '5+' : unreadCount}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );
};
