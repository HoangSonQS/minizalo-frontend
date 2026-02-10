import React from "react";
import { View, Text, TouchableOpacity, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "../styles";

export default function LoginScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <View style={styles.content}>
                {/* Logo */}
                <Text style={styles.logo}>MiniZalo</Text>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.loginButton}
                        activeOpacity={0.8}
                        onPress={() => router.push("/(auth)/login-form")}
                    >
                        <Text style={styles.loginButtonText}>ĐĂNG NHẬP</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.registerButton}
                        activeOpacity={0.8}
                        onPress={() => router.push("/(auth)/register-form")}
                    >
                        <Text style={styles.registerButtonText}>ĐĂNG KÝ</Text>
                    </TouchableOpacity>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity style={styles.forgotContainer}>
                    <Text style={styles.forgotText}>Quên mật khẩu</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    logo: {
        fontSize: 48,
        fontWeight: "bold",
        color: COLORS.primary,
        marginBottom: 80,
    },
    buttonContainer: {
        width: "100%",
        maxWidth: 280,
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 25,
        paddingVertical: 14,
        alignItems: "center",
        marginBottom: 16,
    },
    loginButtonText: {
        color: COLORS.white,
        fontWeight: "bold",
        fontSize: 14,
    },
    registerButton: {
        backgroundColor: "#e5e5e5",
        borderRadius: 25,
        paddingVertical: 14,
        alignItems: "center",
    },
    registerButtonText: {
        color: COLORS.text,
        fontWeight: "bold",
        fontSize: 14,
    },
    forgotContainer: {
        marginTop: 24,
    },
    forgotText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
});
