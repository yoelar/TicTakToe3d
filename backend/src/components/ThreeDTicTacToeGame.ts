import { TicTacToeGame } from './TicTacToeGame';
import { TicTacToePlayer } from './TicTacToePlayer';
import { MoveResult } from './types';

export class ThreeDTicTacToeGame extends TicTacToeGame<string[][][]> {
    private static WINNING_LINES: [number, number, number][][] = ThreeDTicTacToeGame.generateWinningLines();

    constructor(id: string) {
        // call the parent constructor with ID and initialize a 3D empty board
        super(id);
        this.board = Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () => Array(3).fill(''))
        );
    }

    static generateWinningLines() {
        const lines: [number, number, number][][] = [];

        // Rows, columns, pillars
        for (let z = 0; z < 3; z++) {
            for (let i = 0; i < 3; i++) {
                lines.push(
                    [
                        [0, i, z],
                        [1, i, z],
                        [2, i, z],
                    ],
                    [
                        [i, 0, z],
                        [i, 1, z],
                        [i, 2, z],
                    ]
                );
            }
        }

        // Diagonals per layer
        for (let z = 0; z < 3; z++) {
            lines.push(
                [
                    [0, 0, z],
                    [1, 1, z],
                    [2, 2, z],
                ],
                [
                    [2, 0, z],
                    [1, 1, z],
                    [0, 2, z],
                ]
            );
        }

        // Across layers (pillars)
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                lines.push(
                    [
                        [x, y, 0],
                        [x, y, 1],
                        [x, y, 2],
                    ]
                );
            }
        }

        // 3D diagonals
        lines.push(
            [
                [0, 0, 0],
                [1, 1, 1],
                [2, 2, 2],
            ],
            [
                [2, 0, 0],
                [1, 1, 1],
                [0, 2, 2],
            ],
            [
                [0, 2, 0],
                [1, 1, 1],
                [2, 0, 2],
            ],
            [
                [2, 2, 0],
                [1, 1, 1],
                [0, 0, 2],
            ]
        );

        return lines;
    }

    protected checkWinner(): '' | 'X' | 'O' {
        for (const line of ThreeDTicTacToeGame.WINNING_LINES) {
            const [a, b, c] = line;
            const s1 = this.board[a[1]][a[0]][a[2]];
            if (s1 && s1 === this.board[b[1]][b[0]][b[2]] && s1 === this.board[c[1]][c[0]][c[2]]) {
                return s1 as 'X' | 'O';
            }
        }
        return '';
    }

    isValidCoordinates(x: number, y: number, z = 0): boolean {
        return x >= 0 && x < 3 && y >= 0 && y < 3 && z >= 0 && z < 3;
    }

    makeMove(player: TicTacToePlayer, move: { x: number; y: number; z?: number }): MoveResult {
        const { x, y, z = 0 } = move;

        if (!this.isValidCoordinates(x, y, z)) {
            return { success: false, error: 'Invalid coordinates' };
        }

        if (this.board[y][x][z] !== '') {
            return { success: false, error: 'Cell already occupied' };
        }

        if (!this.isSoloMode() && this.currentTurn !== player.symbol) {
            return { success: false, error: 'Not your turn' };
        }

        const symbolToPlace = this.isSoloMode() ? this.currentTurn : player.symbol;
        this.board[y][x][z] = symbolToPlace;

        const winner = this.checkWinner();
        if (winner) {
            this.isFinished = true;
        }

        this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';

        return {
            success: true,
            winner,
            isFinished: this.isFinished,
            state: this.serialize(),
        };
    }

    getBoard() {
        return this.board;
    }
}
