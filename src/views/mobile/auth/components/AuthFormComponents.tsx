import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, TextInputProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { authStyles, COLORS } from "../styles";

// Header với nút back
interface AuthHeaderProps {
    onBack: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ onBack }) => (
    <View style={authStyles.header}>
        <SafeAreaView style={authStyles.headerContent}>
            <TouchableOpacity onPress={onBack} style={authStyles.backButton}>
                <Text style={authStyles.backButtonText}>←</Text>
            </TouchableOpacity>
        </SafeAreaView>
    </View>
);

// Title
interface AuthTitleProps {
    title: string;
}

export const AuthTitle: React.FC<AuthTitleProps> = ({ title }) => (
    <View style={authStyles.titleContainer}>
        <Text style={authStyles.titleText}>{title}</Text>
    </View>
);

// Input field
interface AuthInputProps extends TextInputProps {
    disabled?: boolean;
    error?: string; // Error message or boolean to trigger red border
    isPassword?: boolean; // Flag to enable password toggle
}

export const AuthInput: React.FC<AuthInputProps> = ({ disabled, error, isPassword, ...props }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // Determine if we should secure text entry
    // Only secure if it IS a password field AND not visible
    const secureTextEntry = isPassword && !isPasswordVisible;

    return (
        <View style={{ marginBottom: 16 }}>
            <View style={[
                authStyles.inputContainer,
                { marginBottom: 0 }, // We handle margin in the wrapper View
                error ? { borderBottomColor: 'red' } : {}
            ]}>
                <TextInput
                    style={authStyles.input}
                    placeholderTextColor={COLORS.placeholder}
                    editable={!disabled}
                    secureTextEntry={secureTextEntry}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={{ padding: 8 }}
                    >
                        <Ionicons
                            name={isPasswordVisible ? "eye-off" : "eye"}
                            size={24}
                            color="gray"
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={{ color: 'red', fontSize: 12, marginTop: 4, marginLeft: 0 }}>{error}</Text>}
        </View>
    );
};

// Submit button
interface AuthButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    style?: object;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ title, onPress, loading, disabled, style }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[authStyles.submitButton, (loading || disabled) && authStyles.submitButtonDisabled, style]}
        disabled={loading || disabled}
    >
        {loading ? (
            <ActivityIndicator color={COLORS.white} />
        ) : (
            <Text style={authStyles.submitButtonText}>{title}</Text>
        )}
    </TouchableOpacity>
);

// Link text
interface AuthLinkProps {
    text: string;
    onPress?: () => void;
}

export const AuthLink: React.FC<AuthLinkProps> = ({ text, onPress }) => (
    <View style={authStyles.linkContainer}>
        <TouchableOpacity onPress={onPress}>
            <Text style={authStyles.linkText}>{text}</Text>
        </TouchableOpacity>
    </View>
);
