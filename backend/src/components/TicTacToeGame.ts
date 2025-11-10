// backend/src/components/TicTacToeGame.ts
import { Game } from './Game';
import { TicTacToePlayer } from './TicTacToePlayer';
import { MoveResult } from './types';
import { IBoard } from './board/IBoard';
import { TwoPlayerSession } from './session/TwoPlayerSession';

export type TicTacToeMove = { x: number; y: number; z?: number };

export abstract class TicTacToeGame<TBoard extends IBoard<'X' | 'O' | ''>> extends Game<TicTacToePlayer> {
    protected board: TBoard;
    protected session = new TwoPlayerSession();
    protected winner: 'X' | 'O' | '' = '';
    public override isFinished = false;

    constructor(id: string, board: TBoard) {
        super(id);
        this.board = board;
    }

    joinPlayer(clientId: string) {
        return this.session.addPlayer(clientId);
    }

    override removePlayer(clientId: string) {
        const removed = this.session.removePlayer(clientId);
        return removed
            ? { success: true }
            : { success: false, error: 'Player not found' };
    }

    public isSoloMode(): boolean {
        return this.session.isSolo();
    }

    protected get currentTurn() {
        return this.session.getCurrentTurn();
    }

    protected nextTurn() {
        this.session.toggleTurn();
    }

    getPlayers() {
        return this.session.getPlayers();
    }

    abstract makeMove(player: TicTacToePlayer, moveData: TicTacToeMove): MoveResult;

    override serialize() {
        return {
            ...super.serialize(),
            board: this.board.toJSON(),
            winner: this.winner,
            isFinished: this.isFinished,
            players: this.session.toJSON(),
        };
    }

    getBoard(): TBoard {
        return this.board;
    }
}
