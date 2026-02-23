import React, { useEffect } from 'react';
import { Box } from 'zmp-ui';
import ChatRoomList from './ChatRoomList';
import { useChatStore } from '@/shared/store/useChatStore';
import { ChatRoom, Message } from '@/shared/types';
import { chatService, ChatRoomResponse, MessageDynamo } from '@/shared/services/chatService';
import { useAuthStore } from '@/shared/store/authStore';
import { webSocketService } from '@/shared/services/WebSocketService';

interface WebChatLayoutProps {
    children: React.ReactNode;
    selectedRoomId?: string | null;
    onSelectRoom?: (roomId: string) => void;
}

/** Map MessageDynamo sang Message (dùng cho lastMessage của room) */
function mapLastMessage(msg: MessageDynamo, roomId: string): Message {
    return {
        id: msg.messageId,
        senderId: msg.senderId,
        senderName: msg.senderName || undefined,
        roomId,
        content: msg.recalled ? '[Tin nhắn đã thu hồi]' : msg.content,
        type: (msg.type as any) || 'TEXT',
        createdAt: msg.createdAt,
    };
}

const WebChatLayout: React.FC<WebChatLayoutProps> = ({ children, selectedRoomId, onSelectRoom }) => {
    const { rooms, setRooms, upsertRoom } = useChatStore();
    const { accessToken } = useAuthStore();

    useEffect(() => {
        const fetchData = async () => {
            if (!accessToken) return;

            try {
                const data: ChatRoomResponse[] = await chatService.getChatRooms();

                const allRooms: ChatRoom[] = data.map((r) => ({
                    id: r.id,
                    name: r.name || 'Người dùng',
                    avatarUrl: r.avatarUrl || undefined,
                    type: r.type === 'DIRECT' ? 'PRIVATE' : 'GROUP',
                    lastMessage: r.lastMessage ? mapLastMessage(r.lastMessage, r.id) : undefined,
                    unreadCount: r.unreadCount || 0,
                    participants: r.members
                        ? r.members.map((m: any) => ({
                              id: m.userId || m.id || '',
                              username: m.username || '',
                              fullName: m.displayName || m.fullName || m.username || '',
                              avatarUrl: m.avatarUrl || undefined,
                          }))
                        : [],
                    updatedAt: r.lastMessage?.createdAt || r.createdAt || new Date().toISOString(),
                }));

                allRooms.sort(
                    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                );

                setRooms(allRooms);

                // Fetch last message cho phòng chưa có (backend không trả về lastMessage)
                const roomsNeedLastMsg = allRooms.filter((r) => !r.lastMessage);
                if (roomsNeedLastMsg.length > 0) {
                    await Promise.all(
                        roomsNeedLastMsg.map(async (room) => {
                            try {
                                const history = await chatService.getChatHistory(room.id, 20);
                                const msgs = (history.messages || [])
                                    .slice()
                                    .sort(
                                        (a, b) =>
                                            new Date(a.createdAt).getTime() -
                                            new Date(b.createdAt).getTime()
                                    );
                                if (msgs.length > 0) {
                                    const lastMsg = msgs[msgs.length - 1];
                                    upsertRoom({
                                        ...room,
                                        lastMessage: mapLastMessage(lastMsg, room.id),
                                        updatedAt: lastMsg.createdAt,
                                    });
                                }
                            } catch {
                                // bỏ qua lỗi từng phòng
                            }
                        })
                    );
                }
            } catch (error) {
                console.error('Failed to fetch chat rooms', error);
            }
        };

        fetchData();
    }, [accessToken]);

    useEffect(() => {
        if (!accessToken) return;
        webSocketService.activate(accessToken);
    }, [accessToken]);

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
