import { TicTacToePlayer } from '../../components/TicTacToePlayer';
import { ThreeDTicTacToeGame } from '../../components/ThreeDTicTacToeGame';

describe('Game hierarchy', () => {
    let game: ThreeDTicTacToeGame;
    let playerX: TicTacToePlayer;
    let playerO: TicTacToePlayer;

    beforeEach(() => {
        playerX = new TicTacToePlayer('playerX', 'X');
        playerO = new TicTacToePlayer('playerO', 'O');
        game = new ThreeDTicTacToeGame('test-game');
        game.addPlayer(playerX);
    });

    it('starts in solo mode', () => {
        expect(game.isSoloMode()).toBe(true);
    });

    it('adds a second player and switches out of solo mode', () => {
        game.addPlayer(playerO);
        expect(game.isSoloMode()).toBe(false);
    });

    it('initializes an empty 3󫢫 board', () => {
        const board = game.getBoard();
        expect(board.length).toBe(3);
        expect(board[0].length).toBe(3);
        expect(board[0][0].length).toBe(3);
        expect(board.flat(2).every(cell => cell === '')).toBe(true);
    });

    it('allows a valid move from the current player', () => {
        const result = game.makeMove(playerX, 0, 0, 0);
        expect(result.success).toBe(true);
        expect(game.getBoard()[0][0][0]).toBe('X');
    });

    it('rejects move on occupied cell', () => {
        game.makeMove(playerX, 0, 0, 0);
        const result = game.makeMove(playerX, 0, 0, 0);
        expect(result.success).toBe(false);
    });

    it('alternates turns in two-player mode', () => {
        game.addPlayer(playerO);
        game.makeMove(playerX, 0, 0, 0);
        expect(game.getCurrentPlayer()).toBe('O');
    });

    it('detects a win across a row', () => {
        game.addPlayer(playerO);
        game.makeMove(playerX, 0, 0, 0);
        game.makeMove(playerO, 0, 1, 0);
        game.makeMove(playerX, 1, 0, 0);
        game.makeMove(playerO, 1, 1, 0);
        game.makeMove(playerX, 2, 0, 0);
        expect(game.getWinner()).toBe('X');
    });
});
