import { useState, useEffect, useRef, useCallback } from 'react';
import { webSocketService } from '../services/WebSocketService';
import { useChatStore } from '../store/useChatStore';

export const useTypingIndicator = (roomId: string) => {
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { typingUsers } = useChatStore();

    // Determine who is typing in the current room (excluding self if needed, but store has all)
    // Assumes typingUsers[roomId] contains user IDs
    const activeTypingUsers = typingUsers[roomId] || [];

    const sendTyping = useCallback((typing: boolean) => {
        webSocketService.sendTyping({
            roomId,
            isTyping: typing,
        });
    }, [roomId]);

    const handleTypingInput = useCallback(() => {
        if (!isTyping) {
            setIsTyping(true);
            sendTyping(true);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing after 2 seconds
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            sendTyping(false);
        }, 2000);
    }, [isTyping, roomId, sendTyping]);

    // Cleanup on unmount or room change
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (isTyping) {
                // Ensure we signal we stopped typing if we leave
                sendTyping(false);
            }
        };
    }, [roomId, isTyping, sendTyping]);

    return {
        handleTypingInput,
        activeTypingUsers,
    };
};
