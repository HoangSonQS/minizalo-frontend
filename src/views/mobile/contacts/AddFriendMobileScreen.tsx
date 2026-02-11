import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { PROFILE_COLORS } from "../profile/styles";
import SearchUsersMobile from "./SearchUsersMobile";

export default function AddFriendMobileScreen() {
    const router = useRouter();

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: PROFILE_COLORS.background }}
            edges={["top"]}
        >
            {/* Header Thêm bạn */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderBottomWidth: 0.5,
                    borderBottomColor: "#262626",
                }}
            >
                <TouchableOpacity
                    onPress={() => router.replace("/(tabs)/contacts")}
                    style={{ padding: 4, marginRight: 8 }}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name="chevron-back"
                        size={22}
                        color={PROFILE_COLORS.text}
                    />
                </TouchableOpacity>
                <Text
                    style={{
                        color: PROFILE_COLORS.text,
                        fontSize: 16,
                        fontWeight: "600",
                    }}
                >
                    Thêm bạn
                </Text>
            </View>

            {/* Nội dung: tái sử dụng màn tìm kiếm người dùng, không có QR / gợi ý */}
            <SearchUsersMobile />
        </SafeAreaView>
    );
}

