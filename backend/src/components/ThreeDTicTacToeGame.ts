import { TicTacToeGame } from './TicTacToeGame';
import { TicTacToePlayer } from './TicTacToePlayer';
import { MoveResult } from './types';

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

    override getCell(x: number, y: number, z: number): string {
        return this.board[z][y][x];
    }

    override setCell(x: number, y: number, symbol: 'X' | 'O', z: number): void {
        this.board[z][y][x] = symbol;
    }

    /**
     * Make a move in the 3D grid.
     * Includes validation, turn order, and winner detection.
     */
    override makeMove(
        player: TicTacToePlayer,
        moveData: { x: number; y: number; z?: number }
    ): MoveResult {
        const { x, y, z } = moveData;

        // ✅ Reject missing z coordinate
        if (z === undefined || z === null) {
            return { success: false, error: 'Missing z coordinate for 3D move' };
        }

        if (this.isFinished) {
            return { success: false, error: 'Game already finished' };
        }

        const currentPlayer = this.players.find(p => p.id === player.id);
        if (!currentPlayer) {
            return { success: false, error: 'Player not in game' };
        }

        if (!this.isSoloMode() && currentPlayer.symbol !== this.currentTurn) {
            return { success: false, error: 'Not your turn' };
        }

        if (!this.isValidCoordinates(x, y, z)) {
            return { success: false, error: 'Invalid coordinates' };
        }

        if (this.getCell(x, y, z) !== '') {
            return { success: false, error: 'Cell already occupied' };
        }

        // Make move
        this.setCell(x, y, currentPlayer.symbol, z);

        // Winner check
        const winner = this.checkWinner();
        if (winner) {
            this.isFinished = true;
            this.winner = winner;
        } else {
            // Draw check
            const isFull = this.board.every(plane =>
                plane.every(row => row.every(cell => cell !== ''))
            );
            if (isFull) {
                this.isFinished = true;
            }
        }

        // Switch turns if game not finished
        if (!this.isFinished) {
            this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';
        }

        // ✅ Always return full MoveResult
        return {
            success: true,
            winner: this.winner,
            isFinished: this.isFinished,
            state: this.serialize(),
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

    override serialize() {
        return {
            ...super.serialize(),
            dimensions: [3, 3, 3],
        };
    }
}
