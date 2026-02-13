import React, { useState } from 'react';
import WebChatLayout from '../components/WebChatLayout';
import ChatWindow from '../components/ChatWindow';

const HomeWeb = () => {
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

    return (
        <WebChatLayout 
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
        >
            {selectedRoomId ? (
                <ChatWindow roomId={selectedRoomId} />
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 min-h-full">
                    <div className="text-center">
                        <h3 className="text-xl font-medium mb-2">Chào mừng đến với MiniZalo</h3>
                        <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin.</p>
                    </div>
                </div>
            )}
        </WebChatLayout>
    );
};

export default HomeWeb;
