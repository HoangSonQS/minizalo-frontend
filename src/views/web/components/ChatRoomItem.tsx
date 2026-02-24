import React from 'react';
import { List, Avatar, Text, Box } from 'zmp-ui';
import { ChatRoom } from '@/shared/types';
import { useRouter } from 'expo-router';

interface ChatRoomItemProps {
    room: ChatRoom;
    isActive?: boolean;
    onSelect?: (roomId: string) => void;
}

const ChatRoomItem: React.FC<ChatRoomItemProps> = ({ room, isActive, onSelect }) => {
    const router = useRouter();

    const onPress = () => {
        if (onSelect) {
            onSelect(room.id);
        } else {
            router.push(`/chat/${room.id}`);
        }
    };

    const getLastMessagePreview = () => {
        if (!room.lastMessage) return 'Chưa có tin nhắn';
        const { content, type } = room.lastMessage;
        switch (type) {
            case 'TEXT':
                return content;
            case 'IMAGE':
                return '[Hình ảnh]';
            case 'VIDEO':
                return '[Video]';
            case 'FILE':
                return '[Tập tin]';
            case 'STICKER':
                return '[Sticker]';
            default:
                return 'Tin nhắn mới';
        }
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return (
        <div onClick={onPress} className={`cursor-pointer transition-colors ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
            <List.Item
                prefix={<Avatar src={room.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.name)}&background=4A90D9&color=fff&size=64`} />}
                title={room.name}
                subTitle={getLastMessagePreview()}
                suffix={
                    <Box className="flex flex-col items-end">
                         <Text size="xSmall" className="text-gray-500">{formatTime(room.lastMessage?.createdAt || room.updatedAt)}</Text>
                         {room.unreadCount > 0 && (
                            <Box className="bg-red-500 rounded-full w-5 h-5 flex items-center justify-center mt-1">
                                <Text size="xSmall" className="text-white font-bold">{room.unreadCount}</Text>
                            </Box>
                         )}
                    </Box>
                }
            />
        </div>
    );
};

export default ChatRoomItem;
