import { ThreeDTicTacToeGame } from '../../components/ThreeDTicTacToeGame';
import { TicTacToePlayer } from '../../components/TicTacToePlayer';

// --- Proper discriminated type guards ---
type SuccessResult = {
    success: true;
    winner: '' | 'X' | 'O';
    isFinished: boolean;
    state: {
        id: string;
        createdAt: Date;
        players: { id: string; symbol: 'X' | 'O' }[];
        board: any;
        isFinished: boolean;
        winner: '' | 'X' | 'O';
    };
};

type ErrorResult = { success: false; error: string };

function isSuccess(result: any): result is SuccessResult {
    return result && result.success === true;
}

function isError(result: any): result is ErrorResult {
    return result && result.success === false;
}
// ----------------------------------------

describe('Game hierarchy', () => {
    let game: ThreeDTicTacToeGame;
    let playerX: TicTacToePlayer;
    let playerO: TicTacToePlayer;

    beforeEach(() => {
        game = new ThreeDTicTacToeGame('test-game');

        const joinX = game.joinPlayer('p1');
        if (!joinX.success) throw new Error('Failed to join player X');
        playerX = joinX.player!;

        const joinO = game.joinPlayer('p2');
        if (!joinO.success) throw new Error('Failed to join player O');
        playerO = joinO.player!;
    });

    it('starts with empty 3×3×3 board', () => {
        const board = game.getBoard();
        expect(board.length).toBe(3);
        expect(board[0].length).toBe(3);
        expect(board[0][0].length).toBe(3);
        expect(board.flat(2).every(cell => cell === '')).toBe(true);
    });

    it('allows valid moves and alternates turns', () => {
        const move1 = game.makeMove(playerX, { x: 0, y: 0, z: 0 });
        expect(isSuccess(move1)).toBe(true);
        if (isSuccess(move1)) expect(move1.state.board[0][0][0]).toBe('X');

        const move2 = game.makeMove(playerO, { x: 1, y: 0, z: 0 });
        expect(isSuccess(move2)).toBe(true);
        if (isSuccess(move2)) expect(move2.state.board[0][0][1]).toBe('O');
    });

    it('rejects moves on occupied cells', () => {
        const move1 = game.makeMove(playerX, { x: 0, y: 0, z: 0 });
        expect(isSuccess(move1)).toBe(true);

        const move2 = game.makeMove(playerO, { x: 0, y: 0, z: 0 });
        expect(isError(move2)).toBe(true);
        if (isError(move2)) {
            expect(move2.error).toMatch(/occupied/i);
        }
    });

    it('rejects moves out of turn', () => {
        const move1 = game.makeMove(playerX, { x: 0, y: 0, z: 0 });
        expect(isSuccess(move1)).toBe(true);

        const move2 = game.makeMove(playerX, { x: 1, y: 0, z: 0 }); // X again
        expect(isError(move2)).toBe(true);
        if (isError(move2)) {
            expect(move2.error).toMatch(/turn/i);
        }
    });

    it('detects a win across a row', () => {
        // X: (0,0,0)
        game.makeMove(playerX, { x: 0, y: 0, z: 0 });
        // O: (0,1,0)
        game.makeMove(playerO, { x: 0, y: 1, z: 0 });
        // X: (1,0,0)
        game.makeMove(playerX, { x: 1, y: 0, z: 0 });
        // O: (1,1,0)
        game.makeMove(playerO, { x: 1, y: 1, z: 0 });
        // X: (2,0,0) → win!
        const move5 = game.makeMove(playerX, { x: 2, y: 0, z: 0 });

        expect(isSuccess(move5)).toBe(true);
        if (isSuccess(move5)) {
            expect(move5.winner).toBe('X');
            expect(move5.state.isFinished).toBe(true);
        }
    });
});
