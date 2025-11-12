// frontend/src/services/GameApiService.ts
import { GameState } from '../../../Shared/types';

export interface IGameApiService {
    createGame(clientId: string): Promise<{ gameId: string; state: GameState }>;
    joinGame(gameId: string, clientId: string): Promise<{ state: GameState }>;
    leaveGame(gameId: string, clientId: string): Promise<void>;
    makeMove(gameId: string, clientId: string, player: 'X' | 'O', x: number, y: number, z: number): Promise<{ state: GameState }>;
}

/**
 * Handles all REST API calls for game operations.
 * Interface Segregation: Clean API contract
 * Open/Closed: Easy to extend with new endpoints
 */
export class GameApiService implements IGameApiService {
    constructor(private readonly baseUrl: string = '/api') { }

    async createGame(clientId: string): Promise<{ gameId: string; state: GameState }> {
        const res = await fetch(`${this.baseUrl}/game?clientId=${clientId}`, {
            method: "POST"
        });
        if (!res.ok) {
            throw new Error('Failed to create game');
        }
        return res.json();
    }

    async joinGame(gameId: string, clientId: string): Promise<{ state: GameState }> {
        const res = await fetch(`${this.baseUrl}/game/${gameId}/join?clientId=${clientId}`, {
            method: "POST"
        });
        if (!res.ok) {
            throw new Error('Failed to join game');
        }
        return res.json();
    }

    async leaveGame(gameId: string, clientId: string): Promise<void> {
        const res = await fetch(`${this.baseUrl}/game/${gameId}/leave?clientId=${clientId}`, {
            method: "POST"
        });
        if (!res.ok) {
            throw new Error('Failed to leave game');
        }
    }

    async makeMove(
        gameId: string,
        clientId: string,
        player: 'X' | 'O',
        x: number,
        y: number,
        z: number
    ): Promise<{ state: GameState }> {
        const resp = await fetch(`${this.baseUrl}/game/${gameId}/move?clientId=${clientId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ player, x, y, z }),
        });
        if (!resp.ok) {
            throw new Error('Move rejected by server');
        }
        return resp.json();
    }
}