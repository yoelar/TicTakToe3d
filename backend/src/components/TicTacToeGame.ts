import { Game, MoveResult } from './Game';
import { TicTacToePlayer } from './TicTacToePlayer';

export abstract class TicTacToeGame extends Game<TicTacToePlayer> {
    protected currentSymbol: 'X' | 'O' = 'X';

    isSoloMode(): boolean {
        return this.players.length === 1;
    }

    /** Common join logic for all tic-tac-toe variants */
    joinPlayer(clientId: string): { success: boolean; player?: 'X' | 'O'; error?: string } {
        if (this.players.length >= 2) {
            return { success: false, error: 'Game full' };
        }

        const assignedSymbol = this.players.some(p => p.symbol === 'X') ? 'O' : 'X';
        const player = new TicTacToePlayer(clientId, assignedSymbol);
        const result = this.addPlayer(player);

        if (!result.success) return result;
        return { success: true, player: assignedSymbol };
    }

    /** Each subclass must implement its own move logic */
    abstract makeMove(player: TicTacToePlayer, moveData: any): MoveResult;
}
