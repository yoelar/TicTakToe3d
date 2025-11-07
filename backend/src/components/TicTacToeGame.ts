import { Game } from './Game';
import { TicTacToePlayer } from './TicTacToePlayer';

export abstract class TicTacToeGame<TBoard = string[][]> extends Game<TicTacToePlayer> {
    protected board!: TBoard;
    protected currentTurn: 'X' | 'O' = 'X';

    constructor(id: string, board?: TBoard) {
        super(id);
        this.board = board ?? (Array.from({ length: 3 }, () => Array(3).fill('')) as unknown as TBoard);
    }

    /** Whether the game currently has only one active player */
    protected isSoloMode(): boolean {
        return this.players.length === 1;
    }

    protected setCell(x: number, y: number, symbol: string, z?: number): void {
        this.board[y][x] = symbol; // ignore z in 2D
    }

    protected getCell(x: number, y: number, z?: number): string {
        return this.board[y][x];
    }
    abstract isValidCoordinates(x: number, y: number, z?: number): boolean;

    makeMove(player: TicTacToePlayer, moveData: { x: number; y: number; z?: number }) {
        const { x, y, z = 0 } = moveData;

        if (!this.isValidCoordinates(x, y, z)) {
            return { success: false, error: 'Invalid coordinates' };
        }

        if (this.getCell(x, y, z) !== '') {
            return { success: false, error: 'Cell already occupied' };
        }

        if (!this.isSoloMode() && this.currentTurn !== player.symbol) {
            return { success: false, error: 'Not your turn' };
        }

        const symbolToPlace = this.isSoloMode() ? this.currentTurn : player.symbol;

        // ✅ Call with z even if 2D version ignores it
        this.setCell(x, y, symbolToPlace, z);

        // Toggle turn (both solo and multi)
        this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';

        return { success: true };
    }

    /** Add or rejoin a player by client ID */
    joinPlayer(clientId: string) {
        // Existing player rejoining?
        const existing = this.players.find(p => p.id === clientId);
        if (existing) return { success: true, player: existing.symbol };

        // Max two players
        if (this.players.length >= 2) {
            return { success: false, error: 'Game full' };
        }

        const symbol = this.players.some(p => p.symbol === 'X') ? 'O' : 'X';
        const player = new TicTacToePlayer(clientId, symbol);
        this.addPlayer(player);

        return { success: true, player: symbol };
    }

    /** Remove a player by either object or ID */
    removePlayer(playerOrId: string | TicTacToePlayer) {
        const id = typeof playerOrId === 'string' ? playerOrId : playerOrId.id;
        const before = this.players.length;
        this.players = this.players.filter(p => p.id !== id);

        const removed = this.players.length < before;
        return removed
            ? { success: true, remaining: this.players.map(p => ({ id: p.id, symbol: p.symbol })) }
            : { success: false, error: 'Player not found' };
    }

    serialize() {
        return {
            id: this.id,
            createdAt: this.createdAt,
            players: this.players.map(p => ({ id: p.id, symbol: p.symbol })),
            board: this.board,
            isFinished: this.isFinished,
        };
    }

}
