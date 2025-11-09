// backend/src/components/session/TwoPlayerSession.ts
import { TicTacToePlayer } from '../TicTacToePlayer';

interface AddPlayerResult {
    success: boolean;
    player?: TicTacToePlayer;
    error?: string;
}

interface RemovePlayerResult {
    success: boolean;
    error?: string;
}

/**
 * Handles the player management and turn rotation for two-player TicTacToe sessions.
 */
export class TwoPlayerSession {
    private players: TicTacToePlayer[] = [];
    private currentTurn: 'X' | 'O' = 'X';

    /** Add or rejoin a player by ID */
    addPlayer(clientId: string): AddPlayerResult {
        const existing = this.players.find(p => p.id === clientId);
        if (existing) {
            // Rejoin existing player
            return { success: true, player: existing };
        }

        if (this.players.length >= 2) {
            return { success: false, error: 'Session is full' };
        }

        const symbol = this.assignSymbol();
        const player = new TicTacToePlayer(clientId, symbol);
        this.players.push(player);
        return { success: true, player };
    }

    /** Remove a player by ID */
    removePlayer(clientId: string): RemovePlayerResult {
        const before = this.players.length;
        this.players = this.players.filter(p => p.id !== clientId);
        if (this.players.length < before) {
            return { success: true };
        } else {
            return { success: false, error: 'Player not found' };
        }
    }

    /** Return both current players */
    getPlayers(): TicTacToePlayer[] {
        return [...this.players];
    }

    /** Whether there is exactly one player in the session */
    isSolo(): boolean {
        return this.players.length === 1;
    }

    /** Current symbol turn getter */
    getCurrentTurn(): 'X' | 'O' {
        return this.currentTurn;
    }

    /** Toggle between X and O */
    toggleTurn(): void {
        this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';
    }

    /** Find player by their symbol */
    findBySymbol(symbol: 'X' | 'O'): TicTacToePlayer | undefined {
        return this.players.find(p => p.symbol === symbol);
    }

    /** Internal helper: assign appropriate next symbol */
    private assignSymbol(): 'X' | 'O' {
        const symbols = this.players.map(p => p.symbol);
        if (!symbols.includes('X')) return 'X';
        if (!symbols.includes('O')) return 'O';
        throw new Error('Both symbols already taken');
    }

    /** Reset session state (optional utility for tests or reuse) */
    reset(): void {
        this.players = [];
        this.currentTurn = 'X';
    }
    /** 🔹 Fix for ThreeDTicTacToeGame.serialize() */
    toJSON(): { id: string; symbol: 'X' | 'O' }[] {
        return this.players.map(p => ({ id: p.id, symbol: p.symbol }));
    }

}
