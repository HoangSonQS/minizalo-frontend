import React, { useEffect, useState } from 'react';
import { Box, Avatar } from 'zmp-ui';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useChatStore } from '@/shared/store/useChatStore';
import { Message } from '@/shared/types';
import { webSocketService } from '@/shared/services/WebSocketService';
import { MessageService } from '@/shared/services/MessageService';
import { useAuthStore } from '@/shared/store/authStore';

interface ChatWindowProps {
    roomId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ roomId }) => {
    const { user } = useAuthStore();
    const currentUserId = user?.id || '';
    
    const { messages, addMessage, setCurrentRoom, setMessages, rooms } = useChatStore();
    const [messagesState, setMessagesState] = useState<Message[]>([]);

    useEffect(() => {
        if (roomId) {
            setCurrentRoom(roomId);
            const fetchHistory = async () => {
                try {
                    const result = await MessageService.getChatHistory(roomId);
                    const sortedMessages = result.messages.sort((a, b) => 
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    );
                    setMessages(roomId, sortedMessages);
                } catch (error) {
                    console.error("Failed to fetch chat history", error);
                }
            };
            fetchHistory();
        }
        return () => setCurrentRoom(null);
    }, [roomId]);

    useEffect(() => {
         if (roomId) {
             setMessagesState(messages[roomId] || []);
         }
    }, [messages, roomId]);

    const handleSend = (text: string) => {
        if (!roomId || !currentUserId) return;
        
        // Optimistic UI update
        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: currentUserId,
            roomId: roomId,
            content: text,
            type: 'TEXT',
            createdAt: new Date().toISOString(),
        };
        addMessage(roomId, newMessage);

        // Send via WebSocket
        // receiverId should be the ID of the friend or the group ID
        // For private chats, roomId IS the friend's ID if mapped correctly in WebChatLayout
        
        console.log(`Sending message to ${roomId}: ${text}`);
         
        webSocketService.sendMessage({
            receiverId: roomId, 
            content: text,
            type: 'TEXT',
        });
    };

    const handleTyping = (isTyping: boolean) => {
        if (!roomId) return;
        webSocketService.sendTyping({
            roomId: roomId,
            isTyping: isTyping,
        });
    };

    // Find current room details
    const currentRoom = rooms.find(r => r.id === roomId);
    const roomName = currentRoom?.name || `Chat Room ${roomId}`;
    const roomAvatar = currentRoom?.avatarUrl || 'https://via.placeholder.com/150';

    return (
        <div className="flex flex-col h-full bg-white">
             <div className="h-16 flex items-center px-4 border-b border-gray-200 bg-white shadow-sm shrink-0 justify-between">
                <div className="flex items-center">
                    <Avatar src={roomAvatar} className="mr-3" />
                    <div>
                        <span className="font-bold text-lg block">{roomName}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Add icons here */}
                </div>
            </div>
            <Box className="flex-1 overflow-hidden flex flex-col bg-white">
                <MessageList messages={messagesState} currentUserId={currentUserId} />
                <MessageInput onSend={handleSend} onTyping={handleTyping} />
            </Box>
        </div>
    );
};

export default ChatWindow;
