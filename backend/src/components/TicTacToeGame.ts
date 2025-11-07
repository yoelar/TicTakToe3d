import { Game } from './Game';
import { TicTacToePlayer } from './TicTacToePlayer';
import { MoveResult } from './types';

/**
 * Abstract base for 2D and 3D TicTacToe variants.
 * Handles shared logic such as player management, turn tracking, and serialization.
 */
export abstract class TicTacToeGame<TBoard = string[][]> extends Game<TicTacToePlayer> {
    protected board: TBoard;
    protected currentTurn: 'X' | 'O' = 'X';
    protected winner: 'X' | 'O' | '' = '';
    public override isFinished = false;

    constructor(id: string, board?: TBoard) {
        super(id);
        // Default 3×3 (2D) board if not provided
        this.board =
            board ??
            (Array.from({ length: 3 }, () => Array(3).fill('')) as unknown as TBoard);
    }

    /** Whether the game currently has only one active player */
    protected isSoloMode(): boolean {
        return this.players.length === 1;
    }

    /** Common 2D setter (3D subclasses override if needed) */
    protected setCell(x: number, y: number, symbol: 'X' | 'O', z?: number): void {
        (this.board as any)[y][x] = symbol;
    }

    /** Common 2D getter (3D subclasses override if needed) */
    protected getCell(x: number, y: number, z?: number): string {
        return (this.board as any)[y][x];
    }

    /** Validate coordinates (2D or 3D depending on subclass) */
    abstract isValidCoordinates(x: number, y: number, z?: number): boolean;

    /** Determine winner — implemented by concrete subclass */
    protected abstract checkWinner(): 'X' | 'O' | '';

    /** Main move application logic (implemented by subclass) */
    abstract makeMove(
        player: TicTacToePlayer,
        moveData: { x: number; y: number; z?: number }
    ): MoveResult;

    // ------------------ Player management ------------------

    /**
     * Add or rejoin a player by client ID.
     * - Rejoining returns the existing player.
     * - Rejects if the game already has two players.
     */
    joinPlayer(clientId: string) {
        // If the player is already in the game, just return them.
        const existing = this.players.find(p => p.id === clientId);
        if (existing) {
            return { success: true, player: existing };
        }

        // Game full: can’t join.
        if (this.players.length >= 2) {
            return { success: false, error: 'Game full' };
        }

        let symbol: 'X' | 'O';

        if (this.players.length === 0) {
            // Empty game (new or reset) — first player always gets 'X'
            symbol = 'X';
        } else {
            // One player already exists → assign the opposite symbol
            const existingSymbol = this.players[0].symbol;
            symbol = existingSymbol === 'X' ? 'O' : 'X';
        }

        const player = new TicTacToePlayer(clientId, symbol);
        this.addPlayer(player);

        return { success: true, player };
    }

    /**
     * Remove a player by ID or object.
     * Returns success or a "not found" error.
     */
    override removePlayer(playerOrId: string | TicTacToePlayer) {
        const id = typeof playerOrId === 'string' ? playerOrId : playerOrId.id;
        const before = this.players.length;
        this.players = this.players.filter(p => p.id !== id);
        const removed = this.players.length < before;

        return removed
            ? { success: true, remaining: this.players.map(p => ({ id: p.id, symbol: p.symbol })) }
            : { success: false, error: 'Player not found' };
    }

    // ------------------ Serialization & accessors ------------------

    /** Serialize full state for persistence or frontend display */
    override serialize() {
        return {
            ...super.serialize(),
            board: this.board,
            winner: this.winner,
            isFinished: this.isFinished,
            players: this.players.map(p => ({ id: p.id, symbol: p.symbol })),
        };
    }

    /** Public accessors for tests / consumers */
    getBoard(): TBoard {
        return this.board;
    }

    getWinner(): 'X' | 'O' | '' {
        return this.winner;
    }

    getCurrentTurn(): 'X' | 'O' {
        return this.currentTurn;
    }
}
