import { Client, IMessage } from '@stomp/stompjs';
import { useAuthStore } from '@/shared/store/authStore';

// Build WebSocket URL from API URL
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';
const WS_URL = API_URL.replace(/^http/, 'ws').replace(/\/api$/, '/ws-raw');

class WebSocketService {
    private client: Client;
    private connected: boolean = false;
    private pendingSubscriptions: Record<string, (message: IMessage) => void> = {};
    private subscriptions: Record<string, any> = {};

    constructor() {
        this.client = new Client({
            brokerURL: WS_URL,
            debug: (str) => {
                if (__DEV__) console.log('STOMP:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            // React Native needs this for WebSocket
            forceBinaryWSFrames: true,
            appendMissingNULLonIncoming: true,
        });

        this.client.onConnect = () => {
            console.log('✅ WebSocket connected');
            this.connected = true;

            // Process pending subscriptions
            Object.keys(this.pendingSubscriptions).forEach((dest) => {
                const callback = this.pendingSubscriptions[dest];
                const sub = this.client.subscribe(dest, callback);
                this.subscriptions[dest] = sub;
                console.log('📩 Subscribed (pending):', dest);
            });
            this.pendingSubscriptions = {};
        };

        this.client.onStompError = (frame) => {
            console.error('STOMP error:', frame.headers['message']);
        };

        this.client.onWebSocketError = (event) => {
            console.error('WebSocket error:', event);
        };

        this.client.onDisconnect = () => {
            this.connected = false;
            this.subscriptions = {};
            console.log('🔌 WebSocket disconnected');
        };
    }

    /** Activate the STOMP connection with JWT token */
    activate(token?: string) {
        const authToken = token || useAuthStore.getState().accessToken;
        if (!authToken) {
            console.warn('Cannot activate WebSocket: no JWT token');
            return;
        }

        // Don't reactivate if already connected
        if (this.connected) return;

        this.client.connectHeaders = {
            Authorization: `Bearer ${authToken}`,
        };

        console.log('🔄 Activating WebSocket to:', WS_URL);
        this.client.activate();
    }

    /** Deactivate the STOMP connection */
    deactivate() {
        this.client.deactivate();
        this.connected = false;
        this.subscriptions = {};
        this.pendingSubscriptions = {};
    }

    /** Check if connected */
    isConnected(): boolean {
        return this.connected;
    }

    /** Subscribe to a topic/destination */
    subscribe(destination: string, callback: (message: IMessage) => void) {
        if (!this.client.connected) {
            this.pendingSubscriptions[destination] = callback;
            return;
        }
        if (this.subscriptions[destination]) {
            return; // Already subscribed
        }
        const subscription = this.client.subscribe(destination, callback);
        this.subscriptions[destination] = subscription;
        console.log('📩 Subscribed to:', destination);
    }

    /** Unsubscribe from a topic/destination */
    unsubscribe(destination: string) {
        if (this.subscriptions[destination]) {
            this.subscriptions[destination].unsubscribe();
            delete this.subscriptions[destination];
        }
        delete this.pendingSubscriptions[destination];
    }

    /** Send a chat message via STOMP */
    sendChatMessage(roomId: string, content: string) {
        const body = JSON.stringify({
            receiverId: roomId,
            content,
        });

        if (this.client.connected) {
            this.client.publish({
                destination: '/app/chat.send',
                body,
            });
            return true;
        }

        console.warn('WebSocket not connected, cannot send via STOMP');
        return false;
    }

    /** Send typing indicator */
    sendTyping({ roomId, isTyping }: { roomId: string; isTyping: boolean }) {
        if (this.client.connected) {
            this.client.publish({
                destination: '/app/chat.typing',
                body: JSON.stringify({ roomId, isTyping }),
            });
        }
    }
}

export const webSocketService = new WebSocketService();
