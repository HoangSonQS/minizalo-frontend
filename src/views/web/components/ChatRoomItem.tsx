import React from 'react';
import { List, Avatar, Text, Box } from 'zmp-ui';
import { ChatRoom } from '@/shared/types';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/shared/store/themeStore';

interface ChatRoomItemProps {
    room: ChatRoom;
    isActive?: boolean;
    onSelect?: (roomId: string) => void;
}

const ChatRoomItem: React.FC<ChatRoomItemProps> = ({ room, isActive, onSelect }) => {
    const router = useRouter();
    const isDark = useThemeStore((s) => s.theme === 'dark');

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
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Hôm qua';
        } else {
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        }
    };

    const activeBg = isDark ? 'rgba(137,180,250,0.12)' : '#eff6ff';
    const hoverBg = isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb';

    return (
        <div
            onClick={onPress}
            className="flex items-center p-3 cursor-pointer"
            style={{
                backgroundColor: isActive ? activeBg : 'transparent',
                transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = hoverBg;
            }}
            onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
            }}
        >
            <Avatar src={room.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.name)}&background=4A90D9&color=fff&size=64`} className="mr-3" />

            <div className="flex-1 min-w-0 pr-2">
                <div
                    className="truncate text-base"
                    style={{
                        fontWeight: room.unreadCount > 0 ? 700 : 400,
                        color: 'var(--text-primary)',
                    }}
                >
                    {room.name}
                </div>
                <div
                    className="truncate text-sm mt-0.5"
                    style={{
                        fontWeight: room.unreadCount > 0 ? 700 : 400,
                        color: room.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                >
                    {getLastMessagePreview()}
                </div>
            </div>

            <div className="flex flex-col items-end whitespace-nowrap pl-2">
                <span
                    style={{
                        fontSize: 11,
                        fontWeight: room.unreadCount > 0 ? 700 : 400,
                        color: room.unreadCount > 0 ? 'var(--accent)' : 'var(--text-muted)',
                    }}
                >
                    {formatTime(room.lastMessage?.createdAt || room.updatedAt)}
                </span>
                {room.unreadCount > 0 && (
                    <div
                        style={{ backgroundColor: '#ef4444', minWidth: 20, height: 20, borderRadius: 10, padding: '0 4px' }}
                        className="flex items-center justify-center mt-1 text-white text-[11px] font-bold leading-none"
                    >
                        {room.unreadCount > 99 ? '99+' : room.unreadCount}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatRoomItem;
