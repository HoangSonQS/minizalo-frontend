import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function LoginMobile() {
    const [phone, setPhone] = React.useState("");
    const [password, setPassword] = React.useState("");

    const handleLogin = () => {
        console.log("Login Mobile:", { phone, password });
        // TODO: Implement login logic
    };

    return (
        <View className="flex-1 bg-gradient-to-br from-zalo-blue-primary to-zalo-blue-secondary justify-center items-center px-5">
            <View className="bg-white rounded-2xl p-10 w-full max-w-md shadow-lg">
                <Text className="text-zalo-blue-primary text-4xl font-bold mb-2 text-center">
                    MiniZalo
                </Text>
                <Text className="text-gray-600 text-sm mb-8 text-center">
                    Đăng nhập để tiếp tục
                </Text>

                <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
                    placeholder="Số điện thoại"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholderTextColor="#999"
                />

                <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 mb-6 text-base"
                    placeholder="Mật khẩu"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor="#999"
                />

                <TouchableOpacity
                    className="bg-zalo-blue-primary rounded-lg py-4 items-center"
                    onPress={handleLogin}
                    activeOpacity={0.8}
                >
                    <Text className="text-white font-semibold text-base">Đăng nhập</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center mt-4">
                    <Text className="text-gray-600 text-sm">Chưa có tài khoản? </Text>
                    <TouchableOpacity>
                        <Text className="text-zalo-blue-primary font-semibold text-sm">
                            Đăng ký ngay
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
