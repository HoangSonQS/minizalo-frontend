import React from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, TextInputProps } from "react-native";
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
}

export const AuthInput: React.FC<AuthInputProps> = ({ disabled, ...props }) => (
    <View style={authStyles.inputContainer}>
        <TextInput
            style={authStyles.input}
            placeholderTextColor={COLORS.placeholder}
            editable={!disabled}
            {...props}
        />
    </View>
);

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
