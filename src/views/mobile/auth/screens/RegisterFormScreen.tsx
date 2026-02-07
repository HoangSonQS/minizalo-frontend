import React, { useState } from "react";
import { View, StatusBar, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import authService from "../../../../services/authService";
import { authStyles } from "../styles";
import { AuthHeader, AuthTitle, AuthInput, AuthButton } from "../components";

export default function RegisterFormScreen() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        // Validation
        if (!name.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập tên");
            return;
        }
        if (!phone.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
            return;
        }
        if (!/^[0-9]{10,11}$/.test(phone)) {
            Alert.alert("Lỗi", "Số điện thoại phải có 10-11 chữ số");
            return;
        }
        if (!email.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập email");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            Alert.alert("Lỗi", "Email không hợp lệ");
            return;
        }
        if (!password) {
            Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu nhập lại không khớp");
            return;
        }

        setLoading(true);
        try {
            await authService.signup({
                name: name.trim(),
                phone: phone.trim(),
                email: email.trim(),
                password,
            });
            Alert.alert("Thành công", "Đăng ký thành công! Vui lòng đăng nhập.", [
                { text: "OK", onPress: () => router.replace("/(auth)/login-form") },
            ]);
        } catch (error: any) {
            console.error("Register error:", error);
            const message = error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
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
                <ScrollView showsVerticalScrollIndicator={false}>
                    <AuthTitle title="Đăng ký" />

                    <AuthInput
                        placeholder="Tên"
                        value={name}
                        onChangeText={setName}
                        disabled={loading}
                    />

                    <AuthInput
                        placeholder="Số điện thoại"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        disabled={loading}
                    />

                    <AuthInput
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        disabled={loading}
                    />

                    <AuthInput
                        placeholder="Mật khẩu"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        disabled={loading}
                    />

                    <AuthInput
                        placeholder="Nhập lại mật khẩu"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        disabled={loading}
                    />

                    <AuthButton
                        title="Đăng ký"
                        onPress={handleRegister}
                        loading={loading}
                        style={{ marginBottom: 40 }}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
