import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Message, User } from '@/shared/types';

interface MessageListProps {
    messages: Message[];
    currentUserId: string;
    participants?: User[];
    onRecall?: (messageId: string) => void;
    onReact?: (messageId: string, emoji: string) => void;
    onReply?: (message: Message) => void;
    onTogglePin?: (messageId: string, currentPinStatus: boolean) => void;
    onRemoveAllReactions?: (messageId: string) => void;
    onDeleteForMe?: (messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, participants = [], onRecall, onReact, onReply, onTogglePin, onRemoveAllReactions, onDeleteForMe }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isNearBottom = useRef(true);
    const prevMessageCount = useRef(0);

    const scrollToBottom = (smooth = false) => {
        if (!scrollRef.current) return;
        if (smooth) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        } else {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        isNearBottom.current = scrollHeight - scrollTop - clientHeight < 120;
    };

    // Scroll xuống ngay khi load lần đầu
    useEffect(() => {
        requestAnimationFrame(() => scrollToBottom(false));
    }, []);

    // Khi có tin nhắn mới: smooth scroll nếu đang ở gần đáy
    useEffect(() => {
        if (messages.length === 0) return;
        const isNewMessage = messages.length > prevMessageCount.current;
        prevMessageCount.current = messages.length;

        if (isNewMessage && isNearBottom.current) {
            requestAnimationFrame(() => scrollToBottom(true));
        }
    }, [messages]);

    // Build map id -> User để tra cứu nhanh
    const participantMap = participants.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
    }, {} as Record<string, User>);

    return (
        <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto bg-gray-50"
            onScroll={handleScroll}
            style={{ scrollBehavior: 'auto' }}
        >
            {/* min-h-full + justify-end: tin nhắn neo dưới đáy khi ít */}
            <div className="flex flex-col justify-end min-h-full px-4 pt-4 pb-2">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
                        Hãy gửi tin nhắn đầu tiên! 👋
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMine = msg.senderId === currentUserId;
                        const prevMsg = messages[index - 1];
                        const nextMsg = messages[index + 1];

                        // Nhóm liên tiếp cùng người gửi
                        const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId;
                        const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;

                        // Avatar hiển thị ở tin nhắn CUỐI của nhóm (như Zalo)
                        const showAvatar = !isMine && isLastInGroup;

                        // Tên hiển thị ở tin nhắn ĐẦU của nhóm
                        // Ưu tiên: senderName trong message (từ backend) > participant lookup > UUID fallback
                        const sender = participantMap[msg.senderId];
                        const senderName = !isMine && isFirstInGroup
                            ? (msg.senderName || sender?.fullName || sender?.username || msg.senderId?.slice(0, 8))
                            : undefined;
                        const senderAvatar = sender?.avatarUrl || undefined;

                        const marginBottom = isLastInGroup ? 'mb-3' : 'mb-0.5';

                        const repliedMessage = msg.replyToId ? messages.find(m => m.id === msg.replyToId) : undefined;
                        const isLatestMessage = index === messages.length - 1;

                        return (
                            <div key={msg.id || `msg-${index}`} id={`msg-${msg.id}`}>
                                <MessageBubble
                                    message={msg}
                                    isMine={isMine}
                                    showAvatar={showAvatar}
                                    isFirstInGroup={isFirstInGroup}
                                    isLastInGroup={isLastInGroup}
                                    senderName={senderName}
                                    senderAvatar={senderAvatar}
                                    marginBottom={marginBottom}
                                    onRecall={onRecall}
                                    onReact={onReact}
                                    onReply={onReply}
                                    onTogglePin={onTogglePin}
                                    onRemoveAllReactions={onRemoveAllReactions}
                                    onDeleteForMe={onDeleteForMe}
                                    participants={participants}
                                    repliedMessage={repliedMessage}
                                    isLatestMessage={isLatestMessage}
                                    onScrollToMessage={(messageId) => {
                                        const el = document.getElementById(`msg-${messageId}`);
                                        if (el) {
                                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            el.classList.add('bg-yellow-100');
                                            setTimeout(() => el.classList.remove('bg-yellow-100'), 1500);
                                        }
                                    }}
                                />
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default MessageList;
