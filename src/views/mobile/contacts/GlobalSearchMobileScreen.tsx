import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
// Import bình thường, nhưng dùng kiểu any để tránh lỗi typings khác biệt giữa phiên bản expo-router
// đồng thời cho phép truyền prop autoFocus tuỳ chọn.
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const SearchUsersMobile = require("./SearchUsersMobile")
    .default as (props: { initialQuery?: string; autoFocus?: boolean }) => React.ReactElement;
import { PROFILE_COLORS } from "../profile/styles";

/**
 * Màn tìm kiếm người dùng chung cho mobile (dùng lại UI Thêm bạn hiện tại).
 * - Cho phép tìm theo tên / số điện thoại / email.
 * - Được mở từ thanh tìm kiếm ở Danh bạ, Cá nhân...
 */
export default function GlobalSearchMobileScreen() {
    const router = useRouter();
    // Dùng require để tránh lỗi type khi dự án chưa khai báo hook useLocalSearchParams trong typings
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const { useLocalSearchParams } = require("expo-router") as {
        useLocalSearchParams?: () => Record<string, unknown>;
    };
    const rawParams = useLocalSearchParams ? useLocalSearchParams() : {};
    const initialQuery =
        typeof (rawParams as { q?: unknown }).q === "string"
            ? ((rawParams as { q?: string }).q as string)
            : "";

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: PROFILE_COLORS.background }}
            edges={["top"]}
        >
            {/* Header: nút quay lại + tiêu đề */}
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
                    Tìm kiếm
                </Text>
            </View>

            {/* Nội dung: dùng lại SearchUsersMobile với initialQuery.
                Khi mở từ thanh tìm kiếm chính, initialQuery thường rỗng và ô search sẽ tự focus. */}
            <SearchUsersMobile initialQuery={initialQuery} autoFocus />
        </SafeAreaView>
    );
}

