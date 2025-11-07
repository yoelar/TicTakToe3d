import { TicTacToeGame } from './TicTacToeGame';
import { TicTacToePlayer } from './TicTacToePlayer';
import { MoveResult, GameState } from './types';

/**
 * 3D TicTacToe implementation (3×3×3 cube).
 * Supports caching of all winning line coordinates for efficiency.
 */
export class ThreeDTicTacToeGame extends TicTacToeGame<string[][][]> {
    private readonly winningLines: [number, number, number][][];

    constructor(id: string) {
        const board = Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () => Array(3).fill(''))
        );
        super(id, board);
        this.winningLines = this.generateWinningLines();
    }

    /** Validate x, y, z coordinates (all integers within 0–2) */
    override isValidCoordinates(x: number, y: number, z?: number): boolean {
        return (
            Number.isInteger(x) &&
            Number.isInteger(y) &&
            Number.isInteger(z) &&
            x >= 0 && x < 3 &&
            y >= 0 && y < 3 &&
            z! >= 0 && z! < 3
        );
    }

    protected setCell(x: number, y: number, symbol: string, z?: number): void {
        // Correct 3D indexing: [z][y][x]
        if (z === undefined) return;
        (this.board as any)[z][y][x] = symbol;
    }

    protected getCell(x: number, y: number, z?: number): string {
        if (z === undefined) return '';
        return (this.board as any)[z][y][x];
    }

    makeMove(player: TicTacToePlayer, moveData: { x: number; y: number; z?: number }): MoveResult {
        const { x, y, z } = moveData;

        if (z === undefined) {
            return { success: false, error: 'Missing z coordinate for 3D move' };
        }

        if (!this.isValidCoordinates(x, y, z)) {
            return { success: false, error: 'Invalid coordinates' };
        }

        const solo = this.isSoloMode();

        // If multiplayer, enforce turn ownership
        if (!solo && player.symbol !== this.currentTurn) {
            return { success: false, error: 'Not your turn' };
        }

        // In solo mode, alternate symbols automatically
        const symbolToPlay = solo ? this.currentTurn : player.symbol;

        if (this.board[z][y][x] !== '') {
            return { success: false, error: 'Cell already occupied' };
        }

        // Apply move
        this.board[z][y][x] = symbolToPlay;

        // Toggle turn (solo mode still alternates)
        this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';

        const winner = this.checkWinner();
        if (winner) this.isFinished = true;

        return {
            success: true,
            winner,
            isFinished: this.isFinished,
            state: this.serialize(), // always return fresh serialized board
        };
    }

    serialize(): GameState<any> {
        return {
            id: this.id,
            createdAt: this.createdAt,
            board: this.board,
            players: this.players.map(p => ({ id: p.id, symbol: p.symbol })),
            isFinished: this.isFinished,
            winner: this.winner,
        };
    }

    /** Precompute all 49 possible 3D winning lines once per game */
    private generateWinningLines(): [number, number, number][][] {
        const lines: [number, number, number][][] = [];

        // Planar rows, columns, and diagonals
        for (let z = 0; z < 3; z++) {
            for (let i = 0; i < 3; i++) {
                lines.push([
                    [0, i, z], [1, i, z], [2, i, z]
                ]); // rows
                lines.push([
                    [i, 0, z], [i, 1, z], [i, 2, z]
                ]); // columns
            }
            lines.push([
                [0, 0, z], [1, 1, z], [2, 2, z]
            ]);
            lines.push([
                [0, 2, z], [1, 1, z], [2, 0, z]
            ]);
        }

        // Verticals
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                lines.push([
                    [x, y, 0], [x, y, 1], [x, y, 2]
                ]);
            }
        }

        // 3D diagonals
        lines.push([
            [0, 0, 0], [1, 1, 1], [2, 2, 2]
        ]);
        lines.push([
            [0, 0, 2], [1, 1, 1], [2, 2, 0]
        ]);
        lines.push([
            [0, 2, 0], [1, 1, 1], [2, 0, 2]
        ]);
        lines.push([
            [0, 2, 2], [1, 1, 1], [2, 0, 0]
        ]);

        return lines;
    }

    /** Winner detection using cached winning lines */
    protected override checkWinner(): 'X' | 'O' | '' {
        for (const line of this.winningLines) {
            const symbols = line.map(([x, y, z]) => this.board[z][y][x]);
            if (symbols[0] && symbols.every(s => s === symbols[0])) {
                return symbols[0] as 'X' | 'O';
            }
        }
        return '';
    }
}
