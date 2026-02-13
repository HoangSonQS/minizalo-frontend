import React, { useEffect, useRef } from 'react';
import { Box } from 'zmp-ui';
import MessageBubble from './MessageBubble';
import { Message } from '@/shared/types';

interface MessageListProps {
    messages: Message[];
    currentUserId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((msg, index) => {
                const isMine = msg.senderId === currentUserId;
                const prevMsg = messages[index - 1];
                const showAvatar = !isMine && (!prevMsg || prevMsg.senderId !== msg.senderId);
                
                return (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        isMine={isMine}
                        showAvatar={showAvatar}
                        senderName={!isMine ? `User ${msg.senderId}` : undefined} // Replace with actual name lookup
                    />
                );
            })}
        </div>
    );
};

export default MessageList;
