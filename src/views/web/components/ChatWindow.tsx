import React, { useEffect, useCallback } from 'react';
import { Box, Avatar } from 'zmp-ui';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useChatStore } from '@/shared/store/useChatStore';
import { Message } from '@/shared/types';
import { webSocketService } from '@/shared/services/WebSocketService';
import { chatService, MessageDynamo } from '@/shared/services/chatService';
import { useAuthStore } from '@/shared/store/authStore';

interface ChatWindowProps {
    roomId: string;
}

/** Map MessageDynamo (từ backend/WS) sang Message (dùng trong store/UI) */
function mapDynamoToMessage(msg: MessageDynamo, roomId: string): Message {
    return {
        id: msg.messageId,
        senderId: msg.senderId,
        senderName: msg.senderName || undefined,
        roomId: roomId,
        content: msg.recalled ? '[Tin nhắn đã thu hồi]' : msg.content,
        type: (msg.type as any) || 'TEXT',
        createdAt: msg.createdAt,
        readBy: msg.readBy,
    };
}

const ChatWindow: React.FC<ChatWindowProps> = ({ roomId }) => {
    const { user } = useAuthStore();
    const currentUserId = user?.id || '';

    const { messages, addMessage, setCurrentRoom, setMessages, upsertRoom, rooms } = useChatStore();
    const messagesState = messages[roomId] || [];

    // ─── Load lịch sử chat ───
    const fetchHistory = useCallback(async () => {
        if (!roomId) return;
        try {
            const result = await chatService.getChatHistory(roomId);
            const sorted = (result.messages || [])
                .slice()
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            const historyMessages = sorted.map((m) => mapDynamoToMessage(m, roomId));

            // Merge với messages đã nhận qua WS để tránh overwrite live messages
            const currentMsgs = useChatStore.getState().messages[roomId] || [];
            const liveMessages = currentMsgs.filter((m) => !m.id.startsWith('temp-'));
            const merged = [...historyMessages];
            for (const liveMsg of liveMessages) {
                if (!merged.some((m) => m.id === liveMsg.id)) {
                    merged.push(liveMsg);
                }
            }
            merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            setMessages(roomId, merged);
        } catch (error) {
            console.error('Failed to fetch chat history', error);
        }
    }, [roomId]);

    // ─── Subscribe WebSocket topic phòng (giống mobile) ───
    useEffect(() => {
        if (!roomId) return;

        setCurrentRoom(roomId);

        // Đảm bảo WS được kích hoạt (giống mobile ChatScreen)
        webSocketService.activate();

        // Fetch lịch sử tin nhắn khi vào phòng
        fetchHistory();

        return () => {
            setCurrentRoom(null);
        };
    }, [roomId, fetchHistory]);

    // ─── Gửi tin nhắn ───
    const handleSend = async (text: string) => {
        if (!roomId || !text.trim()) return;

        console.log('─── SEND DEBUG ───');
        console.log('roomId:', roomId);
        console.log('currentUserId:', currentUserId);
        console.log('WS connected:', webSocketService.isConnected());

        // Optimistic UI
        const optimistic: Message = {
            id: `temp-${Date.now()}`,
            senderId: currentUserId,
            roomId: roomId,
            content: text,
            type: 'TEXT',
            createdAt: new Date().toISOString(),
        };
        addMessage(roomId, optimistic);

        // Gửi qua WebSocket (sendChatMessage đúng method)
        const sentViaWs = webSocketService.sendChatMessage(roomId, text);
        console.log('sentViaWs:', sentViaWs);

        if (!sentViaWs) {
            // Fallback REST nếu WS ngắt
            console.log('WS not connected, falling back to REST');
            try {
                const result = await chatService.sendMessage(roomId, text);
                console.log('REST send success:', result);
                await fetchHistory();
            } catch (err: any) {
                console.error('REST send failed:', err?.response?.status, err?.response?.data || err.message);
            }
        }
    };


    const handleTyping = (isTyping: boolean) => {
        if (!roomId) return;
        webSocketService.sendTyping({ roomId, isTyping });
    };

    // Lấy thông tin phòng từ store
    const currentRoom = rooms.find((r) => r.id === roomId);
    const roomName = currentRoom?.name || `Phòng chat`;
    const roomAvatar = currentRoom?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(roomName)}&background=random&color=fff`;

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="h-16 flex items-center px-4 border-b border-gray-200 bg-white shadow-sm shrink-0 justify-between">
                <div className="flex items-center">
                    <Avatar src={roomAvatar} className="mr-3" />
                    <div>
                        <span className="font-bold text-lg block">{roomName}</span>
                    </div>
                </div>
            </div>

            {/* Messages + Input */}
            <Box className="flex-1 overflow-hidden flex flex-col bg-white">
                <MessageList
                    messages={messagesState}
                    currentUserId={currentUserId}
                    participants={currentRoom?.participants || []}
                />
                <MessageInput onSend={handleSend} onTyping={handleTyping} />
            </Box>
        </div>
    );
};

export default ChatWindow;
