import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFriendStore } from "@/shared/store/friendStore";
import type { FriendResponseDto } from "@/shared/services/types";
import { PROFILE_COLORS } from "../profile/styles";
import { useRouter } from "expo-router";

export default function FriendRequestsMobile() {
    const {
        requests,
        sentRequests,
        loading,
        error,
        fetchRequests,
        fetchSentRequests,
        acceptRequest,
        rejectRequest,
        cancelSentRequest,
        clearError,
    } = useFriendStore();
    const router = useRouter();
    const [tab, setTab] = useState<"received" | "sent">("received");

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (async () => {
            await Promise.all([fetchRequests(), fetchSentRequests()]);
        })();
    }, [fetchRequests, fetchSentRequests]);

    const handleAccept = async (id: string) => {
        try {
            await acceptRequest(id);
        } catch {
            // lỗi đã nằm trong store
        }
    };

    const handleReject = async (id: string) => {
        try {
            await rejectRequest(id);
        } catch {
            // lỗi đã nằm trong store
        }
    };

    const handleCancelSent = async (id: string) => {
        try {
            await cancelSentRequest(id);
        } catch {
            // lỗi đã nằm trong store
        }
    };

    const renderReceivedItem = ({ item }: { item: FriendResponseDto }) => {
        const user = item.user; // user = người gửi, friend = người nhận (current user)
        const displayName = user.displayName || user.username || "Người dùng";
        const initial =
            (displayName.charAt(0).toUpperCase() || "?").toUpperCase();

        return (
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderBottomWidth: 0.5,
                    borderBottomColor: "#262626",
                    backgroundColor: PROFILE_COLORS.background,
                }}
            >
                <View
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: "#2f3134",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                    }}
                >
                    <Text
                        style={{
                            color: PROFILE_COLORS.text,
                            fontWeight: "600",
                            fontSize: 16,
                        }}
                    >
                        {initial}
                    </Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text
                        numberOfLines={1}
                        style={{
                            color: PROFILE_COLORS.text,
                            fontSize: 15,
                            fontWeight: "500",
                        }}
                    >
                        {displayName}
                    </Text>
                    <Text
                        style={{
                            color: PROFILE_COLORS.textSecondary,
                            fontSize: 12,
                            marginTop: 2,
                        }}
                    >
                        Muốn kết bạn
                    </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => handleReject(item.id)}
                        style={{
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: "#f97373",
                        }}
                    >
                        <Text
                            style={{
                                color: "#fca5a5",
                                fontSize: 12,
                                fontWeight: "500",
                            }}
                        >
                            Từ chối
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleAccept(item.id)}
                        style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 999,
                            backgroundColor: PROFILE_COLORS.primary,
                        }}
                    >
                        <Text
                            style={{
                                color: "#fff",
                                fontSize: 12,
                                fontWeight: "600",
                            }}
                        >
                            Đồng ý
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderSentItem = ({ item }: { item: FriendResponseDto }) => {
        const user = item.friend; // với request mình gửi, friend = người nhận
        const displayName = user.displayName || user.username || "Người dùng";
        const initial =
            (displayName.charAt(0).toUpperCase() || "?").toUpperCase();

        return (
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderBottomWidth: 0.5,
                    borderBottomColor: "#262626",
                    backgroundColor: PROFILE_COLORS.background,
                }}
            >
                <View
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: "#2f3134",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                    }}
                >
                    <Text
                        style={{
                            color: PROFILE_COLORS.text,
                            fontWeight: "600",
                            fontSize: 16,
                        }}
                    >
                        {initial}
                    </Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text
                        numberOfLines={1}
                        style={{
                            color: PROFILE_COLORS.text,
                            fontSize: 15,
                            fontWeight: "500",
                        }}
                    >
                        {displayName}
                    </Text>
                    <Text
                        style={{
                            color: PROFILE_COLORS.textSecondary,
                            fontSize: 12,
                            marginTop: 2,
                        }}
                    >
                        Bạn đã gửi lời mời
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => handleCancelSent(item.id)}
                    style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: "#f97373",
                    }}
                >
                    <Text
                        style={{
                            color: "#fca5a5",
                            fontSize: 12,
                            fontWeight: "500",
                        }}
                    >
                        Hủy
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    const currentList = tab === "received" ? requests : sentRequests;

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: PROFILE_COLORS.background,
            }}
        >
            {/* Header: nút back + tiêu đề giống Zalo */}
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderBottomWidth: 0.5,
                    borderBottomColor: "#262626",
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
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
                            fontSize: 16,
                            fontWeight: "600",
                        }}
                    >
                        Lời mời kết bạn
                    </Text>
                </View>
                {/* Tabs Đã nhận / Đã gửi với số lượng, kiểu gạch chân giống Zalo */}
                <View
                    style={{
                        flexDirection: "row",
                        marginTop: 8,
                        justifyContent: "space-between",
                    }}
                >
                    {[
                        {
                            key: "received" as const,
                            label: `Đã nhận ${requests.length}`,
                        },
                        {
                            key: "sent" as const,
                            label: `Đã gửi ${sentRequests.length}`,
                        },
                    ].map((item) => {
                        const active = tab === item.key;
                        return (
                            <TouchableOpacity
                                key={item.key}
                                onPress={() =>
                                    setTab(item.key as "received" | "sent")
                                }
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    paddingBottom: 6,
                                    borderBottomWidth: active ? 2 : 0,
                                    borderBottomColor: active
                                        ? PROFILE_COLORS.primary
                                        : "transparent",
                                }}
                            >
                                <Text
                                    style={{
                                        color: active
                                            ? PROFILE_COLORS.text
                                            : PROFILE_COLORS.textSecondary,
                                        fontSize: 13,
                                        fontWeight: active ? "600" : "500",
                                    }}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {error ? (
                <TouchableOpacity
                    onPress={clearError}
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        backgroundColor: "#7f1d1d",
                    }}
                >
                    <Text
                        style={{
                            color: "#fee2e2",
                            fontSize: 12,
                        }}
                    >
                        {error} (chạm để ẩn)
                    </Text>
                </TouchableOpacity>
            ) : null}

            {loading && currentList.length === 0 ? (
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <ActivityIndicator color={PROFILE_COLORS.primary} />
                    <Text
                        style={{
                            marginTop: 8,
                            color: PROFILE_COLORS.textSecondary,
                            fontSize: 13,
                        }}
                    >
                        Đang tải lời mời kết bạn...
                    </Text>
                </View>
            ) : currentList.length === 0 ? (
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 32,
                    }}
                >
                    <Ionicons
                        name="mail-open-outline"
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
                        {tab === "received"
                            ? "Chưa có lời mời kết bạn nào"
                            : "Bạn chưa gửi lời mời kết bạn nào"}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={currentList}
                    keyExtractor={(item) => item.id}
                    renderItem={tab === "received" ? renderReceivedItem : renderSentItem}
                    contentContainerStyle={{ paddingBottom: 24 }}
                />
            )}
        </View>
    );
}

