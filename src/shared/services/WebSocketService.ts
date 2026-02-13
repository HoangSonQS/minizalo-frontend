import { Client, IMessage } from '@stomp/stompjs';
import { ChatMessageRequest, TypingIndicatorRequest, ReadReceiptRequest } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';
const WS_URL = API_URL.replace(/^http/, 'ws').replace(/\/api$/, '/ws');

console.log('WebSocketService initialized with URL:', WS_URL);

class WebSocketService {
    private client: Client;
    private connected: boolean = false;
    private pendingSubscriptions: Record<string, (message: IMessage) => void> = {};
    private subscriptions: Record<string, any> = {};

    constructor() {
        this.client = new Client({
            brokerURL: WS_URL,
            debug: (str) => {
                console.log('STOMP: ' + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
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
}

export const webSocketService = new WebSocketService();
