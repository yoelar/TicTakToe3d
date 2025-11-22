// backend/src/components/ThreeDTicTacToeGame.ts
import { TicTacToeGame } from './TicTacToeGame';
import { TicTacToePlayer } from './TicTacToePlayer';
import { MoveResult, GameState } from './types';
import { Board3D } from './board/Board3D';
import { WinnerChecker3D } from './board/WinnerChecker3D';

/**
 * Concrete 3D TicTacToe game logic.
 * Uses Board3D for board management and WinnerChecker3D for win detection.
 * Player and turn logic are handled by TwoPlayerSession (via TicTacToeGame).
 */
export class ThreeDTicTacToeGame extends TicTacToeGame<Board3D> {
    private readonly checker: WinnerChecker3D;

    constructor(id: string) {
        const board = new Board3D();
        super(id, board);
        this.checker = new WinnerChecker3D(board);
    }

    makeMove(player: TicTacToePlayer, moveData: { x: number; y: number; z?: number }): MoveResult {
        const { x, y, z } = moveData;

        if (z === undefined) {
            return { success: false, error: 'Missing z coordinate' };
        }

        if (!this.board.isValid(x, y, z)) {
            return { success: false, error: 'Invalid coordinates' };
        }

        if (this.isFinished) {
            return { success: false, error: 'Game is already finished' };
        }

        // Delegate solo and turn logic to session
        const solo = this.isSoloMode();
        const currentTurn = this.currentTurn;

        if (!solo && player.symbol !== currentTurn) {
            return { success: false, error: 'Not your turn' };
        }

        const symbolToPlay = solo ? currentTurn : player.symbol;

        if (!this.board.isEmpty(x, y, z)) {
            return { success: false, error: 'Cell already occupied' };
        }

        // Apply the move
        this.board.set(x, y, z, symbolToPlay);

        // Advance to the next turn
        this.session.toggleTurn();

        // Check for winner
        const winner = this.checker.checkWinner();
        if (winner) {
            this.winner = winner;
            this.isFinished = true;
        }

        return {
            success: true,
            winner,
            isFinished: this.isFinished,
            state: this.serialize(),
        };
    }

    override serialize(): GameState<any> {
        return {
            id: this.id,
            createdAt: this.createdAt,
            board: this.board.toJSON(),
            players: this.session.toJSON(),
            isFinished: this.isFinished,
            winner: this.winner,
        };
    }
}
