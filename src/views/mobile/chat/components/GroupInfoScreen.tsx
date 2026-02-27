import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    SafeAreaView,
    Platform,
    StatusBar,
    Alert,
    Switch,
    Modal,
    TextInput,
    FlatList,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { groupService } from "@/shared/services/groupService";
import { friendService } from "@/shared/services/friendService";
import { useAuthStore } from "@/shared/store/authStore";
import { GroupDetail } from "@/shared/types";

interface GroupInfoScreenProps {
    roomId: string;
    onClose: () => void;
}

// ─── Add Member Modal ───
interface Friend {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
}

function AddMemberModal({
    visible,
    onClose,
    groupId,
    existingMemberIds,
    onMembersAdded,
}: {
    visible: boolean;
    onClose: () => void;
    groupId: string;
    existingMemberIds: string[];
    onMembersAdded: (newGroup: GroupDetail) => void;
}) {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!visible) return;
        setLoading(true);
        setSelectedIds([]);
        setSearchQuery("");
        friendService
            .getFriends()
            .then((data) => {
                const mapped: Friend[] = (data as any[])
                    .map((f) => ({
                        id: f.friend?.id || f.id || "",
                        username: f.friend?.username || f.username || "",
                        fullName:
                            f.friend?.displayName ||
                            f.friend?.fullName ||
                            f.displayName ||
                            f.fullName ||
                            f.friend?.username ||
                            f.username ||
                            "",
                        avatarUrl: f.friend?.avatarUrl || f.avatarUrl || undefined,
                    }))
                    .filter((f) => !!f.id && !existingMemberIds.includes(f.id));
                setFriends(mapped);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [visible, existingMemberIds]);

    const filtered = friends.filter((f) => {
        const q = searchQuery.toLowerCase();
        return f.fullName.toLowerCase().includes(q) || f.username.toLowerCase().includes(q);
    });

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }, []);

    const handleAdd = async () => {
        if (selectedIds.length === 0) return;
        setSubmitting(true);
        try {
            const updated = await groupService.addMembersToGroup(groupId, selectedIds);
            onMembersAdded(updated);
            onClose();
        } catch (err: any) {
            Alert.alert("Lỗi", err?.response?.data?.message || "Thêm thành viên thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: "#0c0c15",
                    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
                }}
            >
                {/* Header */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderBottomWidth: 0.5,
                        borderBottomColor: "#2d2d44",
                    }}
                >
                    <TouchableOpacity onPress={onClose} style={{ padding: 4, marginRight: 12 }}>
                        <Ionicons name="close" size={26} color="#b0b3b8" />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 17, fontWeight: "600", color: "#e4e6eb" }}>
                            Thêm thành viên
                        </Text>
                        <Text style={{ fontSize: 12, color: "#7f8c8d", marginTop: 1 }}>
                            Đã chọn: {selectedIds.length}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleAdd}
                        disabled={selectedIds.length === 0 || submitting}
                        style={{
                            backgroundColor: selectedIds.length > 0 ? "#0068FF" : "#1c1c2e",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 16,
                        }}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text
                                style={{
                                    color: selectedIds.length > 0 ? "#fff" : "#555",
                                    fontWeight: "600",
                                    fontSize: 14,
                                }}
                            >
                                Thêm
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderBottomWidth: 0.5,
                        borderBottomColor: "#2d2d44",
                    }}
                >
                    <Ionicons name="search" size={18} color="#7f8c8d" style={{ marginRight: 8 }} />
                    <TextInput
                        placeholder="Tìm tên bạn bè"
                        placeholderTextColor="#7f8c8d"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={{ flex: 1, fontSize: 14, color: "#e4e6eb", paddingVertical: 4 }}
                    />
                </View>

                {/* List */}
                {loading ? (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator size="large" color="#0068FF" />
                    </View>
                ) : friends.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 }}>
                        <Ionicons name="people-outline" size={48} color="#555" />
                        <Text style={{ color: "#7f8c8d", fontSize: 14, marginTop: 10, textAlign: "center" }}>
                            Tất cả bạn bè đã trong nhóm
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            const isSelected = selectedIds.includes(item.id);
                            const avatar =
                                item.avatarUrl ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    item.fullName || item.username
                                )}&background=0068FF&color=fff&bold=true`;
                            return (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => toggleSelect(item.id)}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 22,
                                            height: 22,
                                            borderRadius: 11,
                                            borderWidth: 2,
                                            borderColor: isSelected ? "#0068FF" : "#555",
                                            backgroundColor: isSelected ? "#0068FF" : "transparent",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginRight: 12,
                                        }}
                                    >
                                        {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                                    </View>
                                    <Image
                                        source={{ uri: avatar }}
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 22,
                                            marginRight: 12,
                                            backgroundColor: "#2d2d44",
                                        }}
                                    />
                                    <Text style={{ fontSize: 15, color: "#e4e6eb" }} numberOfLines={1}>
                                        {item.fullName || item.username}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
}

// ─── Section Row Component ───
function SectionRow({
    icon,
    iconColor,
    label,
    subtitle,
    onPress,
    rightElement,
    showChevron = true,
}: {
    icon: string;
    iconColor?: string;
    label: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
}) {
    return (
        <TouchableOpacity
            activeOpacity={onPress ? 0.7 : 1}
            onPress={onPress}
            style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: 0.5,
                borderBottomColor: "#1c1c2e",
            }}
        >
            <Ionicons
                name={icon as any}
                size={22}
                color={iconColor || "#8e8e93"}
                style={{ marginRight: 14, width: 24, textAlign: "center" }}
            />
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, color: "#e4e6eb" }}>{label}</Text>
                {subtitle && (
                    <Text style={{ fontSize: 12, color: "#7f8c8d", marginTop: 2 }}>{subtitle}</Text>
                )}
            </View>
            {rightElement}
            {showChevron && !rightElement && (
                <Ionicons name="chevron-forward" size={18} color="#555" />
            )}
        </TouchableOpacity>
    );
}

// ─── Main GroupInfoScreen ───
export default function GroupInfoScreen({ roomId, onClose }: GroupInfoScreenProps) {
    const [group, setGroup] = useState<GroupDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLeaving, setIsLeaving] = useState(false);
    const [pinned, setPinned] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [showMembers, setShowMembers] = useState(false);

    const currentUserId = useAuthStore.getState().user?.id;

    useEffect(() => {
        if (!roomId) return;
        setLoading(true);
        groupService
            .getGroupDetails(roomId)
            .then((detail) => setGroup(detail))
            .catch((err) => console.error("Error fetching group:", err))
            .finally(() => setLoading(false));
    }, [roomId]);

    const handleLeaveGroup = () => {
        Alert.alert("Rời nhóm", "Bạn có chắc chắn muốn rời nhóm này?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Rời nhóm",
                style: "destructive",
                onPress: async () => {
                    setIsLeaving(true);
                    try {
                        await groupService.leaveGroup(roomId);
                        onClose();
                    } catch (err: any) {
                        Alert.alert("Lỗi", err?.response?.data?.message || "Rời nhóm thất bại.");
                    } finally {
                        setIsLeaving(false);
                    }
                },
            },
        ]);
    };

    // ─── Loading / Error states ───
    if (loading || !group) {
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: "#0c0c15",
                    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
                }}
            >
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    {loading ? (
                        <>
                            <ActivityIndicator size="large" color="#0068FF" />
                            <Text style={{ color: "#7f8c8d", marginTop: 8 }}>Đang tải...</Text>
                        </>
                    ) : (
                        <Text style={{ color: "#7f8c8d" }}>Không tải được thông tin nhóm</Text>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    const avatarUri = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        group.groupName
    )}&background=0068FF&color=fff&bold=true&size=120`;

    const existingMemberIds = group.members.map((m) => m.userId);

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "#0c0c15",
                paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
            }}
        >
            {/* ── Header ── */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderBottomWidth: 0.5,
                    borderBottomColor: "#2d2d44",
                }}
            >
                <TouchableOpacity onPress={onClose} activeOpacity={0.6} style={{ marginRight: 12 }}>
                    <Ionicons name="chevron-back" size={26} color="#e4e6eb" />
                </TouchableOpacity>
                <Text style={{ fontSize: 17, fontWeight: "600", color: "#e4e6eb" }}>
                    Tùy chọn
                </Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* ── Avatar + Group Name ── */}
                <View style={{ alignItems: "center", paddingVertical: 28 }}>
                    <View style={{ position: "relative", marginBottom: 12 }}>
                        <Image
                            source={{ uri: avatarUri }}
                            style={{ width: 80, height: 80, borderRadius: 40 }}
                        />
                        <View
                            style={{
                                position: "absolute",
                                bottom: 0,
                                right: 0,
                                width: 26,
                                height: 26,
                                borderRadius: 13,
                                backgroundColor: "#2d2d44",
                                alignItems: "center",
                                justifyContent: "center",
                                borderWidth: 2,
                                borderColor: "#0c0c15",
                            }}
                        >
                            <Ionicons name="camera" size={13} color="#b0b3b8" />
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={{ fontSize: 18, fontWeight: "700", color: "#e4e6eb" }}>
                            {group.groupName}
                        </Text>
                        <TouchableOpacity activeOpacity={0.6}>
                            <Ionicons name="pencil-outline" size={16} color="#8e8e93" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Quick Actions Row ── */}
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                        paddingHorizontal: 20,
                        paddingBottom: 20,
                        borderBottomWidth: 6,
                        borderBottomColor: "#141422",
                    }}
                >
                    {[
                        { icon: "search", label: "Tìm\ntin nhắn" },
                        { icon: "person-add-outline", label: "Thêm\nthành viên", onPress: () => setShowAddMember(true) },
                        { icon: "color-palette-outline", label: "Đổi\nhình nền" },
                        { icon: "notifications-outline", label: "Tắt\nthông báo" },
                    ].map((item, idx) => (
                        <TouchableOpacity
                            key={idx}
                            activeOpacity={0.7}
                            onPress={item.onPress}
                            style={{ alignItems: "center", width: 70 }}
                        >
                            <View
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    backgroundColor: "#1c1c2e",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: 6,
                                }}
                            >
                                <Ionicons name={item.icon as any} size={20} color="#b0b3b8" />
                            </View>
                            <Text
                                style={{
                                    fontSize: 11,
                                    color: "#9ca3af",
                                    textAlign: "center",
                                    lineHeight: 15,
                                }}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Sections ── */}
                <View style={{ marginTop: 4 }}>
                    <SectionRow
                        icon="information-circle-outline"
                        label="Thêm mô tả nhóm"
                    />
                </View>

                <View style={{ height: 6, backgroundColor: "#141422" }} />

                <SectionRow
                    icon="images-outline"
                    label="Ảnh, file, link"
                />

                <View style={{ height: 6, backgroundColor: "#141422" }} />

                <SectionRow icon="calendar-outline" label="Lịch nhóm" />
                <SectionRow icon="pin-outline" label="Tin nhắn đã ghim" />
                <SectionRow icon="bar-chart-outline" label="Bình chọn" />

                <View style={{ height: 6, backgroundColor: "#141422" }} />

                <SectionRow
                    icon="people-outline"
                    label={`Xem thành viên (${group.members.length})`}
                    onPress={() => setShowMembers(true)}
                />
                <SectionRow
                    icon="link-outline"
                    label="Link nhóm"
                    subtitle="Chưa có link nhóm"
                />

                <View style={{ height: 6, backgroundColor: "#141422" }} />

                <SectionRow
                    icon="pin-outline"
                    label="Ghim trò chuyện"
                    showChevron={false}
                    rightElement={
                        <Switch
                            value={pinned}
                            onValueChange={setPinned}
                            trackColor={{ false: "#2d2d44", true: "#0068FF" }}
                            thumbColor="#fff"
                        />
                    }
                />
                <SectionRow icon="eye-off-outline" label="Ẩn trò chuyện" />

                <View style={{ height: 6, backgroundColor: "#141422" }} />

                {/* ── Danger zone ── */}
                <SectionRow
                    icon="alert-circle-outline"
                    label="Báo xấu"
                    showChevron={false}
                />
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderBottomWidth: 0.5,
                        borderBottomColor: "#1c1c2e",
                    }}
                >
                    <Ionicons
                        name="trash-outline"
                        size={22}
                        color="#ef4444"
                        style={{ marginRight: 14, width: 24, textAlign: "center" as const }}
                    />
                    <Text style={{ fontSize: 15, color: "#ef4444" }}>Xóa lịch sử trò chuyện</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleLeaveGroup}
                    disabled={isLeaving}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        opacity: isLeaving ? 0.5 : 1,
                    }}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={22}
                        color="#ef4444"
                        style={{ marginRight: 14, width: 24, textAlign: "center" as const }}
                    />
                    <Text style={{ fontSize: 15, color: "#ef4444" }}>
                        {isLeaving ? "Đang rời..." : "Rời nhóm"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* ── Add Member Modal ── */}
            <AddMemberModal
                visible={showAddMember}
                onClose={() => setShowAddMember(false)}
                groupId={roomId}
                existingMemberIds={existingMemberIds}
                onMembersAdded={(updated) => setGroup(updated)}
            />

            {/* ── Members List Modal ── */}
            <Modal
                visible={showMembers}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowMembers(false)}
            >
                <SafeAreaView
                    style={{
                        flex: 1,
                        backgroundColor: "#0c0c15",
                        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
                    }}
                >
                    {/* Header */}
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                            borderBottomWidth: 0.5,
                            borderBottomColor: "#2d2d44",
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => setShowMembers(false)}
                            activeOpacity={0.6}
                            style={{ marginRight: 12 }}
                        >
                            <Ionicons name="chevron-back" size={26} color="#e4e6eb" />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 17, fontWeight: "600", color: "#e4e6eb", flex: 1 }}>
                            Thành viên ({group.members.length})
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                setShowMembers(false);
                                setTimeout(() => setShowAddMember(true), 200);
                            }}
                            activeOpacity={0.6}
                        >
                            <Ionicons name="person-add-outline" size={22} color="#0068FF" />
                        </TouchableOpacity>
                    </View>

                    {/* Members list */}
                    <FlatList
                        data={group.members}
                        keyExtractor={(item) => item.userId}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item: member }) => {
                            const memberAvatar =
                                member.avatarUrl ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    member.username
                                )}&background=0068FF&color=fff&bold=true`;
                            const isOwnerMember = member.userId === group.ownerId;
                            const isCurrentUser = member.userId === currentUserId;

                            return (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderBottomWidth: 0.5,
                                        borderBottomColor: "#1c1c2e",
                                    }}
                                >
                                    <Image
                                        source={{ uri: memberAvatar }}
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 24,
                                            marginRight: 12,
                                            backgroundColor: "#2d2d44",
                                        }}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                            <Text
                                                style={{ fontSize: 15, color: "#e4e6eb", fontWeight: "500" }}
                                                numberOfLines={1}
                                            >
                                                {member.username}
                                            </Text>
                                            {isCurrentUser && (
                                                <Text style={{ fontSize: 12, color: "#7f8c8d" }}>(Bạn)</Text>
                                            )}
                                        </View>
                                        <Text style={{ fontSize: 12, color: "#7f8c8d", marginTop: 2 }}>
                                            @{member.username}
                                        </Text>
                                    </View>
                                    {isOwnerMember && (
                                        <View
                                            style={{
                                                backgroundColor: "#162447",
                                                paddingHorizontal: 10,
                                                paddingVertical: 4,
                                                borderRadius: 12,
                                            }}
                                        >
                                            <Text style={{ fontSize: 11, color: "#60a5fa", fontWeight: "600" }}>
                                                Quản trị viên
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            );
                        }}
                    />
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}
