import React from "react";
import { View, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ChatListHeader } from "../components/ChatListHeader";
import { PinnedCloudItem } from "../components/PinnedCloudItem";
import { ChatItem } from "../components/ChatItem";

const DATA = [
    {
        id: "1",
        name: "Media Box",
        message: "Zing MP3: [APP] Hãy để KAKA khai...",
        time: "",
        avatar: { uri: "https://ui-avatars.com/api/?name=Media+Box&background=random&color=fff" },
        unreadCount: 5,
        isVerified: false,
    },
    {
        id: "2",
        name: "Thời Tiết",
        message: "☁️ Chất lượng không khí Sài Gòn ở...",
        time: "5 giờ",
        avatar: { uri: "https://ui-avatars.com/api/?name=Thoi+Tiet&background=0D8ABC&color=fff" },
        unreadCount: 1,
        isVerified: true,
    },
    {
        id: "3",
        name: "Cộng đồng Game Online",
        message: "⭐️Thư Giãn Sảng Khoái Cùng Crazy...",
        time: "T4",
        avatar: { uri: "https://ui-avatars.com/api/?name=Game+Online&background=4CAF50&color=fff" },
        unreadCount: 2,
        isVerified: true,
    },
    {
        id: "4",
        name: "ZaloPay",
        message: "Bạn có voucher Hóa đơn| Giảm 50K...",
        time: "T2",
        avatar: { uri: "https://ui-avatars.com/api/?name=Zalo+Pay&background=0068FF&color=fff" },
        unreadCount: 1,
        isVerified: true,
    },
    {
        id: "5",
        name: "Zalo Sticker",
        message: "ỦA ĐANG CHƠI DZUI TỰ NHIÊN KHỊA?...",
        time: "T2",
        avatar: { uri: "https://ui-avatars.com/api/?name=Zalo+Sticker&background=FFC107&color=fff" },
        unreadCount: 3,
        isVerified: true,
    },
].filter(item => item.id !== "6");

export default function ChatListScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-white">
            <ChatListHeader />
            <FlatList
                data={DATA}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={() => (
                    <View>
                        <PinnedCloudItem />
                    </View>
                )}
                renderItem={({ item }) => (
                    <ChatItem
                        avatar={item.avatar}
                        name={item.name}
                        message={item.message}
                        time={item.time}
                        unreadCount={item.unreadCount}
                        isVerified={item.isVerified}
                        onPress={() => router.push({
                            pathname: "/chat/[id]",
                            params: { id: item.id, name: item.name }
                        })}
                    />
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
