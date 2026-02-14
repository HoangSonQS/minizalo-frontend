export interface User {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string; // Optional as it might not be in all responses
}

export interface ChatMessageRequest {
    receiverId: string;
    content: string;
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'STICKER' | 'REPLY' | 'FORWARD';
    replyToId?: string;
    fileUrl?: string;
}

export interface TypingIndicatorRequest {
    roomId: string;
    isTyping: boolean;
}

export interface ReadReceiptRequest {
    roomId: string;
    messageId: string;
}

export interface ReactionRequest {
    roomId: string;
    messageId: string;
    emoji: string;
}

export interface PinMessageRequest {
    roomId: string;
    messageId: string;
    pin: boolean;
}

// Backend 'MessageDynamo' model equivalent
export interface Message {
    id: string;
    senderId: string;
    roomId: string;
    content: string;
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'STICKER' | 'REPLY' | 'FORWARD';
    createdAt: string; // ISO string
    updatedAt?: string;
    isDeleted?: boolean;
    isRecall?: boolean;
    reactions?: Record<string, string>; // userId -> emoji
    readBy?: string[]; // userIds
    replyToId?: string;
    replyMessage?: Message; // recursive optional
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    forwardedFromId?: string; // original sender id if forwarded
    receiverId?: string; // Optional: ID of the receiver for private messages
}

export interface PaginatedMessageResult {
    messages: Message[];
    lastKey?: string; // For DynamoDB pagination
    hasMore: boolean;
}

export interface SearchMessageResponse {
    results: Message[];
    lastKey?: string;
    total: number;
}

export interface ChatRoom {
    id: string;
    name: string;
    avatarUrl?: string; // Group avatar or friend avatar
    type: 'GROUP' | 'PRIVATE';
    lastMessage?: Message;
    unreadCount: number;
    participants: User[];
    updatedAt: string;
}
