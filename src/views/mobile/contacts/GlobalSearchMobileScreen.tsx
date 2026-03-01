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
    const params = rawParams as { q?: string; from?: string; t?: number };
    const initialQuery = typeof params.q === "string" ? params.q : "";
    const from = params.from || "contacts";

    const handleBack = () => {
        if (from === "account") {
            router.replace("/(tabs)/account");
        } else if (from === "chat") {
            router.replace("/(tabs)/");
        } else {
            router.replace("/(tabs)/contacts");
        }
    };

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
                    onPress={handleBack}
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

            {/* Nội dung: key theo from+t để mỗi lần mở từ giao diện chính ô tìm kiếm luôn rỗng. */}
            <SearchUsersMobile
                key={`search-${from}-${params.t ?? ""}`}
                initialQuery={initialQuery}
                autoFocus
            />
        </SafeAreaView>
    );
}

