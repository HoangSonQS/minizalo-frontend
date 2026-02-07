import { StyleSheet, Platform, StatusBar } from "react-native";

// Màu chính của Zalo
export const COLORS = {
    primary: "#0068FF",
    primaryDisabled: "#88b4ff",
    white: "#fff",
    text: "#333",
    textSecondary: "#666",
    placeholder: "#888",
    border: "#e0e0e0",
};

// Styles chung cho các form auth
export const authStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        paddingBottom: 20,
    },
    headerContent: {
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    backButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButtonText: {
        fontSize: 24,
        color: COLORS.text,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        backgroundColor: COLORS.white,
    },
    titleContainer: {
        alignItems: "center",
        marginTop: 32,
        marginBottom: 40,
    },
    titleText: {
        fontSize: 28,
        fontWeight: "bold",
        color: COLORS.primary,
        textAlign: "center",
        lineHeight: 30,
    },
    inputContainer: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        marginBottom: 16,
    },
    input: {
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.text,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 25,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 16,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.primaryDisabled,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "600",
    },
    linkContainer: {
        alignItems: "center",
        marginTop: 20,
    },
    linkText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
});
