import { createGame, joinGame, makeMove, games, playersByGame } from '../../components/GameStore';

describe('GameStore', () => {
    const clientA = 'clientA';
    const clientB = 'clientB';
    let gameId: string;

    afterEach(() => {
        // cleanup between tests
        for (const key in games) delete games[key];
        for (const key in playersByGame) delete playersByGame[key];
    });

    it('creates a new game and assigns X to the first player', () => {
        const result = createGame(clientA);
        expect(result).toHaveProperty('gameId');
        expect(result.player).toBe('X');
        expect(games[result.gameId]).toBeDefined();
        expect(playersByGame[result.gameId]).toHaveLength(1);
        gameId = result.gameId;
    });

    it('allows a second player to join with opposite sign', () => {
        const g1 = createGame(clientA);
        const join = joinGame(g1.gameId, clientB);
        expect(join.success).toBe(true);
        expect(join.player).toBe('O');
        expect(playersByGame[g1.gameId]).toHaveLength(2);
    });

    it('rejects joining a full game', () => {
        const g1 = createGame(clientA);
        joinGame(g1.gameId, clientB);
        const join3 = joinGame(g1.gameId, 'clientC');
        expect(join3.success).toBe(false);
        expect(join3.error).toMatch(/full/i);
    });

    it('supports moves in solo mode', () => {
        const g1 = createGame(clientA);
        const move1 = makeMove(g1.gameId, clientA, { x: 0, y: 0, z: 0 }, 'X');
        expect(move1.success).toBe(true);
        const move2 = makeMove(g1.gameId, clientA, { x: 1, y: 1, z: 1 }, 'O');
        expect(move2.success).toBe(true);
    });

    it('returns error for move on invalid gameId', () => {
        const move = makeMove('fake-id', clientA, { x: 0, y: 0, z: 0 }, 'X');
        expect(move.success).toBe(false);
        expect(move.error).toMatch(/not found/i);
    });
});
