import React, { useState, useRef } from 'react';
import { Box, Input, Button, Icon } from 'zmp-ui';

interface MessageInputProps {
    onSend: (text: string) => void;
    onSendFile?: (file: File) => void;
    onSendLike?: () => void;
    onTyping?: (isTyping: boolean) => void;
    replyingTo?: any;
    onCancelReply?: () => void;
    isSendingFile?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, onSendFile, onSendLike, onTyping, replyingTo, onCancelReply, isSendingFile }) => {
    const [text, setText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (selectedFile && onSendFile) {
            onSendFile(selectedFile);
            clearFilePreview();
            return;
        }
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
        if (e.key === 'Enter') handleSend();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
        e.target.value = '';
    };

    const clearFilePreview = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const hasContent = text.trim().length > 0 || !!selectedFile;

    return (
        <Box className="flex flex-col" style={{ backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-primary)', transition: 'background-color 0.3s ease' }}>
            {/* Reply preview */}
            {replyingTo && (
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <div className="flex flex-col text-sm border-l-4 border-blue-500 pl-2">
                        <span className="font-semibold text-blue-600">Trả lời {replyingTo.senderName || 'Người dùng'}</span>
                        <span className="text-gray-600 truncate max-w-xs">{replyingTo.content}</span>
                    </div>
                    {onCancelReply && (
                        <button onClick={onCancelReply} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            )}

            {/* File preview */}
            {selectedFile && (
                <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 border-b border-blue-100">
                    {previewUrl && selectedFile.type.startsWith('image/') && (
                        <img src={previewUrl} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                    )}
                    {previewUrl && selectedFile.type.startsWith('video/') && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-black flex items-center justify-center">
                            <video src={previewUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                        </div>
                    )}
                    {!previewUrl && (
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <button onClick={clearFilePreview} className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Hidden file inputs */}
            <input ref={imageInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />

            {/* Buttons row above input */}
            <div className="flex items-center gap-0.5 px-2 pt-1.5 pb-0.5">
                {/* Image/Video button */}
                <button
                    onClick={() => imageInputRef.current?.click()}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-blue-50 text-gray-500 hover:text-blue-500 transition-colors"
                    title="Gửi ảnh / video"
                    disabled={isSendingFile}
                >
                    <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </button>

                {/* File button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-blue-50 text-gray-500 hover:text-blue-500 transition-colors"
                    title="Đính kèm tệp"
                    disabled={isSendingFile}
                >
                    <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                </button>
            </div>

            {/* Input row: [Input............] [👍/▶] */}
            <Box className="flex flex-row items-center px-2 pb-2 pt-0.5 gap-1">
                <Box className="flex-1">
                    <Input
                        placeholder={selectedFile ? "Nhấn gửi để gửi tệp..." : "Nhập tin nhắn..."}
                        value={text}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        clearable
                        disabled={!!selectedFile}
                    />
                </Box>

                {hasContent ? (
                    <Button
                        onClick={handleSend}
                        size="small"
                        variant="primary"
                        disabled={isSendingFile}
                        loading={isSendingFile}
                        icon={<Icon icon="zi-send-solid" />}
                    />
                ) : (
                    <button
                        onClick={() => onSendLike?.()}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-yellow-50 text-yellow-500 hover:text-yellow-600 transition-colors shrink-0"
                        title="Gửi Like"
                    >
                        <span className="text-2xl leading-none">👍</span>
                    </button>
                )}
            </Box>
        </Box>
    );
};

export default MessageInput;
