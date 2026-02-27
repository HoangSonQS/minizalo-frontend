import React, { useEffect, useRef } from 'react';
import { Box } from 'zmp-ui';
import ChatRoomList from './ChatRoomList';
import { useChatStore } from '@/shared/store/useChatStore';
import { ChatRoom } from '@/shared/types';
import { chatService, ChatRoomResponse } from '@/shared/services/chatService';
import { useAuthStore } from '@/shared/store/authStore';
import { webSocketService } from '@/shared/services/WebSocketService';

interface WebChatLayoutProps {
    children: React.ReactNode;
    selectedRoomId?: string | null;
    onSelectRoom?: (roomId: string) => void;
}

const WebChatLayout: React.FC<WebChatLayoutProps> = ({ children, selectedRoomId, onSelectRoom }) => {
    const { rooms, setRooms } = useChatStore();
    const { accessToken } = useAuthStore();
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

    // Subscribe tới các phòng mới (chỉ subscribe 1 lần mỗi phòng, không unsubscribe khi rooms thay đổi)
    useEffect(() => {
        if (rooms.length === 0) return;

        rooms.forEach((room) => {
            if (subscribedRoomIds.current.has(room.id)) return; // Đã subscribe rồi, bỏ qua

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
                    console.log('[Global WS] Message received room:', roomId, incoming);
                    useChatStore.getState().addMessage(roomId, incoming);
                } catch (err) {
                    console.error('Lỗi parse tin nhắn global WS:', err);
                }
            });

            subscribedRoomIds.current.add(room.id);
            console.log('[Global WS] Subscribed to room:', room.id);
        });

        // Cleanup chỉ khi component unmount hoàn toàn
        return () => {};
    }, [rooms.length]); // Chỉ chạy lại khi số lượng phòng thay đổi (thêm phòng mới)

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
        <div className="flex h-screen bg-white">
            {/* Sidebar */}
            <div className="w-[350px] flex flex-col border-r border-gray-200">
                <div className="h-12 flex items-center px-4 border-b border-gray-200 bg-white shadow-sm shrink-0">
                    <span className="font-bold text-lg">Tin nhắn</span>
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
            <div className="flex-1 flex flex-col bg-gray-50">
                {children}
            </div>
        </div>
    );
};

export default WebChatLayout;
