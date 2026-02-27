import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

interface ChatItemProps {
    avatar: any; // URL or local require
    name: string;
    message: string;
    time: string;
    unreadCount?: number;
    isVerified?: boolean; // For the checkmark
    isGroup?: boolean;
    onPress?: () => void;
}

export const ChatItem = ({ avatar, name, message, time, unreadCount, isVerified, onPress }: ChatItemProps) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#0c0c15',
                paddingHorizontal: 16,
                paddingVertical: 10,
            }}
        >
            {/* Avatar Container */}
            <View style={{ position: 'relative', marginRight: 12 }}>
                <Image
                    source={avatar}
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        backgroundColor: '#2d2d44',
                    }}
                    resizeMode="cover"
                />
                {isVerified && (
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: '#0c0c15',
                        borderRadius: 999,
                        padding: 1.5,
                    }}>
                        <View style={{
                            width: 12,
                            height: 12,
                            backgroundColor: '#0c0c15',
                            borderRadius: 999,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: '#555',
                        }}>
                            <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#f1c40f' }}>v</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Content Container */}
            <View style={{
                flex: 1,
                borderBottomWidth: 0.5,
                borderBottomColor: '#2d2d44',
                paddingBottom: 10,
                justifyContent: 'center',
                height: 60,
            }}>
                {/* Top Row: Name + Time */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                        <Text style={{ fontSize: 16, color: '#e4e6eb', fontWeight: '400' }} numberOfLines={1}>{name}</Text>
                        {isVerified && (
                            <View style={{
                                marginLeft: 4,
                                backgroundColor: '#f1c40f',
                                borderRadius: 999,
                                width: 12,
                                height: 12,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <Text style={{ fontSize: 8, color: 'white' }}>✓</Text>
                            </View>
                        )}
                    </View>
                    <Text style={{ fontSize: 12, color: '#7f8c8d' }}>{time}</Text>
                </View>

                {/* Bottom Row: Message + Badge */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text
                        style={{
                            fontSize: 14,
                            flex: 1,
                            marginRight: 16,
                            color: unreadCount && unreadCount > 0 ? '#c8c9cc' : '#7f8c8d',
                            fontWeight: unreadCount && unreadCount > 0 ? 'bold' : 'normal',
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {message}
                    </Text>

                    {unreadCount && unreadCount > 0 ? (
                        <View style={{
                            backgroundColor: '#e74c3c',
                            borderRadius: 999,
                            minWidth: 18,
                            height: 18,
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingHorizontal: 4,
                        }}>
                            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                                {unreadCount > 5 ? '5+' : unreadCount}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );
};
