import { TicTacToeGame } from './TicTacToeGame';
import { TicTacToePlayer } from './TicTacToePlayer';
import { MoveResult } from './Game';

export class ThreeDTicTacToeGame extends TicTacToeGame {
    private board: string[][][] = Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => ''))
    );

    getBoard(): string[][][] {
        return this.board;
    }

    addPlayer(player: TicTacToePlayer): void {
        this.players.push(player);
    }

    makeMove(player: TicTacToePlayer, x: number, y: number, z: number): MoveResult {
        return { success: false, error: 'Not implemented' };
    }
}
