import { Game, MoveResult } from './Game';
import { TicTacToePlayer } from './TicTacToePlayer';

export abstract class TicTacToeGame extends Game {
    public players: TicTacToePlayer[] = [];
    public currentPlayerSign: 'X' | 'O' = 'X';

    addPlayer(player: TicTacToePlayer): void {
        // TODO: Implement later
    }

    makeMove(player: TicTacToePlayer, x: number, y: number, z: number): MoveResult {
        return { success: false, error: 'Not implemented' };
    }

    isSoloMode(): boolean {
        return this.players.length <= 1;
    }

    abstract getBoard(): string[][][];
}
