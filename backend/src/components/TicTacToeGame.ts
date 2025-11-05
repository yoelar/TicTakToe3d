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

    addPlayer(player: TicTacToePlayer): void {
        if (this.players.length >= 2) {
            throw new Error('Game full');
        }

        // prevent same player joining twice
        if (this.players.some(p => p.id === player.id)) {
            throw new Error('Player already joined');
        }

        this.players.push(player);

        // ✅ If we now have two players, ensure game starts with X
        if (this.players.length === 2) {
            this.currentPlayerSign = 'X';
        }
    }

    getPlayers(): TicTacToePlayer[] {
        return [...this.players];
    }

    isSoloMode(): boolean {
        return this.players.length === 1;
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

