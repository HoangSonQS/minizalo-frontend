import React, { useEffect } from 'react';
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

    // Load danh sách phòng chat từ backend (dùng chatService giống mobile)
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
                    unreadCount: existing ? existing.unreadCount : (r.unreadCount || 0),
                    participants: (r.members || []).map((m: any) => ({
                        id: m.user?.id || m.id || '',
                        username: m.user?.username || m.username || '',
                        fullName: m.user?.displayName || m.user?.fullName || m.displayName || m.fullName || '',
                        avatarUrl: m.user?.avatarUrl || m.avatarUrl || undefined,
                    })),
                    updatedAt: r.lastMessage?.createdAt || r.createdAt || new Date().toISOString(),
                };});

                // Sort mới nhất lên đầu
                allRooms.sort(
                    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                );

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

    // Theo dõi tin nhắn từ tất cả các phòng để tăng badge hiển thị và cập nhật ChatWindow
    useEffect(() => {
        if (rooms.length === 0) return;
        
        const topics: string[] = [];
        rooms.forEach((room) => {
            const topic = `/topic/chat/${room.id}`;
            topics.push(topic);
            
            webSocketService.subscribe(topic, (stompMsg) => {
                try {
                    const dynamo = JSON.parse(stompMsg.body);
                    const incoming = {
                        id: dynamo.messageId,
                        senderId: dynamo.senderId,
                        senderName: dynamo.senderName || undefined,
                        roomId: room.id,
                        content: dynamo.recalled ? '[Tin nhắn đã thu hồi]' : dynamo.content,
                        type: (dynamo.type as any) || 'TEXT',
                        createdAt: dynamo.createdAt,
                        readBy: dynamo.readBy,
                    };
                    useChatStore.getState().addMessage(room.id, incoming);
                } catch (err) {
                    console.error('Lỗi parse tin nhắn global WS:', err);
                }
            });
        });
        
        return () => {
             // Dọn dẹp listener cũ khi component bị unmount hoặc rooms update, để tránh duplicate message.
             topics.forEach(topic => webSocketService.unsubscribe(topic));
        };
    }, [rooms]);

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
