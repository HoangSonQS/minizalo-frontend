import React, { useEffect, useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { PROFILE_COLORS } from "../profile/styles";
import { useFriendStore } from "@/shared/store/friendStore";
import { useUserStore } from "@/shared/store/userStore";
import type { UserProfile } from "@/shared/services/types";

type BirthdayItem = {
    user: UserProfile;
    date: Date;
};

export default function BirthdayListMobileScreen() {
    const router = useRouter();
    const { friends, fetchFriends } = useFriendStore();
    const { profile } = useUserStore();
    const currentUserId = profile?.id ?? null;

    useEffect(() => {
        if (!friends.length) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            fetchFriends();
        }
    }, [friends.length, fetchFriends]);

    const upcomingBirthdays = useMemo<BirthdayItem[]>(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const todayKey = now.getMonth() * 31 + now.getDate();
        const seen = new Set<string>();
        const list: BirthdayItem[] = [];

        friends.forEach((f) => {
            const u =
                currentUserId && f.user.id === currentUserId ? f.friend : f.user;
            if (!u.dateOfBirth || seen.has(u.id)) return;
            const d = new Date(u.dateOfBirth);
            if (Number.isNaN(d.getTime())) return;

            // Đưa sinh nhật về năm hiện tại để dễ so sánh / sort
            const normalized = new Date(currentYear, d.getMonth(), d.getDate());
            const key = normalized.getMonth() * 31 + normalized.getDate();

            // Chỉ lấy những ngày còn lại trong năm (>= hôm nay)
            if (key < todayKey) return;

            seen.add(u.id);
            list.push({ user: u, date: normalized });
        });

        list.sort((a, b) => +a.date - +b.date);
        return list;
    }, [friends, currentUserId]);

    const renderItem = ({ item }: { item: BirthdayItem }) => {
        const name = item.user.displayName || item.user.username || "Người dùng";
        const initial = name.charAt(0).toUpperCase() || "?";
        const weekday = item.date.toLocaleDateString("vi-VN", {
            weekday: "long",
        });
        const dayMonth = item.date.toLocaleDateString("vi-VN", {
            day: "numeric",
            month: "numeric",
        });

        return (
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
                <View
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: "#27272f",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                        overflow: "hidden",
                    }}
                >
                    {item.user.avatarUrl ? (
                        <Image
                            source={{ uri: item.user.avatarUrl }}
                            style={{ width: 40, height: 40 }}
                        />
                    ) : (
                        <Text
                            style={{
                                color: PROFILE_COLORS.text,
                                fontSize: 16,
                                fontWeight: "600",
                            }}
                        >
                            {initial}
                        </Text>
                    )}
                </View>
                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            color: PROFILE_COLORS.text,
                            fontSize: 15,
                            fontWeight: "500",
                        }}
                        numberOfLines={1}
                    >
                        {name}
                    </Text>
                    <Text
                        style={{
                            color: PROFILE_COLORS.textSecondary,
                            fontSize: 12,
                            marginTop: 2,
                        }}
                    >
                        {`${weekday.charAt(0).toUpperCase()}${weekday.slice(
                            1
                        )}, ${dayMonth}`}
                    </Text>
                </View>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: "#1d4ed8",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={16}
                        color="#1d4ed8"
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: PROFILE_COLORS.background }}
            edges={["top"]}
        >
            {/* Header giống Zalo: nút back + tiêu đề Sinh nhật */}
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
                    style={{ paddingRight: 8, paddingVertical: 4 }}
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
                        fontSize: 18,
                        fontWeight: "600",
                    }}
                >
                    Sinh nhật
                </Text>
            </View>

            <View
                style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderBottomWidth: 0.5,
                    borderBottomColor: "#262626",
                }}
            >
                <Text
                    style={{
                        color: PROFILE_COLORS.text,
                        fontSize: 14,
                        fontWeight: "600",
                    }}
                >
                    Sinh nhật sắp tới
                </Text>
            </View>

            {upcomingBirthdays.length === 0 ? (
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 32,
                    }}
                >
                    <Ionicons
                        name="calendar-outline"
                        size={40}
                        color={PROFILE_COLORS.textSecondary}
                    />
                    <Text
                        style={{
                            marginTop: 12,
                            color: PROFILE_COLORS.text,
                            fontSize: 16,
                            fontWeight: "500",
                            textAlign: "center",
                        }}
                    >
                        Chưa có sinh nhật nào sắp tới
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={upcomingBirthdays}
                    keyExtractor={(item) => item.user.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 24 }}
                />
            )}
        </SafeAreaView>
    );
}

