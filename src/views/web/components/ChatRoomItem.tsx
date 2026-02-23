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
        if (!room.lastMessage) return '';
        const { content, type } = room.lastMessage;
        let text = '';
        switch (type) {
            case 'TEXT':   text = content; break;
            case 'IMAGE':  text = '[Hình ảnh]'; break;
            case 'VIDEO':  text = '[Video]'; break;
            case 'FILE':   text = '[Tập tin]'; break;
            case 'STICKER': text = '[Sticker]'; break;
            default:       text = content || 'Tin nhắn mới';
        }
        return text;
    };

    const formatTime = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        if (isToday) {
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
        }
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    return (
        <div onClick={onPress} className={`cursor-pointer transition-colors ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
            <List.Item
                prefix={<Avatar src={room.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.name)}&background=4A90D9&color=fff&size=64`} />}
                title={room.name}
                subTitle={getLastMessagePreview()}
                suffix={
                    <Box className="flex flex-col items-end">
                         <Text size="xSmall" className="text-gray-500">{formatTime(room.updatedAt)}</Text>
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
