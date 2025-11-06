// backend/src/components/TicTacToeGame.ts
import { Game, MoveResult } from './Game';
import { TicTacToePlayer } from './TicTacToePlayer';

export interface TicTacToeMove {
    x: number;
    y: number;
    z?: number;
}

/**
 * Abstract base for any tic-tac-toe variant (2D, 3D, N×N×N).
 * Implements player management, turn rotation, and solo-mode logic.
 */
export abstract class TicTacToeGame extends Game {
    protected currentPlayerSign: 'X' | 'O' = 'X';
    protected winner: 'X' | 'O' | 'Draw' | null = null;
    protected players: TicTacToePlayer[] = [];

    constructor(id: string) {
        super(id);
        this.currentPlayerSign = 'X'; // ✅ Always start with X's turn
    }

    joinPlayer(clientId: string): { success: boolean; player?: 'X' | 'O'; error?: string } {
        // Already has this player?
        const existing = this.players.find(p => p.id === clientId);
        if (existing) {
            return { success: false, error: 'Player already joined' };
        }

        // Reject if full
        if (this.players.length >= 2) {
            return { success: false, error: 'Game full' };
        }

        // Assign next available sign
        const existingSigns = this.players.map(p => p.sign);
        const newSign: 'X' | 'O' = existingSigns.includes('X') ? 'O' : 'X';
        const newPlayer = new TicTacToePlayer(clientId, newSign);

        this.addPlayer(newPlayer);

        // First move should always start with X
        if (this.players.length === 2) {
            this.currentPlayerSign = 'X';
        }

        return { success: true, player: newSign };
    }

    addPlayer(player: TicTacToePlayer): void {
        this.players.push(player);
    }

    getPlayers(): TicTacToePlayer[] {
        return [...this.players];
    }

    removePlayer(player: TicTacToePlayer): void {
        this.players = this.players.filter(p => p.id !== player.id);
    }

    isSoloMode(): boolean {
        return this.players.length < 2;
    }

    protected rotateTurnAfterMove(): void {
        this.currentPlayerSign = this.currentPlayerSign === 'X' ? 'O' : 'X';
    }

    protected validateMoveData(move: TicTacToeMove): void {
        if (typeof move.x !== 'number' || typeof move.y !== 'number') {
            throw new Error('Invalid move data');
        }
    }

    /**
     * Overloaded abstract move interface — implemented in subclasses.
     */
    abstract makeMove(player: TicTacToePlayer, move: TicTacToeMove): MoveResult;
    abstract makeMove(player: TicTacToePlayer, x: number, y: number, z?: number): MoveResult;

    /**
     * Each concrete subclass must define its own serialization.
     */
    abstract serialize(): object;

    public getCurrentPlayer(): 'X' | 'O' {
        return this.currentPlayerSign;
    }

    public getWinner(): 'X' | 'O' | 'Draw' | null {
        return this.winner;
    }
}

