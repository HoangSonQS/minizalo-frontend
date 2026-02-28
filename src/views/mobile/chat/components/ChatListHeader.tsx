import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    StatusBar,
    Modal,
    TouchableWithoutFeedback,
    Animated,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { PROFILE_COLORS } from "../../profile/styles";

export const ChatListHeader = () => {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [menuVisible, setMenuVisible] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const openMenu = () => {
        setMenuVisible(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
        }).start();
    };

    const closeMenu = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start(() => setMenuVisible(false));
    };

    const handleCreateGroup = () => {
        closeMenu();
        setTimeout(() => {
            router.push("/create-group" as any);
        }, 120);
    };

    return (
        <SafeAreaView
            style={{ backgroundColor: PROFILE_COLORS.background }}
            edges={["top"]}
        >
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
                    {/* Search bar */}
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
                            showSoftInputOnFocus={false}
                            onFocus={(e) => {
                                // Bỏ focus ngay lập tức để khi back lại không bị dính focus
                                e.target.blur();
                                // Mở màn tìm kiếm chung và focus input bên đó
                                router.push("/(tabs)/contacts-search");
                                // Xóa text cũ để lần sau vào lại luôn sạch
                                setSearchText("");
                            }}
                        />
                        {searchText ? (
                            <TouchableOpacity
                                onPress={() => setSearchText("")}
                                style={{ paddingLeft: 6 }}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={18}
                                    color={PROFILE_COLORS.textSecondary}
                                />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {/* QR Code button */}
                    <TouchableOpacity
                        activeOpacity={0.6}
                        style={{ padding: 4 }}
                    >
                        <Ionicons
                            name="qr-code-outline"
                            size={22}
                            color={PROFILE_COLORS.text}
                        />
                    </TouchableOpacity>

                    {/* "+" button */}
                    <TouchableOpacity
                        activeOpacity={0.6}
                        style={{ padding: 4 }}
                        onPress={openMenu}
                    >
                        <Ionicons name="add" size={28} color={PROFILE_COLORS.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Dropdown Menu ── */}
            <Modal
                transparent
                visible={menuVisible}
                animationType="none"
                onRequestClose={closeMenu}
            >
                <TouchableWithoutFeedback onPress={closeMenu}>
                    <View style={{ flex: 1 }}>
                        <Animated.View
                            style={{
                                position: "absolute",
                                top: Platform.OS === "android"
                                    ? (StatusBar.currentHeight || 0) + 48
                                    : 90,
                                right: 12,
                                backgroundColor: "#1c1c2e",
                                borderRadius: 12,
                                paddingVertical: 4,
                                minWidth: 200,
                                opacity: fadeAnim,
                                transform: [
                                    {
                                        translateY: fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-8, 0],
                                        }),
                                    },
                                ],
                                // Shadow
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 8,
                            }}
                        >
                            {/* Tạo nhóm */}
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={handleCreateGroup}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                }}
                            >
                                <Ionicons
                                    name="people-outline"
                                    size={20}
                                    color={PROFILE_COLORS.textSecondary}
                                    style={{ marginRight: 12 }}
                                />
                                <Text
                                    style={{
                                        fontSize: 15,
                                        color: PROFILE_COLORS.text,
                                    }}
                                >
                                    Tạo nhóm
                                </Text>
                            </TouchableOpacity>

                            {/* Divider */}
                            <View
                                style={{
                                    height: 0.5,
                                    backgroundColor: "#27272a",
                                    marginHorizontal: 12,
                                }}
                            />

                            {/* Thêm bạn */}
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                    closeMenu();
                                    router.push("/(tabs)/contacts-add");
                                }}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                }}
                            >
                                <Ionicons
                                    name="person-add-outline"
                                    size={20}
                                    color={PROFILE_COLORS.textSecondary}
                                    style={{ marginRight: 12 }}
                                />
                                <Text
                                    style={{
                                        fontSize: 15,
                                        color: PROFILE_COLORS.text,
                                    }}
                                >
                                    Thêm bạn
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};
