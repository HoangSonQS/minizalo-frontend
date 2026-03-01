import React from 'react';
import { List } from 'zmp-ui';
import { ChatRoom } from '@/shared/types';
import ChatRoomItem from './ChatRoomItem';

interface ChatRoomListProps {
    rooms: ChatRoom[];
    selectedRoomId?: string | null;
    onSelectRoom?: (roomId: string) => void;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({ rooms, selectedRoomId, onSelectRoom }) => {
    return (
        <List
            className="h-full overflow-y-auto"
            style={{
                backgroundColor: 'var(--bg-primary)',
                transition: 'background-color 0.3s ease',
            }}
        >
            {rooms.length === 0 ? (
                <div className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>
                    Chưa có cuộc trò chuyện nào
                </div>
            ) : (
                rooms.map((room) => (
                    <ChatRoomItem
                        key={room.id}
                        room={room}
                        isActive={selectedRoomId === room.id}
                        onSelect={onSelectRoom}
                    />
                ))
            )}
        </List>
    );
};

export default ChatRoomList;
