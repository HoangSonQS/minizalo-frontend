import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
    Alert,
    Modal,
    TextInput,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFriendStore } from "@/shared/store/friendStore";
import type { FriendResponseDto } from "@/shared/services/types";
import { PROFILE_COLORS } from "../profile/styles";
import friendCategoryService, {
    type FriendCategory,
} from "@/shared/services/friendCategoryService";
import friendService from "@/shared/services/friendService";

type FriendsListMobileProps = {
    /** Chuỗi tìm kiếm từ header Contacts, lọc cục bộ danh sách bạn bè. */
    searchText?: string;
};

function getFriendUser(item: FriendResponseDto, currentUserId?: string | null) {
    // Hiện tại chưa cần currentUserId cho mobile: chỉ cần trả friend là user còn lại
    if (!currentUserId) return item.friend;
    return item.user.id === currentUserId ? item.friend : item.user;
}

export default function FriendsListMobile({ searchText = "" }: FriendsListMobileProps) {
    const { friends, loading, error, fetchFriends, removeFriend, clearError } =
        useFriendStore();

    const [categories, setCategories] = useState<FriendCategory[]>([]);
    const [friendCategoryMap, setFriendCategoryMap] = useState<
        Record<string, string | undefined>
    >({});
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
    const [manageCategoriesVisible, setManageCategoriesVisible] =
        useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
        null
    );
    const [editingCategoryName, setEditingCategoryName] = useState("");
    const [assignTarget, setAssignTarget] = useState<{
        userId: string;
        name: string;
    } | null>(null);

    const randomColor = () => {
        const palette = [
            "#ef4444",
            "#22c55e",
            "#f97316",
            "#8b5cf6",
            "#eab308",
            "#3b82f6",
        ];
        return palette[Math.floor(Math.random() * palette.length)];
    };

    useEffect(() => {
        // Tải danh sách bạn bè khi vào màn
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetchFriends();
    }, [fetchFriends]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [cats, assigns] = await Promise.all([
                    friendCategoryService.listCategories(),
                    friendCategoryService.listAssignments(),
                ]);
                if (cancelled) return;
                setCategories(cats);
                const map: Record<string, string> = {};
                assigns.forEach((a) => {
                    if (a.categoryId) {
                        map[a.targetUserId] = a.categoryId;
                    }
                });
                setFriendCategoryMap(map);
            } catch {
                // ignore lỗi mạng: vẫn cho phép xem danh sách bạn
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const groupedFriends = useMemo(() => {
        const normalizedSearch = searchText.trim().toLowerCase();
        const items = friends
            .map((item) => {
                const u = getFriendUser(item);
                const name = (u.displayName || u.username || "").trim();
                return { raw: item, user: u, name };
            })
            .filter(({ name }) =>
                normalizedSearch ? name.toLowerCase().includes(normalizedSearch) : true
            )
            .filter(({ user }) => {
                if (selectedCategoryId === "all") return true;
                const catId = friendCategoryMap[user.id];
                return catId === selectedCategoryId;
            })
            .sort((a, b) =>
                a.name.localeCompare(b.name, "vi", { sensitivity: "base" })
            );

        const groups: { key: string; data: typeof items }[] = [];
        const map: Record<string, typeof items> = {};

        for (const it of items) {
            const letter = it.name.charAt(0).toUpperCase() || "#";
            const key = /[A-ZÁÀÂÃĂẠẢẤẦẨẪẬẮẰẲẴẶÉÈẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ]/.test(
                letter
            )
                ? letter
                : "#";
            if (!map[key]) map[key] = [];
            map[key].push(it);
        }

        Object.keys(map)
            .sort((a, b) => a.localeCompare(b))
            .forEach((k) => {
                groups.push({ key: k, data: map[k] });
            });

        return groups;
    }, [friends, searchText, selectedCategoryId, friendCategoryMap]);

    const handleAssignCategory = async (userId: string, categoryId: string) => {
        const current = friendCategoryMap[userId];
        const nextCategoryId = current === categoryId ? undefined : categoryId;

        setFriendCategoryMap((prev) => {
            const next = { ...prev };
            if (!nextCategoryId) {
                delete next[userId];
            } else {
                next[userId] = nextCategoryId;
            }
            return next;
        });

        try {
            await friendCategoryService.assignCategory(
                userId,
                nextCategoryId ?? null
            );
        } catch {
            Alert.alert(
                "Lỗi",
                "Không cập nhật được thẻ phân loại. Vui lòng thử lại sau."
            );
        }
    };

    const handleClearCategory = async (userId: string) => {
        setFriendCategoryMap((prev) => {
            const next = { ...prev };
            delete next[userId];
            return next;
        });
        try {
            await friendCategoryService.assignCategory(userId, null);
        } catch {
            Alert.alert(
                "Lỗi",
                "Không hủy được thẻ phân loại. Vui lòng thử lại sau."
            );
        }
    };

    const handleAddCategory = async () => {
        const name = newCategoryName.trim();
        if (!name) return;
        const color = randomColor();
        try {
            const created = await friendCategoryService.createCategory({
                name,
                color,
            });
            setCategories((prev) => [...prev, created]);
            setNewCategoryName("");
        } catch {
            Alert.alert(
                "Lỗi",
                "Không thêm được thẻ phân loại. Vui lòng thử lại sau."
            );
        }
    };

    const handleSaveEditCategory = async () => {
        if (!editingCategoryId) return;
        const name = editingCategoryName.trim();
        if (!name) return;
        const current = categories.find((c) => c.id === editingCategoryId);
        if (!current) return;
        try {
            const updated = await friendCategoryService.updateCategory(
                editingCategoryId,
                { name, color: current.color }
            );
            setCategories((prev) =>
                prev.map((c) => (c.id === updated.id ? updated : c))
            );
            setEditingCategoryId(null);
            setEditingCategoryName("");
        } catch {
            Alert.alert(
                "Lỗi",
                "Không lưu được thẻ phân loại. Vui lòng thử lại sau."
            );
        }
    };

    const handleDeleteCategory = (id: string, name: string) => {
        Alert.alert(
            "Xóa thẻ phân loại",
            `Bạn có chắc chắn muốn xóa thẻ "${name}"?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        setCategories((prev) => prev.filter((c) => c.id !== id));
                        setFriendCategoryMap((prev) => {
                            const next = { ...prev };
                            Object.keys(next).forEach((friendId) => {
                                if (next[friendId] === id) {
                                    delete next[friendId];
                                }
                            });
                            return next;
                        });
                        try {
                            await friendCategoryService.deleteCategory(id);
                        } catch {
                            Alert.alert(
                                "Lỗi",
                                "Không xóa được thẻ phân loại. Vui lòng thử lại sau."
                            );
                        }
                    },
                },
            ]
        );
    };

    const handleRemoveFriend = (friendId: string, friendName: string) => {
        Alert.alert(
            "Xóa bạn",
            `Bạn có chắc chắn muốn xóa "${friendName}" khỏi danh sách bạn bè?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await removeFriend(friendId);
                        } catch {
                            // lỗi đã có trong store
                        }
                    },
                },
            ]
        );
    };

    const renderFriendRow = (item: FriendResponseDto) => {
        const u = getFriendUser(item);
        const displayName = u.displayName || u.username || "Người dùng";
        const initial =
            (displayName.charAt(0).toUpperCase() || "?").toUpperCase();
        const categoryId = friendCategoryMap[u.id];
        const category = categories.find((c) => c.id === categoryId);

        return (
            <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    backgroundColor: PROFILE_COLORS.background,
                }}
            >
                {/* Avatar tròn */}
                <View
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: "#2f3134",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                    }}
                >
                    {/* Sau có avatarUrl thì dùng Image */}
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

                {/* Tên & status */}
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
                    {category ? (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginTop: 2,
                            }}
                        >
                            <View
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: category.color,
                                    marginRight: 6,
                                }}
                            />
                            <Text
                                style={{
                                    color: PROFILE_COLORS.textSecondary,
                                    fontSize: 12,
                                }}
                            >
                                {category.name}
                            </Text>
                        </View>
                    ) : null}
                    {u.statusMessage ? (
                        <Text
                            numberOfLines={1}
                            style={{
                                color: PROFILE_COLORS.textSecondary,
                                fontSize: 12,
                                marginTop: 2,
                            }}
                        >
                            {u.statusMessage}
                        </Text>
                    ) : null}
                </View>

                {/* Action nhanh: Thẻ, Chặn & Xóa */}
                <TouchableOpacity
                    onPress={() =>
                        setAssignTarget({
                            userId: u.id,
                            name: displayName,
                        })
                    }
                    style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: "#4b5563",
                        marginLeft: 4,
                    }}
                >
                    <Text
                        style={{
                            color: "#9ca3af",
                            fontSize: 12,
                            fontWeight: "500",
                        }}
                    >
                        Thẻ
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={async () => {
                        try {
                            await friendService.blockUser(u.id);
                            // Cập nhật local: xóa khỏi friends nhưng KHÔNG xóa entry BLOCKED trong backend
                            useFriendStore.setState((prev) => ({
                                friends: prev.friends.filter(
                                    (f) =>
                                        f.user.id !== u.id &&
                                        f.friend.id !== u.id
                                ),
                            }));
                            Alert.alert(
                                "Đã chặn",
                                "Người này đã bị chặn và ẩn khỏi danh sách bạn."
                            );
                        } catch {
                            Alert.alert("Lỗi", "Không chặn được người này.");
                        }
                    }}
                    style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: "#4b5563",
                        marginLeft: 4,
                    }}
                >
                    <Text
                        style={{
                            color: "#9ca3af",
                            fontSize: 12,
                            fontWeight: "500",
                        }}
                    >
                        Chặn
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() =>
                        handleRemoveFriend(
                            u.id,
                            u.displayName || u.username || "người này"
                        )
                    }
                    style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: "#ef4444",
                        marginLeft: 4,
                    }}
                >
                    <Text
                        style={{
                            color: "#f97373",
                            fontSize: 12,
                            fontWeight: "500",
                        }}
                    >
                        Xóa
                    </Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderSection = ({
        item,
    }: {
        item: { key: string; data: { raw: FriendResponseDto }[] };
    }) => {
        return (
            <View>
                {/* Header chữ cái */}
                <View
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 6,
                        backgroundColor: "#111111",
                    }}
                >
                    <Text
                        style={{
                            color: PROFILE_COLORS.textSecondary,
                            fontSize: 12,
                            fontWeight: "600",
                        }}
                    >
                        {item.key}
                    </Text>
                </View>
                {item.data.map(({ raw }) => renderFriendRow(raw))}
            </View>
        );
    };

    const renderCategoryFilter = () => {
        return (
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderBottomWidth: 0.5,
                    borderBottomColor: "#262626",
                    backgroundColor: PROFILE_COLORS.background,
                }}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    <TouchableOpacity
                        onPress={() => setSelectedCategoryId("all")}
                        style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor:
                                selectedCategoryId === "all"
                                    ? PROFILE_COLORS.primary
                                    : "#4b5563",
                            marginRight: 8,
                        }}
                    >
                        <Text
                            style={{
                                color:
                                    selectedCategoryId === "all"
                                        ? PROFILE_COLORS.primary
                                        : PROFILE_COLORS.textSecondary,
                                fontSize: 12,
                                fontWeight: "500",
                            }}
                        >
                            Tất cả
                        </Text>
                    </TouchableOpacity>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={categories}
                        keyExtractor={(c) => c.id}
                        renderItem={({ item: c }) => {
                            const active = selectedCategoryId === c.id;
                            return (
                                <TouchableOpacity
                                    onPress={() =>
                                        setSelectedCategoryId(
                                            active ? "all" : c.id
                                        )
                                    }
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        paddingHorizontal: 10,
                                        paddingVertical: 4,
                                        borderRadius: 999,
                                        borderWidth: 1,
                                        borderColor: active ? c.color : "#4b5563",
                                        marginRight: 8,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: 5,
                                            backgroundColor: c.color,
                                            marginRight: 6,
                                        }}
                                    />
                                    <Text
                                        style={{
                                            color: active
                                                ? PROFILE_COLORS.text
                                                : PROFILE_COLORS.textSecondary,
                                            fontSize: 12,
                                        }}
                                    >
                                        {c.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
                <TouchableOpacity
                    onPress={() => setManageCategoriesVisible(true)}
                    style={{
                        marginLeft: 8,
                        padding: 6,
                        borderRadius: 999,
                    }}
                >
                    <Ionicons
                        name="settings-outline"
                        size={18}
                        color={PROFILE_COLORS.textSecondary}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: PROFILE_COLORS.background,
            }}
        >
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

            {renderCategoryFilter()}

            {loading && friends.length === 0 ? (
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
                        Đang tải danh sách bạn bè...
                    </Text>
                </View>
            ) : friends.length === 0 ? (
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 32,
                    }}
                >
                    <Ionicons
                        name="people-outline"
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
                        Bạn chưa có bạn bè nào
                    </Text>
                    <Text
                        style={{
                            marginTop: 4,
                            color: PROFILE_COLORS.textSecondary,
                            fontSize: 13,
                            textAlign: "center",
                        }}
                    >
                        Hãy chuyển sang tab “Tìm bạn” để gửi lời mời kết bạn.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={groupedFriends}
                    keyExtractor={(item) => item.key}
                    renderItem={renderSection}
                    contentContainerStyle={{ paddingBottom: 24 }}
                />
            )}
            {/* Modal gán thẻ phân loại */}
            {assignTarget && (
                <Modal
                    transparent
                    visible
                    animationType="slide"
                    onRequestClose={() => setAssignTarget(null)}
                >
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            justifyContent: "flex-end",
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: "#18181b",
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                                paddingHorizontal: 16,
                                paddingTop: 12,
                                paddingBottom: 24,
                                maxHeight: "70%",
                            }}
                        >
                            <View
                                style={{
                                    alignItems: "center",
                                    marginBottom: 8,
                                }}
                            >
                                <View
                                    style={{
                                        width: 40,
                                        height: 4,
                                        borderRadius: 999,
                                        backgroundColor: "#3f3f46",
                                    }}
                                />
                            </View>
                            <Text
                                style={{
                                    color: PROFILE_COLORS.text,
                                    fontSize: 16,
                                    fontWeight: "600",
                                    textAlign: "center",
                                    marginBottom: 4,
                                }}
                            >
                                Phân loại bạn bè
                            </Text>
                            <Text
                                style={{
                                    color: PROFILE_COLORS.textSecondary,
                                    fontSize: 13,
                                    textAlign: "center",
                                    marginBottom: 12,
                                }}
                            >
                                {assignTarget.name}
                            </Text>
                            <ScrollView
                                style={{ maxHeight: "80%" }}
                                contentContainerStyle={{ paddingBottom: 16 }}
                            >
                                {categories.map((c) => {
                                    const isSelected =
                                        friendCategoryMap[assignTarget.userId] ===
                                        c.id;
                                    return (
                                        <TouchableOpacity
                                            key={c.id}
                                            onPress={async () => {
                                                await handleAssignCategory(
                                                    assignTarget.userId,
                                                    c.id
                                                );
                                                setAssignTarget(null);
                                            }}
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                paddingVertical: 10,
                                            }}
                                        >
                                            <View
                                                style={{
                                                    width: 18,
                                                    height: 12,
                                                    borderRadius: 999,
                                                    backgroundColor: c.color,
                                                    marginRight: 10,
                                                }}
                                            />
                                            <Text
                                                style={{
                                                    flex: 1,
                                                    color: PROFILE_COLORS.text,
                                                    fontSize: 14,
                                                }}
                                            >
                                                {c.name}
                                            </Text>
                                            {isSelected && (
                                                <Ionicons
                                                    name="checkmark"
                                                    size={18}
                                                    color={PROFILE_COLORS.primary}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                                {friendCategoryMap[assignTarget.userId] ? (
                                    <TouchableOpacity
                                        onPress={async () => {
                                            await handleClearCategory(
                                                assignTarget.userId
                                            );
                                            setAssignTarget(null);
                                        }}
                                        style={{
                                            marginTop: 8,
                                            paddingVertical: 10,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: "#f97373",
                                                fontSize: 14,
                                                textAlign: "center",
                                            }}
                                        >
                                            Bỏ phân loại
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}
                            </ScrollView>
                            <TouchableOpacity
                                onPress={() => setAssignTarget(null)}
                                style={{
                                    marginTop: 8,
                                    paddingVertical: 10,
                                }}
                            >
                                <Text
                                    style={{
                                        color: PROFILE_COLORS.textSecondary,
                                        fontSize: 14,
                                        textAlign: "center",
                                    }}
                                >
                                    Đóng
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}

            {/* Modal quản lý thẻ phân loại */}
            {manageCategoriesVisible && (
                <Modal
                    transparent
                    visible
                    animationType="fade"
                    onRequestClose={() => setManageCategoriesVisible(false)}
                >
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            justifyContent: "center",
                            alignItems: "center",
                            paddingHorizontal: 16,
                        }}
                    >
                        <View
                            style={{
                                width: "100%",
                                maxWidth: 420,
                                backgroundColor: "#18181b",
                                borderRadius: 16,
                                paddingHorizontal: 16,
                                paddingVertical: 14,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 10,
                                }}
                            >
                                <Text
                                    style={{
                                        color: PROFILE_COLORS.text,
                                        fontSize: 16,
                                        fontWeight: "600",
                                    }}
                                >
                                    Quản lý thẻ phân loại
                                </Text>
                                <TouchableOpacity
                                    onPress={() =>
                                        setManageCategoriesVisible(false)
                                    }
                                >
                                    <Ionicons
                                        name="close"
                                        size={20}
                                        color={PROFILE_COLORS.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginBottom: 12,
                                }}
                            >
                                <TextInput
                                    placeholder="Thêm thẻ mới..."
                                    placeholderTextColor={
                                        PROFILE_COLORS.textSecondary
                                    }
                                    value={newCategoryName}
                                    onChangeText={setNewCategoryName}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        borderRadius: 999,
                                        borderWidth: 1,
                                        borderColor: "#27272a",
                                        paddingHorizontal: 12,
                                        color: PROFILE_COLORS.text,
                                        fontSize: 14,
                                        marginRight: 8,
                                    }}
                                />
                                <TouchableOpacity
                                    onPress={handleAddCategory}
                                    style={{
                                        paddingHorizontal: 14,
                                        paddingVertical: 8,
                                        borderRadius: 999,
                                        backgroundColor: PROFILE_COLORS.primary,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: "#fff",
                                            fontSize: 14,
                                            fontWeight: "500",
                                        }}
                                    >
                                        Thêm
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                style={{ maxHeight: 260 }}
                                contentContainerStyle={{ paddingBottom: 4 }}
                            >
                                {categories.map((c) => (
                                    <View
                                        key={c.id}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            paddingVertical: 8,
                                            borderBottomWidth: 0.5,
                                            borderBottomColor: "#27272a",
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 18,
                                                height: 12,
                                                borderRadius: 999,
                                                backgroundColor: c.color,
                                                marginRight: 10,
                                            }}
                                        />
                                        {editingCategoryId === c.id ? (
                                            <TextInput
                                                value={editingCategoryName}
                                                onChangeText={
                                                    setEditingCategoryName
                                                }
                                                style={{
                                                    flex: 1,
                                                    height: 36,
                                                    borderRadius: 8,
                                                    borderWidth: 1,
                                                    borderColor: "#27272a",
                                                    paddingHorizontal: 10,
                                                    color: PROFILE_COLORS.text,
                                                    fontSize: 14,
                                                }}
                                            />
                                        ) : (
                                            <Text
                                                style={{
                                                    flex: 1,
                                                    color: PROFILE_COLORS.text,
                                                    fontSize: 14,
                                                }}
                                            >
                                                {c.name}
                                            </Text>
                                        )}

                                        {editingCategoryId === c.id ? (
                                            <>
                                                <TouchableOpacity
                                                    onPress={
                                                        handleSaveEditCategory
                                                    }
                                                    style={{
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 6,
                                                        borderRadius: 8,
                                                        backgroundColor:
                                                            "#22c55e",
                                                        marginLeft: 6,
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            color: "#fff",
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        Lưu
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setEditingCategoryId(
                                                            null
                                                        );
                                                        setEditingCategoryName(
                                                            ""
                                                        );
                                                    }}
                                                    style={{
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 6,
                                                        borderRadius: 8,
                                                        borderWidth: 1,
                                                        borderColor: "#27272a",
                                                        marginLeft: 6,
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            color: PROFILE_COLORS.textSecondary,
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        Hủy
                                                    </Text>
                                                </TouchableOpacity>
                                            </>
                                        ) : (
                                            <>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setEditingCategoryId(
                                                            c.id
                                                        );
                                                        setEditingCategoryName(
                                                            c.name
                                                        );
                                                    }}
                                                    style={{
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 6,
                                                        borderRadius: 8,
                                                        borderWidth: 1,
                                                        borderColor: "#27272a",
                                                        marginLeft: 6,
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            color: PROFILE_COLORS.textSecondary,
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        Sửa
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        handleDeleteCategory(
                                                            c.id,
                                                            c.name
                                                        )
                                                    }
                                                    style={{
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 6,
                                                        borderRadius: 8,
                                                        borderWidth: 1,
                                                        borderColor: "#fecaca",
                                                        marginLeft: 6,
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            color: "#f97373",
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        Xóa
                                                    </Text>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                ))}
                            </ScrollView>

                            <TouchableOpacity
                                onPress={() => setManageCategoriesVisible(false)}
                                style={{
                                    marginTop: 10,
                                    paddingVertical: 10,
                                }}
                            >
                                <Text
                                    style={{
                                        color: PROFILE_COLORS.textSecondary,
                                        fontSize: 14,
                                        textAlign: "center",
                                    }}
                                >
                                    Đóng
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

