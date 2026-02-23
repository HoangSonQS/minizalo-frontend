import { Client, IMessage } from '@stomp/stompjs';
<<<<<<< Updated upstream
import { ChatMessageRequest, TypingIndicatorRequest, ReadReceiptRequest } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';
const WS_URL = API_URL.replace(/^http/, 'ws').replace(/\/api$/, '/ws');

console.log('WebSocketService initialized with URL:', WS_URL);
=======
import { Platform } from 'react-native';
import { useAuthStore } from '@/shared/store/authStore';

// Build URLs from API base
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';
const HTTP_BASE = API_URL.replace(/\/api$/, '');

// Web: use /ws/websocket (the raw WebSocket transport auto-exposed by SockJS on the /ws endpoint)
//   → already permitted by Security (/ws/**), no backend change needed
// Native: use /ws-raw (dedicated raw WS endpoint added to backend)
const WS_URL = Platform.OS === 'web'
    ? HTTP_BASE.replace(/^http/, 'ws') + '/ws/websocket'
    : HTTP_BASE.replace(/^http/, 'ws') + '/ws-raw';

>>>>>>> Stashed changes

class WebSocketService {
    private client: Client;
    private connected: boolean = false;
    private pendingSubscriptions: Record<string, (message: IMessage) => void> = {};
    private subscriptions: Record<string, any> = {};

    constructor() {
        const isNative = Platform.OS !== 'web';

        // Both browser and React Native connect to the same /ws-raw endpoint
        // (a plain WebSocket endpoint in Spring without SockJS)
        this.client = new Client({
            brokerURL: WS_URL,
<<<<<<< Updated upstream
            debug: (str) => {
                console.log('STOMP: ' + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
=======
            debug: (str) => { if (__DEV__) console.log('STOMP:', str); },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            // forceBinaryWSFrames & appendMissingNULLonIncoming are React Native-only
            // browsers use standard binary WebSocket frames natively
            ...(isNative ? {
                forceBinaryWSFrames: true,
                appendMissingNULLonIncoming: true,
            } : {}),
>>>>>>> Stashed changes
        });

        this.client.onConnect = (frame) => {
            console.log('Connected to WebSocket');
            this.connected = true;
            // Process pending subscriptions
            Object.keys(this.pendingSubscriptions).forEach(dest => {
                 // Use basic subscribe here to avoid circular logic or re-checking connected
                 const callback = this.pendingSubscriptions[dest];
                 const sub = this.client.subscribe(dest, callback);
                 this.subscriptions[dest] = sub;
            });
            this.pendingSubscriptions = {};
        };
        
        // ... rest of error handlers
        
        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        this.client.onWebSocketError = (event) => {
            console.error('Error with websocket', event);
        };
        
        this.client.onDisconnect = () => {
            this.connected = false;
            console.log('Disconnected');
            this.subscriptions = {}; 
        }
    }

    activate(token?: string) {
        console.log('Activating STOMP client...');
        if (token) {
            this.client.connectHeaders = {
                Authorization: `Bearer ${token}`
            };
        }
        this.client.activate();
    }

    deactivate() {
        this.client.deactivate();
    }

    subscribe(destination: string, callback: (message: IMessage) => void) {
        if (!this.client.connected) {
            console.log('STOMP client not connected, queueing subscription to', destination);
            this.pendingSubscriptions[destination] = callback;
            return;
        }
        if (this.subscriptions[destination]) {
            return; // Already subscribed
        }
        const subscription = this.client.subscribe(destination, callback);
        this.subscriptions[destination] = subscription;
        console.log('Subscribed to ' + destination);
    }

    unsubscribe(destination: string) {
        if (this.subscriptions[destination]) {
            this.subscriptions[destination].unsubscribe();
            delete this.subscriptions[destination];
            console.log('Unsubscribed from ' + destination);
        }
        if (this.pendingSubscriptions[destination]) {
            delete this.pendingSubscriptions[destination];
        }
    }

    sendMessage(request: ChatMessageRequest) {
        if (this.client.connected) {
            this.client.publish({
                destination: '/app/chat.send',
                body: JSON.stringify(request),
            });
        } else {
            console.error('Cannot send message: STOMP not connected');
        }
    }

    sendTyping(request: TypingIndicatorRequest) {
        if (this.client.connected) {
            this.client.publish({
                destination: '/app/chat.typing',
                body: JSON.stringify(request),
            });
        }
    }

    sendReadReceipt(request: ReadReceiptRequest) {
        if (this.client.connected) {
            this.client.publish({
                destination: '/app/chat.read',
                body: JSON.stringify(request),
            });
        }
    }

    /** Alias for web compatibility: wraps sendChatMessage */
    sendMessage({ receiverId, content }: { receiverId: string; content: string; type?: string }) {
        return this.sendChatMessage(receiverId, content);
    }
}

export const webSocketService = new WebSocketService();
