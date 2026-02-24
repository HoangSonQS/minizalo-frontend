import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import WebChatLayout from '../components/WebChatLayout';
import ChatWindow from '../components/ChatWindow';

const ChatScreenWeb = () => {
    const { id } = useLocalSearchParams();
    const roomId = Array.isArray(id) ? id[0] : id; 

    return (
        <WebChatLayout selectedRoomId={roomId}>
             <ChatWindow roomId={roomId} />
        </WebChatLayout>
    );
};

export default ChatScreenWeb;
