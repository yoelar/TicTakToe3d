import { createGame, joinGame, makeMove } from '../../../src/components/GameStore';
import { games } from '../../../src/components/GameStore';
import { TicTacToePlayer } from '../../../src/components/TicTacToePlayer';

describe('GameStore leave and rejoin scenarios', () => {

    beforeEach(() => {
        for (const key in games) delete games[key];
    });

    it('1️⃣ Solo → join → continue play', () => {
        const g1 = createGame('p1');
        makeMove(g1.gameId, 'p1', { x: 0, y: 0, z: 0 });

        const joinRes = joinGame(g1.gameId, 'p2');
        expect(joinRes.success).toBe(true);
        expect(joinRes.player).toBe('O');

        const move2 = makeMove(g1.gameId, 'p2', { x: 1, y: 0, z: 0 });
        expect(move2.success).toBe(true);
        expect(move2.state.board[1][0][0]).toBe('O');
    });

    it('2️⃣ Two players → player2 leaves → player1 continues solo', () => {
        const g1 = createGame('p1');
        joinGame(g1.gameId, 'p2');
        makeMove(g1.gameId, 'p1', { x: 0, y: 0, z: 0 });

        // simulate player2 leaving
        const game = games[g1.gameId];
        const p2 = game.getPlayers().find(p => p.id === 'p2')!;
        game.removePlayer(p2);

        // p1 can continue solo
        const move2 = makeMove(g1.gameId, 'p1', { x: 1, y: 1, z: 1 });
        expect(move2.success).toBe(true);
        expect(move2.state.board[1][1][1]).toBe('O'); // alternates automatically in solo mode
    });

    it('3️⃣ Player1 leaves → player2 continues solo', () => {
        const g1 = createGame('p1');
        joinGame(g1.gameId, 'p2');
        makeMove(g1.gameId, 'p1', { x: 0, y: 0, z: 0 });

        const game = games[g1.gameId];
        const p1 = game.getPlayers().find(p => p.id === 'p1')!;
        game.removePlayer(p1);

        const move = makeMove(g1.gameId, 'p2', { x: 1, y: 1, z: 1 });
        expect(move.success).toBe(true);
        expect(move.state.board[1][1][1]).toBe('O');
    });

    it('4️⃣ One leaves, third joins → game continues', () => {
        const g1 = createGame('p1');
        joinGame(g1.gameId, 'p2');

        // player1 leaves
        const game = games[g1.gameId];
        const p1 = game.getPlayers().find(p => p.id === 'p1')!;
        game.removePlayer(p1);

        // player3 joins — should get X
        const join3 = joinGame(g1.gameId, 'p3');
        expect(join3.success).toBe(true);
        expect(join3.player).toBe('X');

        const move = makeMove(g1.gameId, 'p3', { x: 0, y: 0, z: 0 });
        expect(move.success).toBe(true);
    });

    it('5️⃣ Both leave, later others can join', () => {
        const g1 = createGame('p1');
        joinGame(g1.gameId, 'p2');
        const game = games[g1.gameId];

        const p1 = game.getPlayers().find(p => p.id === 'p1')!;
        const p2 = game.getPlayers().find(p => p.id === 'p2')!;
        game.removePlayer(p1);
        game.removePlayer(p2);

        const join3 = joinGame(g1.gameId, 'p3');
        expect(join3.success).toBe(true);
        expect(join3.player).toBe('X');
    });
});
