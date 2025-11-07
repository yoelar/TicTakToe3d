import { TicTacToeGame } from './TicTacToeGame';
import { TicTacToePlayer } from './TicTacToePlayer';

export class ThreeDTicTacToeGame extends TicTacToeGame<string[][][]> {
    protected board = Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () => Array(3).fill(''))
    );

    protected getCell(x: number, y: number, z: number): string {
        return this.board[x][y][z];
    }

    protected setCell(x: number, y: number, symbol: string, z: number): void {
        this.board[x][y][z] = symbol;
    }

    isValidCoordinates(x: number, y: number, z = 0): boolean {
        return [x, y, z].every(c => typeof c === 'number' && c >= 0 && c < 3);
    }

    serialize() {
        return {
            ...super.serialize(),
            board: this.board,
        };
    }
}
