import { StyleSheet, Platform, StatusBar } from "react-native";

export const PROFILE_COLORS = {
    background: "#0d0d0d",
    card: "#1a1a1a",
    border: "#2a2a2a",
    text: "#ffffff",
    textSecondary: "#8e8e93",
    primary: "#0068FF",
    searchBg: "#2c2c2e",
};

export const profileStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: PROFILE_COLORS.background,
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 52,
        paddingHorizontal: 16,
        paddingTop: Platform.OS === "android" ? 8 : 16,
        paddingBottom: 8,
        gap: 12,
        backgroundColor: PROFILE_COLORS.searchBg,
        borderRadius: 10,
    },
    searchBox: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "transparent",
        borderRadius: 10,
        paddingHorizontal: 0,
        paddingVertical: 0,
        gap: 8,
    },
    searchIcon: {
        width: 20,
        height: 20,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: PROFILE_COLORS.text,
        paddingVertical: 0,
    },
    settingsButton: {
        padding: 8,
    },
    profileSection: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 16,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: PROFILE_COLORS.card,
    },
    avatarBadge: {
        position: "absolute",
        right: 0,
        bottom: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: PROFILE_COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    nameRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    displayName: {
        fontSize: 20,
        fontWeight: "600",
        color: PROFILE_COLORS.text,
    },
    list: {
        backgroundColor: PROFILE_COLORS.background,
    },
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: PROFILE_COLORS.border,
        gap: 12,
    },
    listItemIcon: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: PROFILE_COLORS.primary,
        opacity: 0.9,
        alignItems: "center",
        justifyContent: "center",
    },
    listItemContent: {
        flex: 1,
    },
    listItemTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: PROFILE_COLORS.text,
    },
    listItemSubtitle: {
        fontSize: 13,
        color: PROFILE_COLORS.textSecondary,
        marginTop: 2,
    },
    listItemArrow: {
        fontSize: 16,
        color: PROFILE_COLORS.textSecondary,
    },
});
