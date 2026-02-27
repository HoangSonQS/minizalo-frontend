import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    StatusBar,
    Modal,
    TouchableWithoutFeedback,
    Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export const ChatListHeader = () => {
    const router = useRouter();
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
        <SafeAreaView style={{ backgroundColor: "#0c0c15" }}>
            <View
                style={{
                    paddingTop:
                        Platform.OS === "android" ? StatusBar.currentHeight : 0,
                    backgroundColor: "#0c0c15",
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        gap: 10,
                    }}
                >
                    {/* Search bar */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#1c1c2e",
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                        }}
                    >
                        <Ionicons name="search" size={18} color="#8e8e93" />
                        <Text
                            style={{
                                color: "#8e8e93",
                                marginLeft: 8,
                                fontSize: 15,
                            }}
                        >
                            Tìm kiếm
                        </Text>
                    </TouchableOpacity>

                    {/* QR Code button */}
                    <TouchableOpacity
                        activeOpacity={0.6}
                        style={{ padding: 4 }}
                    >
                        <Ionicons
                            name="qr-code-outline"
                            size={22}
                            color="#b0b3b8"
                        />
                    </TouchableOpacity>

                    {/* "+" button */}
                    <TouchableOpacity
                        activeOpacity={0.6}
                        style={{ padding: 4 }}
                        onPress={openMenu}
                    >
                        <Ionicons name="add" size={28} color="#b0b3b8" />
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
                                    color="#b0b3b8"
                                    style={{ marginRight: 12 }}
                                />
                                <Text
                                    style={{
                                        fontSize: 15,
                                        color: "#e4e6eb",
                                    }}
                                >
                                    Tạo nhóm
                                </Text>
                            </TouchableOpacity>

                            {/* Divider */}
                            <View
                                style={{
                                    height: 0.5,
                                    backgroundColor: "#2d2d44",
                                    marginHorizontal: 12,
                                }}
                            />

                            {/* Thêm bạn */}
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={closeMenu}
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
                                    color="#b0b3b8"
                                    style={{ marginRight: 12 }}
                                />
                                <Text
                                    style={{
                                        fontSize: 15,
                                        color: "#e4e6eb",
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
