import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar } from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface ChatHeaderProps {
    name: string;
    onBack?: () => void;
}

export default function ChatHeader({ name, onBack }: ChatHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <View className="bg-[#1a1a1a] pt-0">
            {/* Status bar spacer managed by SafeAreaView or manual padding if needed, 
                but usually header height handles it. 
                For Zalo style, the header is blue.
            */}

            <SafeAreaView>
                <View className="flex-row items-center justify-between px-3 h-[50px] space-x-2">
                    {/* Left: Back & Name */}
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity onPress={handleBack} className="mr-2">
                            <Ionicons name="chevron-back" size={28} color="white" />
                        </TouchableOpacity>

                        <View className="flex-1">
                            <Text className="text-white text-lg font-bold" numberOfLines={1}>
                                {name}
                            </Text>
                            <Text className="text-blue-100 text-xs">
                                Vừa mới truy cập
                            </Text>
                        </View>
                    </View>

                    {/* Right: Actions */}
                    <View className="flex-row items-center space-x-7">
                        <TouchableOpacity>
                            <Ionicons name="call-outline" size={24} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Ionicons name="videocam-outline" size={26} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Ionicons name="menu-outline" size={26} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}
