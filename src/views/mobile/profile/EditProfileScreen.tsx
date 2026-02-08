import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { profileStyles, PROFILE_COLORS } from "./styles";
import type { UserProfile, UserProfileUpdateRequest } from "@/shared/services/types";

const editStyles = {
    header: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        justifyContent: "space-between" as const,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: PROFILE_COLORS.border,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600" as const,
        color: PROFILE_COLORS.text,
    },
    saveButton: {
        padding: 8,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "600" as const,
        color: PROFILE_COLORS.primary,
    },
    form: {
        padding: 16,
    },
    avatarSection: {
        alignItems: "center" as const,
        marginBottom: 24,
    },
    avatarLarge: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: PROFILE_COLORS.card,
    },
    changeAvatar: {
        marginTop: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    changeAvatarText: {
        fontSize: 14,
        color: PROFILE_COLORS.primary,
        fontWeight: "500" as const,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: PROFILE_COLORS.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: PROFILE_COLORS.searchBg,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: PROFILE_COLORS.text,
    },
};

interface EditProfileScreenProps {
    user?: UserProfile | null;
    onSave?: (data: UserProfileUpdateRequest) => Promise<void>;
}

export default function EditProfileScreen({ user, onSave }: EditProfileScreenProps) {
    const router = useRouter();
    const [displayName, setDisplayName] = useState(user?.displayName ?? user?.username ?? "");
    const [statusMessage, setStatusMessage] = useState(user?.statusMessage ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");
    const [saving, setSaving] = useState(false);

    // Đồng bộ form khi user được tải (sau fetchProfile)
    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName ?? user.username ?? "");
            setStatusMessage(user.statusMessage ?? "");
            setPhone(user.phone ?? "");
        }
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (onSave) {
                await onSave({
                    displayName: displayName.trim() || undefined,
                    statusMessage: statusMessage.trim() || undefined,
                    phone: phone.trim() || undefined,
                });
            }
            Alert.alert("Thành công", "Đã lưu thông tin.");
            router.replace("/(tabs)/account");
        } catch (e: unknown) {
            const msg = e && typeof e === "object" && "message" in e ? String((e as { message: unknown }).message) : "Không thể lưu.";
            Alert.alert("Lỗi", msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={profileStyles.container} edges={["top"]}>
            <StatusBar barStyle="light-content" backgroundColor={PROFILE_COLORS.background} />

            <View style={editStyles.header}>
                <TouchableOpacity
                    style={editStyles.backButton}
                    onPress={() => router.replace("/(tabs)/account")}
                >
                    <Text style={{ color: PROFILE_COLORS.text, fontSize: 20 }}>←</Text>
                </TouchableOpacity>
                <Text style={editStyles.headerTitle}>Chỉnh sửa thông tin</Text>
                <TouchableOpacity
                    style={editStyles.saveButton}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text style={editStyles.saveButtonText}>
                        {saving ? "..." : "Lưu"}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={editStyles.form} showsVerticalScrollIndicator={false}>
                <View style={editStyles.avatarSection}>
                    {user?.avatarUrl ? (
                        <Image
                            source={{ uri: user.avatarUrl }}
                            style={editStyles.avatarLarge}
                        />
                    ) : (
                        <View style={editStyles.avatarLarge} />
                    )}
                    <TouchableOpacity style={editStyles.changeAvatar}>
                        <Text style={editStyles.changeAvatarText}>Thay đổi ảnh đại diện</Text>
                    </TouchableOpacity>
                </View>

                <View style={editStyles.field}>
                    <Text style={editStyles.label}>Tên hiển thị</Text>
                    <TextInput
                        style={editStyles.input}
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholder="Nhập tên hiển thị"
                        placeholderTextColor={PROFILE_COLORS.textSecondary}
                    />
                </View>

                <View style={editStyles.field}>
                    <Text style={editStyles.label}>Trạng thái</Text>
                    <TextInput
                        style={editStyles.input}
                        value={statusMessage}
                        onChangeText={setStatusMessage}
                        placeholder="Tin nhắn trạng thái"
                        placeholderTextColor={PROFILE_COLORS.textSecondary}
                    />
                </View>

                <View style={editStyles.field}>
                    <Text style={editStyles.label}>Số điện thoại</Text>
                    <TextInput
                        style={editStyles.input}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Số điện thoại"
                        placeholderTextColor={PROFILE_COLORS.textSecondary}
                        keyboardType="phone-pad"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
