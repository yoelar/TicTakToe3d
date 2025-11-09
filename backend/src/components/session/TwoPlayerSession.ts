// backend/src/components/session/TwoPlayerSession.ts
import { TicTacToePlayer } from '../TicTacToePlayer';

/**
 * Manages two-player participation and turn sequencing
 * in a TicTacToe game. Independent from board logic.
 */
export class TwoPlayerSession {
    private players: TicTacToePlayer[] = [];
    private currentTurn: 'X' | 'O' = 'X';

    /**
     * Add or rejoin a player.
     * - First player always gets 'X'
     * - Second player gets 'O'
     * - Prevents duplicates or >2 players
     */
    addPlayer(clientId: string): { success: boolean; player?: TicTacToePlayer; error?: string } {
        const existing = this.players.find(p => p.id === clientId);
        if (existing) return { success: true, player: existing };

        if (this.players.length >= 2) {
            return { success: false, error: 'Game full' };
        }

        const existingSymbols = this.players.map(p => p.symbol);
        const newSymbol: 'X' | 'O' = existingSymbols.includes('X') ? 'O' : 'X';
        const player = new TicTacToePlayer(clientId, newSymbol);
        this.players.push(player);
        return { success: true, player };
    }

    /** Remove a player by ID */
    removePlayer(clientId: string): boolean {
        const before = this.players.length;
        this.players = this.players.filter(p => p.id !== clientId);
        return this.players.length < before;
    }

    /** Get all current players */
    getPlayers(): TicTacToePlayer[] {
        return [...this.players];
    }

    /** Whether there’s only one active player */
    isSolo(): boolean {
        return this.players.length === 1;
    }

    /** Get the player whose turn it currently is */
    getCurrentTurn(): 'X' | 'O' {
        return this.currentTurn;
    }

    /** Advance to the next turn */
    toggleTurn(): void {
        this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';
    }

    /** Find player by symbol (X or O) */
    findBySymbol(symbol: 'X' | 'O'): TicTacToePlayer | undefined {
        return this.players.find(p => p.symbol === symbol);
    }

    /** Serialize players for API responses */
    toJSON() {
        return this.players.map(p => ({ id: p.id, symbol: p.symbol }));
    }
}
