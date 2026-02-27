import React, { useEffect, useCallback, useState } from 'react';
import { Box, Avatar } from 'zmp-ui';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import GroupInfoPanel from './GroupInfoPanel';
import DirectChatInfoPanel from './DirectChatInfoPanel';
import AddMembersModal from './AddMembersModal';
import { useChatStore } from '@/shared/store/useChatStore';
import { useGroupStore } from '@/shared/store/useGroupStore';
import { Message } from '@/shared/types';
import { webSocketService } from '@/shared/services/WebSocketService';
import { chatService, MessageDynamo } from '@/shared/services/chatService';
import { useAuthStore } from '@/shared/store/authStore';

interface ChatWindowProps {
    roomId: string;
}

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

    const { messages, addMessage, setCurrentRoom, setMessages, rooms } = useChatStore();
    const { isGroupInfoOpen, openGroupInfo, closeGroupInfo } = useGroupStore();
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const messagesState = messages[roomId] || [];

    const currentRoom = rooms.find((r) => r.id === roomId);
    const isGroupRoom = currentRoom?.type === 'GROUP';
    const roomName = currentRoom?.name || 'Phòng chat';
    const roomAvatar =
        currentRoom?.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(roomName)}&background=${isGroupRoom ? '0068FF' : 'random'}&color=fff&bold=true`;

    // Người bạn chat (với 1-1)
    const partner = !isGroupRoom
        ? currentRoom?.participants?.find((p) => p.id !== currentUserId)
        : undefined;

    const fetchHistory = useCallback(async () => {
        if (!roomId) return;
        try {
            const result = await chatService.getChatHistory(roomId);
            const sorted = (result.messages || [])
                .slice()
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            const historyMessages = sorted.map((m) => mapDynamoToMessage(m, roomId));
            const currentMsgs = useChatStore.getState().messages[roomId] || [];
            const liveMessages = currentMsgs.filter((m) => !m.id.startsWith('temp-'));
            const merged = [...historyMessages];
            for (const liveMsg of liveMessages) {
                if (!merged.some((m) => m.id === liveMsg.id)) merged.push(liveMsg);
            }
            merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            setMessages(roomId, merged);
        } catch (error) {
            console.error('Failed to fetch chat history', error);
        }
    }, [roomId]);

    useEffect(() => {
        if (!roomId) return;
        setCurrentRoom(roomId);
        webSocketService.activate();
        fetchHistory();
        // Đóng panel info khi chuyển phòng
        setIsInfoOpen(false);
        closeGroupInfo();
        return () => { setCurrentRoom(null); };
    }, [roomId, fetchHistory]);

    const handleSend = async (text: string) => {
        if (!roomId || !text.trim()) return;
        const optimistic: Message = {
            id: `temp-${Date.now()}`,
            senderId: currentUserId,
            roomId,
            content: text,
            type: 'TEXT',
            createdAt: new Date().toISOString(),
        };
        addMessage(roomId, optimistic);
        const sentViaWs = webSocketService.sendChatMessage(roomId, text);
        if (!sentViaWs) {
            try {
                await chatService.sendMessage(roomId, text);
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

    // Toggle info panel chung cho cả 2 loại phòng
    const handleToggleInfo = () => {
        if (isGroupRoom) {
            isGroupInfoOpen ? closeGroupInfo() : openGroupInfo();
        } else {
            setIsInfoOpen((v) => !v);
        }
    };

    const infoOpen = isGroupRoom ? isGroupInfoOpen : isInfoOpen;

    return (
        <div className="flex h-full bg-white overflow-hidden">
            {/* ── Chat area ── */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Header */}
                <div className="h-16 flex items-center px-4 border-b border-gray-200 bg-white shadow-sm shrink-0 justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={roomAvatar} />
                        <div className="min-w-0">
                            <span className="font-bold text-base block truncate">{roomName}</span>
                            {isGroupRoom && currentRoom && (
                                <span className="text-xs text-gray-400">
                                    {currentRoom.participants?.length || 0} thành viên
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Nút thông tin — hiện cho CẢ 2 loại phòng */}
                    <button
                        onClick={handleToggleInfo}
                        title="Thông tin hội thoại"
                        className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                            infoOpen ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
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

            {/* ── Info Panel bên phải ── */}
            {isGroupRoom && infoOpen && currentRoom && (
                <GroupInfoPanel
                    roomId={roomId}
                    onClose={closeGroupInfo}
                />
            )}
            {!isGroupRoom && infoOpen && currentRoom && (
                <DirectChatInfoPanel
                    room={currentRoom}
                    partner={partner}
                    onClose={() => setIsInfoOpen(false)}
                />
            )}

            {/* Add Members Modal (chỉ nhóm) */}
            {isGroupRoom && <AddMembersModal roomId={roomId} />}
        </div>
    );
};

export default ChatWindow;
