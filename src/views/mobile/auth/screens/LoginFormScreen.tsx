import React, { useState } from "react";
import { View, StatusBar, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import authService from "../../../../services/authService";
import { authStyles } from "../styles";
import { AuthHeader, AuthTitle, AuthInput, AuthButton, AuthLink } from "../components";

export default function LoginFormScreen() {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!phone.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
            return;
        }
        if (!password) {
            Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
            return;
        }

        setLoading(true);
        try {
            const response = await authService.signin({
                username: phone.trim(),
                password,
            });
            console.log("Login success! Tokens:", response);
            Alert.alert("Thành công", "Đăng nhập thành công!", [
                { text: "OK", onPress: () => router.replace("/(tabs)") }
            ]);
        } catch (error: any) {
            console.error("Login error:", error);
            const message = error.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
            Alert.alert("Lỗi", message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={authStyles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <AuthHeader onBack={() => router.back()} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={authStyles.content}
            >
                <AuthTitle title="Đăng nhập" />

                <AuthInput
                    placeholder="Số điện thoại"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    disabled={loading}
                />

                <AuthInput
                    placeholder="Mật khẩu"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    disabled={loading}
                />

                <AuthButton
                    title="Đăng nhập"
                    onPress={handleLogin}
                    loading={loading}
                />

                <AuthLink text="Quên mật khẩu" />
            </KeyboardAvoidingView>
        </View>
    );
}
