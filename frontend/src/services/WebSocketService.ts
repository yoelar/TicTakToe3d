// frontend/src/services/WebSocketService.ts
import { WSMessage } from '../types';

export interface IWebSocketService {
    connect(clientId: string, gameId: string): void;
    disconnect(): void;
    send(message: WSMessage): void;
    onMessage(callback: (message: WSMessage) => void): void;
    onConnectionChange(callback: (connected: boolean) => void): void;
}

/**
 * WebSocket abstraction following Dependency Inversion.
 * Allows easy testing and switching WebSocket implementations.
 */
export class WebSocketService implements IWebSocketService {
    private ws: WebSocket | null = null;
    private messageCallbacks: Array<(message: WSMessage) => void> = [];
    private connectionCallbacks: Array<(connected: boolean) => void> = [];
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private shouldReconnect = false;
    private currentClientId: string | null = null;
    private currentGameId: string | null = null;

    constructor(private readonly wsUrl: string) { }

    connect(clientId: string, gameId: string): void {
        this.currentClientId = clientId;
        this.currentGameId = gameId;
        this.shouldReconnect = true;
        this.establishConnection();
    }

    private establishConnection(): void {
        if (this.ws?.readyState === WebSocket.OPEN || !this.currentClientId || !this.currentGameId) {
            return;
        }

        const url = `${this.wsUrl}?clientId=${this.currentClientId}&gameId=${this.currentGameId}`;
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.notifyConnectionChange(true);
        };

        this.ws.onmessage = (event) => {
            try {
                const message: WSMessage = JSON.parse(event.data);
                this.notifyMessage(message);
            } catch (err) {
                console.error('Failed to parse WebSocket message:', err);
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.notifyConnectionChange(false);
            this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    private attemptReconnect(): void {
        if (!this.shouldReconnect) return;

        this.reconnectTimeout = setTimeout(() => {
            console.log('Attempting to reconnect...');
            this.establishConnection();
        }, 3000);
    }

    disconnect(): void {
        this.shouldReconnect = false;

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.currentClientId = null;
        this.currentGameId = null;
    }

    send(message: WSMessage): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('Cannot send message: WebSocket not connected');
        }
    }

    onMessage(callback: (message: WSMessage) => void): void {
        this.messageCallbacks.push(callback);
    }

    onConnectionChange(callback: (connected: boolean) => void): void {
        this.connectionCallbacks.push(callback);
    }

    private notifyMessage(message: WSMessage): void {
        this.messageCallbacks.forEach(cb => cb(message));
    }

    private notifyConnectionChange(connected: boolean): void {
        this.connectionCallbacks.forEach(cb => cb(connected));
    }
}