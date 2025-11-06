import { ThreeDTicTacToeGame } from '../../components/ThreeDTicTacToeGame';
import { TicTacToePlayer } from '../../components/TicTacToePlayer';

describe('TicTacToe move validation', () => {
    let game: ThreeDTicTacToeGame;
    let playerX: TicTacToePlayer;

    beforeEach(() => {
        game = new ThreeDTicTacToeGame('testgame');

        // Use joinPlayer (creates and registers a player automatically)
        const joinResult = game.joinPlayer('p1');
        if (!joinResult.success || !joinResult.player) {
            throw new Error('Failed to join playerX');
        }

        // Get the created player instance from the game
        const players = game.getPlayers();
        playerX = players.find(p => p.id === 'p1')!;
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
        expect(result.error).toMatch(/invalid|coordinate/i);
    });

    it('should reject move data with wrong types', () => {
        const badMove = { x: 'a', y: 1, z: 2 } as any;
        const result = game.makeMove(playerX, badMove);
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/invalid|coordinate/i);
    });

    it('should reject missing z coordinate in 3D games', () => {
        const badMove = { x: 0, y: 0 } as any;
        const result = game.makeMove(playerX, badMove);
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/missing z|invalid/i);
    });

    it('should reject out-of-range coordinates', () => {
        const move = { x: 10, y: 10, z: 10 };
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

    it('should allow only correct player turn', () => {
        // Join a second player (O)
        const joinO = game.joinPlayer('p2');
        const playerO = game.getPlayers().find(p => p.id === 'p2')!;

        // X moves
        const move1 = game.makeMove(playerX, { x: 0, y: 0, z: 0 });
        expect(move1.success).toBe(true);

        // X tries to move again — invalid turn
        const move2 = game.makeMove(playerX, { x: 0, y: 1, z: 0 });
        expect(move2.success).toBe(false);
        expect(move2.error).toMatch(/turn/i);

        // O can move now
        const move3 = game.makeMove(playerO, { x: 1, y: 1, z: 0 });
        expect(move3.success).toBe(true);
    });

    it('should serialize correctly', () => {
        const move = { x: 0, y: 0, z: 0 };
        game.makeMove(playerX, move);

        const state = game.serialize();
        expect(state).toHaveProperty('id', 'testgame');
        expect(state).toHaveProperty('board');
        expect(state).toHaveProperty('players');
        expect(Array.isArray((state as any).players)).toBe(true);
    });
});
