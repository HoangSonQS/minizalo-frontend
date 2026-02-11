import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import FriendsListMobile from "./FriendsListMobile";
import { PROFILE_COLORS } from "../profile/styles";
import { useRouter } from "expo-router";
import { useFriendStore } from "@/shared/store/friendStore";
import { useUserStore } from "@/shared/store/userStore";
import type { UserProfile } from "@/shared/services/types";

type TabKey = "friends" | "groups";

const TABS: { key: TabKey; label: string }[] = [
    { key: "friends", label: "Bạn bè" },
    { key: "groups", label: "Nhóm" },
];

export default function ContactsMobileScreen() {
    const [activeTab, setActiveTab] = useState<TabKey>("friends");
    const [searchText, setSearchText] = useState("");
    const router = useRouter();
    const { friends, requests } = useFriendStore();
    const { profile } = useUserStore();
    const currentUserId = profile?.id ?? null;

    const birthdayFriends = useMemo<UserProfile[]>(() => {
        const result: UserProfile[] = [];
        const seen = new Set<string>();
        const nowYear = new Date().getFullYear();

        friends.forEach((f) => {
            const user =
                currentUserId && f.user.id === currentUserId ? f.friend : f.user;
            if (!user.dateOfBirth) return;
            if (seen.has(user.id)) return;
            // dateOfBirth là năm sinh; nếu <= năm hiện tại thì xem là hợp lệ
            const year = new Date(user.dateOfBirth).getFullYear();
            if (Number.isNaN(year) || year > nowYear) return;
            seen.add(user.id);
            result.push(user);
        });

        return result;
    }, [friends, currentUserId]);

    const renderTabContent = () => {
        switch (activeTab) {
            case "friends":
                return <FriendsListMobile searchText={searchText} />;
            case "groups":
                return (
                    <View
                        style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Text
                            style={{
                                color: PROFILE_COLORS.textSecondary,
                                fontSize: 14,
                            }}
                        >
                            Danh sách nhóm sẽ được phát triển sau.
                        </Text>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: PROFILE_COLORS.background,
            }}
            edges={["top"]}
        >
            {/* Header: ô tìm kiếm + icon thêm bạn */}
            <View
                style={{
                    paddingTop: Platform.OS === "android" ? 8 : 16,
                    paddingBottom: 8,
                    paddingHorizontal: 16,
                    backgroundColor: PROFILE_COLORS.background,
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            borderRadius: 10,
                            backgroundColor: "#2c2c2e",
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                        }}
                    >
                        <Ionicons
                            name="search"
                            size={18}
                            color={PROFILE_COLORS.textSecondary}
                            style={{ marginRight: 6 }}
                        />
                        <TextInput
                            value={searchText}
                            onChangeText={setSearchText}
                            placeholder="Tìm kiếm"
                            placeholderTextColor={PROFILE_COLORS.textSecondary}
                            style={{
                                flex: 1,
                                color: PROFILE_COLORS.text,
                                fontSize: 14,
                                paddingVertical: 0,
                            }}
                        />
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => router.push("/(tabs)/contacts-add")}
                        style={{
                            padding: 6,
                        }}
                    >
                        <Ionicons
                            name="person-add-outline"
                            size={22}
                            color={PROFILE_COLORS.text}
                        />
                    </TouchableOpacity>
                </View>

                {/* Tabs nhỏ dưới header */}
                <View
                    style={{
                        flexDirection: "row",
                        marginTop: 12,
                        borderRadius: 999,
                        backgroundColor: "#1f1f21",
                        padding: 2,
                    }}
                >
                    {TABS.map((tab) => {
                        const active = activeTab === tab.key;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                onPress={() => setActiveTab(tab.key)}
                                activeOpacity={0.9}
                                style={{
                                    flex: 1,
                                    paddingVertical: 6,
                                    borderRadius: 999,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: active ? "#fff" : "transparent",
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontWeight: "500",
                                        color: active ? "#111827" : PROFILE_COLORS.textSecondary,
                                    }}
                                >
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Hàng Lời mời kết bạn & Sinh nhật giống Zalo */}
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingTop: 8,
                    paddingBottom: 4,
                    backgroundColor: PROFILE_COLORS.background,
                }}
            >
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push("/(tabs)/contacts-requests")}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 10,
                    }}
                >
                    <View
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: "#1d4ed8",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 10,
                        }}
                    >
                        <Ionicons
                            name="person-add-outline"
                            size={18}
                            color="#fff"
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                color: PROFILE_COLORS.text,
                                fontSize: 14,
                                fontWeight: "500",
                            }}
                        >
                            Lời mời kết bạn
                        </Text>
                        <Text
                            style={{
                                color: PROFILE_COLORS.textSecondary,
                                fontSize: 12,
                                marginTop: 2,
                            }}
                        >
                            {requests.length > 0
                                ? `${requests.length} lời mời đang chờ`
                                : "Xem các lời mời kết bạn của bạn"}
                        </Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={PROFILE_COLORS.textSecondary}
                    />
                </TouchableOpacity>

                <View
                    style={{
                        height: 0.5,
                        backgroundColor: "#27272a",
                        marginVertical: 6,
                    }}
                />

                <BirthdaySection birthdayFriends={birthdayFriends} />
            </View>

            {/* Nội dung từng tab */}
            <View style={{ flex: 1 }}>{renderTabContent()}</View>
        </SafeAreaView>
    );
}

type BirthdaySectionProps = {
    birthdayFriends: UserProfile[];
};

function BirthdaySection({ birthdayFriends }: BirthdaySectionProps) {
    const router = useRouter();

    return (
        <View>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push("/(tabs)/contacts-birthdays")}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 10,
                }}
            >
                <View
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "#0ea5e9",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 10,
                    }}
                >
                    <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#fff"
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            color: PROFILE_COLORS.text,
                            fontSize: 14,
                            fontWeight: "500",
                        }}
                    >
                        Sinh nhật
                    </Text>
                    <Text
                        style={{
                            color: PROFILE_COLORS.textSecondary,
                            fontSize: 12,
                            marginTop: 2,
                        }}
                    >
                        {birthdayFriends.length > 0
                            ? `${birthdayFriends.length} bạn có sinh nhật`
                            : "Chưa có sinh nhật nào trong danh sách"}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={PROFILE_COLORS.textSecondary} />
            </TouchableOpacity>
        </View>
    );
}

