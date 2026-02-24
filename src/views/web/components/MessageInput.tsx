import React, { useState } from 'react';
import { Box, Input, Button, Icon } from 'zmp-ui';

interface MessageInputProps {
    onSend: (text: string) => void;
    onTyping?: (isTyping: boolean) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, onTyping }) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim()) {
            onSend(text);
            setText('');
            if (onTyping) onTyping(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newText = e.target.value;
        setText(newText);
        if (onTyping) onTyping(newText.length > 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <Box className="flex flex-row items-center p-2 border-t border-gray-200 bg-white">
            <Box className="flex-1 mr-2">
                <Input
                    placeholder="Nhập tin nhắn..."
                    value={text}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    clearable
                />
            </Box>
            <Button
                onClick={handleSend}
                size="small"
                variant="primary"
                disabled={!text.trim()}
                icon={<Icon icon="zi-send-solid" />}
            />
        </Box>
    );
};

export default MessageInput;
