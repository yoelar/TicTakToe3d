import { ThreeDTicTacToeGame } from '../../components/ThreeDTicTacToeGame';
import { TicTacToePlayer } from '../../components/TicTacToePlayer';

describe('TicTacToe move validation', () => {
    let game: ThreeDTicTacToeGame;
    let playerX: TicTacToePlayer;

    beforeEach(() => {
        game = new ThreeDTicTacToeGame('testgame');
        playerX = new TicTacToePlayer('p1', 'X');
        game.addPlayer(playerX);
    });

    it('should accept valid move data', () => {
        const move = { x: 0, y: 0, z: 0 };
        const result = game.makeMove(playerX, move);
        expect(result.success).toBe(true);
    });

    it('should reject move data missing coordinates', () => {
        const badMove = { y: 0, z: 0 } as any;
        const result = game.makeMove(playerX, badMove);
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/invalid move data/i);
    });

    it('should reject move data with wrong types', () => {
        const badMove = { x: 'a', y: 1, z: 2 } as any;
        const result = game.makeMove(playerX, badMove);
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/invalid move data/i);
    });

    it('should reject missing z coordinate in 3D games', () => {
        const badMove = { x: 0, y: 0 } as any;
        const result = game.makeMove(playerX, badMove);
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/missing z coordinate/i);
    });

    it('should reject out-of-range coordinates', () => {
        const move = { x: 5, y: 5, z: 5 };
        const result = game.makeMove(playerX, move);
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/invalid coordinates/i);
    });

    it('should reject move if cell is already occupied', () => {
        game.makeMove(playerX, { x: 1, y: 1, z: 1 });
        const result = game.makeMove(playerX, { x: 1, y: 1, z: 1 });
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/cell already occupied/i);
    });

    it('should alternate sign automatically in solo mode', () => {
        const move1 = game.makeMove(playerX, { x: 0, y: 0, z: 0 });
        expect(move1.success).toBe(true);
        const move2 = game.makeMove(playerX, { x: 1, y: 1, z: 1 });
        expect(move2.success).toBe(true);

        const board = game.getBoard();
        expect(board[0][0][0]).toBe('X');
        expect(board[1][1][1]).toBe('O');
    });
});
