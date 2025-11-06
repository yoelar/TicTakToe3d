import { TicTacToeGame } from './TicTacToeGame';
import { TicTacToePlayer } from './TicTacToePlayer';
import { MoveResult } from './Game';

export class ThreeDTicTacToeGame extends TicTacToeGame {
    private board: string[][][] = Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () => Array(3).fill(''))
    );

    makeMove(player: TicTacToePlayer, { x, y, z }: any): MoveResult {
        if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
            return { success: false, error: 'Invalid move data' };
        }
        if (x < 0 || y < 0 || z < 0 || x > 2 || y > 2 || z > 2) {
            return { success: false, error: 'Invalid coordinates' };
        }
        if (this.board[z][y][x]) {
            return { success: false, error: 'Cell already occupied' };
        }

        let symbol = player.symbol;
        if (this.isSoloMode()) {
            symbol = this.currentSymbol;
            this.currentSymbol = this.currentSymbol === 'X' ? 'O' : 'X';
        }

        this.board[z][y][x] = symbol;
        return { success: true };
    }

    serialize() {
        return {
            ...super.serialize(),
            board: this.board,
            players: this.players.map(p => ({ id: p.id, symbol: p.symbol })),
        };
    }
}
