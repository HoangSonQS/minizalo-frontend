import React from 'react';
import { Box, Avatar, Text } from 'zmp-ui';
import { Message } from '@/shared/types';
import clsx from 'clsx';

interface MessageBubbleProps {
    message: Message;
    isMine: boolean;
    showAvatar?: boolean;
    senderName?: string;
    senderAvatar?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isMine,
    showAvatar = true,
    senderName,
    senderAvatar
}) => {
    return (
        <Box className={clsx('flex flex-row mb-2', isMine ? 'justify-end' : 'justify-start')}>
            {!isMine && showAvatar && (
                <Box className="mr-2 self-end">
                    <Avatar src={senderAvatar || 'https://via.placeholder.com/32'} size={32} />
                </Box>
            )}
            
            <Box className={clsx('max-w-[70%] flex flex-col', isMine ? 'items-end' : 'items-start')}>
                {!isMine && showAvatar && senderName && (
                     <Text size="xxSmall" className="text-gray-500 mb-1 ml-1">{senderName}</Text>
                )}
                
                <Box
                    className={clsx(
                        'p-3 rounded-xl break-words',
                        isMine ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-gray-200 text-black rounded-tl-none'
                    )}
                >
                   {message.type === 'TEXT' ? (
                        <Text className="text-sm">{message.content}</Text>
                   ) : (
                       <Text className="text-sm italic text-gray-400">[Unsupported message type]</Text>
                   )}
                </Box>
                
                <Text size="xxSmall" className="text-gray-400 mt-1 mx-1">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </Box>
        </Box>
    );
};

export default MessageBubble;
