import React from "react";
import { Platform, TouchableOpacity, Text } from "react-native";
import { Button } from "zmp-ui";

interface ZaloButtonProps {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary";
}

/**
 * ZaloButton - Cross-platform button component
 * 
 * This component demonstrates the Unified Codebase approach:
 * - Uses zmp-ui Button on Web
 * - Uses React Native TouchableOpacity on Mobile
 * - Provides a consistent interface for developers
 */
export default function ZaloButton({ title, onPress, variant = "primary" }: ZaloButtonProps) {
    if (Platform.OS === "web") {
        // Web: Use zmp-ui Button
        return (
            <Button
                onClick={onPress}
                style={{
                    background: variant === "primary" ? "#0068FF" : "#0054CC",
                    color: "white",
                    fontWeight: "600",
                    height: "48px",
                    borderRadius: "8px",
                }}
            >
                {title}
            </Button>
        );
    }

    // Mobile: Use React Native TouchableOpacity with NativeWind
    return (
        <TouchableOpacity
            className={`py-4 px-6 rounded-lg items-center ${variant === "primary" ? "bg-zalo-blue-primary" : "bg-zalo-blue-secondary"
                }`}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text className="text-white font-semibold text-base">{title}</Text>
        </TouchableOpacity>
    );
}
