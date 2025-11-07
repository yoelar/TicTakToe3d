import { createGame, joinGame, makeMove, games } from '../../components/GameStore';

describe('GameStore', () => {
    const clientA = 'clientA';
    const clientB = 'clientB';
    let gameId: string;

    afterEach(() => {
        // cleanup between tests
        for (const key in games) delete games[key];
    });

    it('creates a new game and assigns X to the first player', () => {
        const result = createGame(clientA);
        expect(result).toHaveProperty('gameId');
        expect(result.player).toBe('X');
        expect(games[result.gameId]).toBeDefined();
        gameId = result.gameId;
    });

    it('allows a second player to join with opposite sign', () => {
        const g1 = createGame(clientA);
        const join = joinGame(g1.gameId, clientB);
        expect(join.success).toBe(true);
        expect(join.player).toBe('O');
    });

    it('rejects joining a full game', () => {
        const g1 = createGame(clientA);
        joinGame(g1.gameId, clientB);
        const join3 = joinGame(g1.gameId, 'clientC');
        expect(join3.success).toBe(false);
        expect(join3.error).toMatch(/full/i);
    });

    it('should alternate automatically in solo mode', () => {
        const { gameId } = createGame(clientA);

        const move1 = makeMove(gameId, clientA, { x: 0, y: 0, z: 0 });
        expect(move1.success).toBe(true);

        const move2 = makeMove(gameId, clientA, { x: 1, y: 1, z: 1 });
        expect(move2.success).toBe(true);

        const board = move2.state.board;
        expect(board[0][0][0]).toBe('X');
        expect(board[1][1][1]).toBe('O');
    });

    it('should reject a move if it is not the player’s turn in two-player mode', () => {
        const g1 = createGame('playerX');
        joinGame(g1.gameId, 'playerO');

        // X moves first
        const move1 = makeMove(g1.gameId, 'playerX', { x: 0, y: 0, z: 0 });
        expect(move1.success).toBe(true);

        // X tries again immediately — should fail
        const move2 = makeMove(g1.gameId, 'playerX', { x: 1, y: 0, z: 0 });
        expect(move2.success).toBe(false);
        expect(move2.error).toMatch(/^not .*turn$/i);
    });

});
