import React from 'react';
import { Message } from '@/shared/types';
import clsx from 'clsx';

interface MessageBubbleProps {
    message: Message;
    isMine: boolean;
    showAvatar?: boolean;
    isFirstInGroup?: boolean;
    isLastInGroup?: boolean;
    senderName?: string;
    senderAvatar?: string;
    marginBottom?: string;
}

const getAvatarUrl = (name: string, avatarUrl?: string) => {
    if (avatarUrl) return avatarUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4A90D9&color=fff&size=64`;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isMine,
    showAvatar = false,
    isFirstInGroup = true,
    isLastInGroup = true,
    senderName,
    senderAvatar,
    marginBottom = 'mb-1',
}) => {
    // Bo góc kiểu Zalo: góc liên kết với avatar phẳng, còn lại bo tròn
    const bubbleRadius = isMine
        ? clsx(
            'rounded-2xl',
            isFirstInGroup && 'rounded-tr-md',
            isLastInGroup && 'rounded-br-md',
          )
        : clsx(
            'rounded-2xl',
            isFirstInGroup && 'rounded-tl-md',
            isLastInGroup && 'rounded-bl-md',
          );

    const displayName = senderName || 'Unknown';

    return (
        <div className={clsx('flex flex-row items-end', isMine ? 'justify-end' : 'justify-start', marginBottom)}>
            {/* Avatar bên trái (người khác) */}
            {!isMine && (
                <div className="mr-1.5 self-end flex-shrink-0" style={{ width: 32 }}>
                    {showAvatar ? (
                        <img
                            src={getAvatarUrl(displayName, senderAvatar)}
                            alt={displayName}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8" /> /* placeholder để giữ alignment */
                    )}
                </div>
            )}

            {/* Bubble content */}
            <div className={clsx('max-w-[65%] flex flex-col', isMine ? 'items-end' : 'items-start')}>
                {/* Tên người gửi (hiện ở đầu nhóm) */}
                {!isMine && senderName && (
                    <span className="text-xs text-gray-500 mb-0.5 ml-1 font-medium">{senderName}</span>
                )}

                {/* Nội dung tin nhắn */}
                <div
                    className={clsx(
                        'px-3 py-2 break-words',
                        bubbleRadius,
                        isMine
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                    )}
                >
                    {message.type === 'TEXT' ? (
                        <span className="text-sm leading-relaxed">{message.content}</span>
                    ) : (
                        <span className="text-sm italic text-gray-400">[Loại tin nhắn không hỗ trợ]</span>
                    )}
                </div>

                {/* Thời gian (hiện ở cuối nhóm) */}
                {isLastInGroup && (
                    <span className={clsx('text-xs text-gray-400 mt-0.5', isMine ? 'mr-1' : 'ml-1')}>
                        {new Date(message.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
