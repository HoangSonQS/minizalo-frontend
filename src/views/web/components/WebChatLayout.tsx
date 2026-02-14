import React, { useEffect } from 'react';
import { Box } from 'zmp-ui';
import ChatRoomList from './ChatRoomList';
import { useChatStore } from '@/shared/store/useChatStore';
import { ChatRoom, Message } from '@/shared/types';
import friendService from '@/shared/services/friendService';
import { groupService } from '@/shared/services/groupService';
import { useAuthStore } from '@/shared/store/authStore';
import { webSocketService } from '@/shared/services/WebSocketService';

interface WebChatLayoutProps {
    children: React.ReactNode;
    selectedRoomId?: string | null;
    onSelectRoom?: (roomId: string) => void;
}

const WebChatLayout: React.FC<WebChatLayoutProps> = ({ children, selectedRoomId, onSelectRoom }) => {
    const { rooms, setRooms, upsertRoom, addMessage } = useChatStore();
    const { accessToken, user } = useAuthStore();
    const currentUserId = user?.id || '';
    const [groupIds, setGroupIds] = React.useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!accessToken) return;
            if (rooms.length > 0) return; // Prevent refetching if already active

            try {
                const [friends, groups] = await Promise.all([
                    friendService.getFriends(),
                    groupService.getUsersGroups()
                ]);

                setGroupIds(groups.map(g => g.id));

                console.log('Current User ID:', currentUserId);
                console.log('Raw Friends Data:', friends);

                const friendRooms: ChatRoom[] = friends.map(f => {
                    // Identify the 'other' user in the relationship
                    let otherUser = f.friend;
                    if (f.user.id === currentUserId) {
                        otherUser = f.friend;
                    } else if (f.friend.id === currentUserId) {
                        otherUser = f.user;
                    } else {
                        // Fallback or error case: neither matches current user
                        // This might happen if the data is stale or malformed
                        console.warn('Friend record does not contain current user:', f);
                        otherUser = f.friend; // Default to friend
                    }
                    
                    return {
                        id: otherUser.id,
                        name: otherUser.displayName || otherUser.username,
                        avatarUrl: otherUser.avatarUrl || undefined,
                        type: 'PRIVATE',
                        unreadCount: 0,
                        participants: [{
                            id: otherUser.id,
                            username: otherUser.username,
                            fullName: otherUser.displayName || otherUser.username,
                            avatarUrl: otherUser.avatarUrl || undefined
                        }],
                        updatedAt: new Date().toISOString(),
                    };
                });

                const groupRooms: ChatRoom[] = groups.map(g => ({
                    id: g.id,
                    name: g.name,
                    avatarUrl: g.avatarUrl || undefined,
                    type: 'GROUP',
                    unreadCount: 0,
                    participants: [], // TODO: We might need to fetch participants if not available
                    updatedAt: new Date().toISOString(),
                }));

                const allRooms = [...friendRooms, ...groupRooms].sort((a, b) => 
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                );

                setRooms(allRooms);
            } catch (error) {
                console.error("Failed to fetch chat rooms", error);
            }
        };

        fetchData();
    }, [accessToken]);

    useEffect(() => {
        if (!accessToken) return;

        webSocketService.activate(accessToken);

        const handlePrivateMessage = (message: any) => {
            const msgBody: Message = JSON.parse(message.body);
            handleIncomingMessage(msgBody, false);
        };

        const handleGroupMessage = (message: any) => {
            const msgBody: Message = JSON.parse(message.body);
            handleIncomingMessage(msgBody, true);
        };

        if (currentUserId) {
             webSocketService.subscribe(`/topic/private.chat.${currentUserId}`, handlePrivateMessage);
        }

        // Subscribe to groups
        groupIds.forEach(groupId => {
            webSocketService.subscribe(`/topic/group.chat.${groupId}`, handleGroupMessage);
        });

        return () => {
            if (currentUserId) {
                webSocketService.unsubscribe(`/topic/private.chat.${currentUserId}`);
            }
             groupIds.forEach(groupId => {
                webSocketService.unsubscribe(`/topic/group.chat.${groupId}`);
            });
        };
    }, [accessToken, currentUserId, groupIds]); // Re-subscribe if groups change

    const handleIncomingMessage = (message: Message, isGroup: boolean) => {
        // Access latest rooms state directly to avoid stale closures
        const currentRooms = useChatStore.getState().rooms;

        let targetRoomId = message.roomId;
        let roomType: 'PRIVATE' | 'GROUP' = 'PRIVATE';

        if (isGroup) {
            targetRoomId = message.roomId;
            roomType = 'GROUP';
        } else {
             // For private, use senderId if received from someone else
             if (message.senderId !== currentUserId) {
                 targetRoomId = message.senderId;
             } else {
                 // Self-sent message (echo), use receiverId
                 targetRoomId = message.receiverId; // This assumes receiverId is the friend ID
             }
        }
        
        const existingRoom = currentRooms.find(r => r.id === targetRoomId);
        
        // Calculate unread count. If current room is open, don't increment?
        // Actually, selectedRoomId might be null or different.
        // We need access to selectedRoomId prop here. 
        // But handleIncomingMessage is defined in component scope, so it should access props.
        // Wait, props in callback will be stale if useEffect doesn't update.
        // useEffect depends on groupIds, so handleIncomingMessage is recreated.
        // BUT selectedRoomId changes often. We don't want to re-subscribe often.
        // The callback closes over 'selectedRoomId'.
        // So we need a ref for selectedRoomId?
        // Or we pass selectedRoomId to the callback... but callback is registered once.
        
        // Solution: Use a ref for selectedRoomId
        
        const isCurrentRoom = targetRoomId === selectedRoomIdRef.current;
        const newUnreadCount = isCurrentRoom ? 0 : (existingRoom ? existingRoom.unreadCount + 1 : 1);
        
        const roomUpdate: ChatRoom = {
            id: targetRoomId,
            name: existingRoom?.name || "New Chat", // Keep existing name or set placeholder
            type: roomType,
            lastMessage: message,
            unreadCount: newUnreadCount,
            participants: existingRoom?.participants || [],
            updatedAt: message.createdAt,
            avatarUrl: existingRoom?.avatarUrl
        };
        
        upsertRoom(roomUpdate);
        addMessage(targetRoomId, message);
    };

    // Ref to track selectedRoomId for use inside callbacks
    const selectedRoomIdRef = React.useRef(selectedRoomId);
    useEffect(() => {
        selectedRoomIdRef.current = selectedRoomId;
    }, [selectedRoomId]);

    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar */}
            <div className="w-[350px] flex flex-col border-r border-gray-200">
                <div className="h-12 flex items-center px-4 border-b border-gray-200 bg-white shadow-sm shrink-0">
                    {/* Reimplement header logic or passing 'Tin nhắn' text/search bar */}
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
