import { Client, IMessage } from "@stomp/stompjs";
import { useAuthStore } from "@/shared/store/authStore";
import {
    ChatMessageRequest,
    TypingIndicatorRequest,
    ReadReceiptRequest,
    PinMessageRequest,
} from "../types";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api";
const WS_URL = API_URL.replace(/^http/, "ws").replace(/\/api$/, "/ws-raw");

console.log("WebSocketService initialized with URL:", WS_URL);

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
                console.log('📩 Subscribed to:', dest);
            });
            this.pendingSubscriptions = {};
        };

        this.client.onStompError = (frame) => {
            console.error("Broker reported error: " + frame.headers["message"]);
            console.error("Additional details: " + frame.body);
        };

        this.client.onWebSocketError = (event) => {
            console.error("Error with websocket", event);
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
        return this.connected && this.client.connected;
    }

    /** Subscribe to a topic/destination */
    subscribe(destination: string, callback: (message: IMessage) => void) {
        if (!this.client.connected) {
            console.log("STOMP client not connected, queueing subscription to", destination);
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
        if (this.pendingSubscriptions[destination]) {
            delete this.pendingSubscriptions[destination];
        }
    }

    /** Gửi tin nhắn chat qua WebSocket, trả về true nếu thành công */
    sendChatMessage(
        receiverId: string,
        content: string,
        type: string = "TEXT",
        replyToMessageId?: string
    ): boolean {
        if (!this.client.connected) {
            console.error("Cannot send message: STOMP not connected");
            return false;
        }
        const body: ChatMessageRequest = {
            receiverId,
            content,
            type: type as any,
        };
        if (replyToMessageId) {
            body.replyToMessageId = replyToMessageId;
        }
        this.client.publish({
            destination: "/app/chat.send",
            body: JSON.stringify(body),
        });
        return true;
    }

    /** Gửi qua ChatMessageRequest đầy đủ */
    sendMessage(request: ChatMessageRequest) {
        if (this.client.connected) {
            this.client.publish({
                destination: "/app/chat.send",
                body: JSON.stringify(request),
            });
        } else {
            console.error("Cannot send message: STOMP not connected");
        }
    }

    /** Send typing indicator */
    sendTyping(request: TypingIndicatorRequest) {
        if (this.client.connected) {
            this.client.publish({
                destination: "/app/chat.typing",
                body: JSON.stringify(request),
            });
        }
    }

    sendReadReceipt(request: ReadReceiptRequest) {
        if (this.client.connected) {
            this.client.publish({
                destination: "/app/chat.read",
                body: JSON.stringify(request),
            });
        }
    }

    sendPin(request: PinMessageRequest) {
        if (this.client.connected) {
            this.client.publish({
                destination: "/app/chat.pin",
                body: JSON.stringify(request),
            });
        } else {
            console.error("Cannot send pin: STOMP not connected");
        }
    }
}

export const webSocketService = new WebSocketService();
