// backend/src/websocket/WebSocketManager.ts
import WebSocket from 'ws';
import { GameRoom } from './GameRoom';
import { WSMessage } from './types';

export class WebSocketManager {
    private static instance: WebSocketManager;
    private rooms: Map<string, GameRoom> = new Map();
    private clientToRoom: Map<string, string> = new Map();

    private constructor() { }

    static getInstance(): WebSocketManager {
        if (!this.instance) {
            this.instance = new WebSocketManager();
        }
        return this.instance;
    }

    registerClient(clientId: string, gameId: string, ws: WebSocket): void {
        if (!this.rooms.has(gameId)) {
            this.rooms.set(gameId, new GameRoom(gameId));
        }

        const room = this.rooms.get(gameId)!;
        room.addClient(clientId, ws);
        this.clientToRoom.set(clientId, gameId);
    }

    unregisterClient(clientId: string): void {
        const gameId = this.clientToRoom.get(clientId);
        if (!gameId) return;

        const room = this.rooms.get(gameId);
        if (room) {
            room.removeClient(clientId);
            if (room.isEmpty()) {
                this.rooms.delete(gameId);
            }
        }
        this.clientToRoom.delete(clientId);
    }

    broadcastToGame(gameId: string, message: WSMessage, excludeClientId?: string): void {
        const room = this.rooms.get(gameId);
        if (room) {
            room.broadcast(message, excludeClientId);
        }
    }

    getClientCount(gameId: string): number {
        return this.rooms.get(gameId)?.getClientCount() || 0;
    }
}