// backend/src/components/ThreeDTicTacToeGame.ts
import { TicTacToeGame, TicTacToeMove } from './TicTacToeGame';
import { TicTacToePlayer } from './TicTacToePlayer';
import { MoveResult } from './Game';

type Cell = 'X' | 'O' | '';
type Coord = [number, number, number];

export class ThreeDTicTacToeGame extends TicTacToeGame {
    protected readonly size = 3;
    private board: Cell[][][];
    private static WINNING_LINES: Coord[][] = ThreeDTicTacToeGame.generateWinningLines(3);

    constructor(id: string) {
        super(id);
        this.board = ThreeDTicTacToeGame.createEmptyBoard(this.size);
    }

    private static createEmptyBoard(size: number): Cell[][][] {
        return Array.from({ length: size }, () =>
            Array.from({ length: size }, () => Array.from({ length: size }, () => '' as Cell))
        );
    }

    getBoard(): string[][][] {
        return this.board.map(layer => layer.map(row => [...row]));
    }

    // ✅ Added overloads for convenience
    makeMove(player: TicTacToePlayer, moveData: TicTacToeMove): MoveResult;
    makeMove(player: TicTacToePlayer, x: number, y: number, z: number): MoveResult;
    makeMove(player: TicTacToePlayer, arg2: any, arg3?: number, arg4?: number): MoveResult {
        let move: TicTacToeMove;

        if (typeof arg2 === 'object') {
            move = arg2 as TicTacToeMove;
        } else {
            move = { x: arg2, y: arg3!, z: arg4! };
        }

        try {
            this.validateMoveData(move);
        } catch (err: any) {
            return { success: false, error: err.message };
        }

        const { x, y, z } = move;
        if (z === undefined) return { success: false, error: 'Missing z coordinate for 3D game' };
        if (this.winner) return { success: false, error: 'Game already finished' };
        if ([x, y, z].some(v => v < 0 || v >= this.size)) return { success: false, error: 'Invalid coordinates' };
        if (this.board[z][y][x]) return { success: false, error: 'Cell already occupied' };

        if (this.isSoloMode()) {
            const flat = this.board.flat(2);
            const xCount = flat.filter(c => c === 'X').length;
            const oCount = flat.filter(c => c === 'O').length;
            const nextSign: Cell = xCount === oCount ? 'X' : 'O';
            this.board[z][y][x] = nextSign;
            this.currentPlayerSign = nextSign === 'X' ? 'O' : 'X';
        } else {
            if (!this.players.find(p => p.id === player.id)) {
                return { success: false, error: 'Player not part of this game' };
            }
            if (player.sign !== this.currentPlayerSign) {
                return { success: false, error: "Not this player's turn" };
            }
            this.board[z][y][x] = player.sign;
            this.rotateTurnAfterMove();
        }

        this.winner = this.checkWinner();
        return { success: true };
    }

    private checkWinner(): 'X' | 'O' | 'Draw' | null {
        for (const line of ThreeDTicTacToeGame.WINNING_LINES) {
            const [a, b, c] = line;
            const v1 = this.board[a[2]][a[1]][a[0]];
            const v2 = this.board[b[2]][b[1]][b[0]];
            const v3 = this.board[c[2]][c[1]][c[0]];
            if (v1 && v1 === v2 && v1 === v3) return v1;
        }
        const anyEmpty = this.board.some(layer => layer.some(row => row.some(cell => cell === '')));
        return anyEmpty ? null : 'Draw';
    }

    private static generateWinningLines(size: number): Coord[][] {
        const lines: Coord[][] = [];
        for (let z = 0; z < size; z++) {
            for (let y = 0; y < size; y++) lines.push(Array.from({ length: size }, (_, x) => [x, y, z]));
            for (let x = 0; x < size; x++) lines.push(Array.from({ length: size }, (_, y) => [x, y, z]));
            lines.push(Array.from({ length: size }, (_, i) => [i, i, z]));
            lines.push(Array.from({ length: size }, (_, i) => [size - 1 - i, i, z]));
        }
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) lines.push(Array.from({ length: size }, (_, z) => [x, y, z]));
        }
        for (let x = 0; x < size; x++) {
            lines.push(Array.from({ length: size }, (_, i) => [x, i, i]));
            lines.push(Array.from({ length: size }, (_, i) => [x, size - 1 - i, i]));
        }
        for (let y = 0; y < size; y++) {
            lines.push(Array.from({ length: size }, (_, i) => [i, y, i]));
            lines.push(Array.from({ length: size }, (_, i) => [size - 1 - i, y, i]));
        }
        lines.push(Array.from({ length: size }, (_, i) => [i, i, i]));
        lines.push(Array.from({ length: size }, (_, i) => [size - 1 - i, i, i]));
        lines.push(Array.from({ length: size }, (_, i) => [i, size - 1 - i, i]));
        lines.push(Array.from({ length: size }, (_, i) => [size - 1 - i, size - 1 - i, i]));
        return lines;
    }

    public serialize(): object {
        return {
            id: this.id,
            board: this.getBoard(),
            currentPlayer: this.currentPlayerSign,
            winner: this.winner,
            soloMode: this.isSoloMode(),
            players: this.players.map(p => ({
                id: p.id,
                sign: p.sign,
                connected: p.connected ?? true,
            })),
        };
    }
}
