import React, { useEffect, useRef } from 'react';
import { Box } from 'zmp-ui';
import ChatRoomList from './ChatRoomList';
import CreateGroupModal from './CreateGroupModal';
import { useChatStore } from '@/shared/store/useChatStore';
import { useGroupStore } from '@/shared/store/useGroupStore';
import { ChatRoom } from '@/shared/types';
import { chatService, ChatRoomResponse } from '@/shared/services/chatService';
import { useAuthStore } from '@/shared/store/authStore';
import { webSocketService } from '@/shared/services/WebSocketService';
import { useThemeStore } from '@/shared/store/themeStore';

interface WebChatLayoutProps {
    children: React.ReactNode;
    selectedRoomId?: string | null;
    onSelectRoom?: (roomId: string) => void;
}

const WebChatLayout: React.FC<WebChatLayoutProps> = ({ children, selectedRoomId, onSelectRoom }) => {
    const { rooms, setRooms } = useChatStore();
    const { accessToken } = useAuthStore();
    const { openCreateGroup } = useGroupStore();
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark';

    // Track which room IDs we've already subscribed to, to avoid re-subscribing
    const subscribedRoomIds = useRef<Set<string>>(new Set());

    // Load danh sách phòng chat từ backend
    useEffect(() => {
        const fetchData = async () => {
            if (!accessToken) return;
            try {
                const data: ChatRoomResponse[] = await chatService.getChatRooms();
                const existingRooms = useChatStore.getState().rooms;
                const allRooms: ChatRoom[] = data.map((r) => {
                    const existing = existingRooms.find(er => er.id === r.id);
                    return {
                        id: r.id,
                        name: r.name || 'Người dùng',
                        avatarUrl: r.avatarUrl || undefined,
                        type: r.type === 'DIRECT' ? 'PRIVATE' : 'GROUP',
                        lastMessage: r.lastMessage
                            ? {
                                id: r.lastMessage.messageId,
                                senderId: r.lastMessage.senderId,
                                roomId: r.id,
                                content: r.lastMessage.content,
                                type: (r.lastMessage.type as any) || 'TEXT',
                                createdAt: r.lastMessage.createdAt,
                            }
                            : undefined,
                        unreadCount: Math.max(existing ? existing.unreadCount : 0, r.unreadCount || 0),
                        participants: (r.members || []).map((m: any) => ({
                            id: m.user?.id || m.id || '',
                            username: m.user?.username || m.username || '',
                            fullName: m.user?.displayName || m.user?.fullName || m.displayName || m.fullName || '',
                            avatarUrl: m.user?.avatarUrl || m.avatarUrl || undefined,
                        })),
                        updatedAt: r.lastMessage?.createdAt || r.createdAt || new Date().toISOString(),
                    };
                });
                allRooms.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                setRooms(allRooms);
            } catch (error) {
                console.error('Failed to fetch chat rooms', error);
            }
        };
        fetchData();
    }, [accessToken]);

    // Activate WebSocket khi có token
    useEffect(() => {
        if (!accessToken) return;
        webSocketService.activate(accessToken);
    }, [accessToken]);

    // Subscribe tới các phòng mới (chỉ subscribe 1 lần mỗi phòng)
    useEffect(() => {
        if (rooms.length === 0) return;

        rooms.forEach((room) => {
            if (subscribedRoomIds.current.has(room.id)) return;

            const topic = `/topic/chat/${room.id}`;
            const roomId = room.id;

            webSocketService.subscribe(topic, (stompMsg) => {
                try {
                    const dynamo = JSON.parse(stompMsg.body);
                    const incoming = {
                        id: dynamo.messageId,
                        senderId: dynamo.senderId,
                        senderName: dynamo.senderName || undefined,
                        roomId: roomId,
                        content: dynamo.recalled ? '[Tin nhắn đã thu hồi]' : dynamo.content,
                        type: (dynamo.type as any) || 'TEXT',
                        createdAt: dynamo.createdAt,
                        readBy: dynamo.readBy,
                    };
                    useChatStore.getState().addMessage(roomId, incoming);
                } catch (err) {
                    console.error('Lỗi parse tin nhắn global WS:', err);
                }
            });

            subscribedRoomIds.current.add(room.id);
        });

        return () => { };
    }, [rooms.length]);

    // Cleanup khi unmount hoàn toàn
    useEffect(() => {
        return () => {
            subscribedRoomIds.current.forEach(roomId => {
                webSocketService.unsubscribe(`/topic/chat/${roomId}`);
            });
            subscribedRoomIds.current.clear();
        };
    }, []);

    return (
        <div
            className="flex h-screen"
            style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                transition: 'background-color 0.3s ease, color 0.3s ease',
            }}
        >
            {/* Sidebar */}
            <div
                className="w-[350px] flex flex-col"
                style={{
                    borderRight: `1px solid var(--border-primary)`,
                    backgroundColor: 'var(--bg-primary)',
                    transition: 'background-color 0.3s ease, border-color 0.3s ease',
                }}
            >
                {/* Header sidebar */}
                <div
                    className="h-12 flex items-center justify-between px-4 shrink-0"
                    style={{
                        borderBottom: `1px solid var(--border-primary)`,
                        backgroundColor: 'var(--bg-primary)',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'background-color 0.3s ease',
                    }}
                >
                    <span
                        className="font-bold text-lg"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Tin nhắn
                    </span>

                    {/* Nút tạo nhóm */}
                    <button
                        onClick={openCreateGroup}
                        title="Tạo nhóm mới"
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                        style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark
                                ? 'rgba(255,255,255,0.08)'
                                : 'rgba(0,0,0,0.06)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>

                <Box className="flex-1 overflow-hidden">
                    <ChatRoomList
                        rooms={rooms}
                        selectedRoomId={selectedRoomId}
                        onSelectRoom={onSelectRoom}
                    />
                </Box>
            </div>

            {/* Main Content */}
            <div
                className="flex-1 flex flex-col min-w-0"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    transition: 'background-color 0.3s ease',
                }}
            >
                {children}
            </div>

            {/* Create Group Modal — global, luôn render */}
            <CreateGroupModal />
        </div>
    );
};

export default WebChatLayout;
