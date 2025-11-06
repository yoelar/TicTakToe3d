import { createGame, joinGame, leaveGame, makeMove } from '../../components/GameStore';

describe('GameStore Leave/Rejoin Scenarios', () => {
    it('1️⃣ solo → second joins → continue playing', () => {
        const g = createGame('A');
        const j = joinGame(g.gameId, 'B');
        expect(j.success).toBe(true);
        expect(j.player).toBe('O');

        let move1 = makeMove(g.gameId, 'A', { x: 0, y: 0, z: 0 });
        expect(move1.success).toBe(true);
        let move2 = makeMove(g.gameId, 'B', { x: 1, y: 0, z: 0 });
        expect(move2.success).toBe(true);
    });

    it('2️⃣ player2 leaves → player1 continues solo', () => {
        const g = createGame('A');
        joinGame(g.gameId, 'B');
        leaveGame(g.gameId, 'B');
        const move1 = makeMove(g.gameId, 'A', { x: 0, y: 0, z: 0 });
        const move2 = makeMove(g.gameId, 'A', { x: 1, y: 1, z: 1 });
        expect(move1.success && move2.success).toBe(true);
    });

    it('3️⃣ player1 leaves → player2 continues solo', () => {
        const g = createGame('A');
        joinGame(g.gameId, 'B');
        leaveGame(g.gameId, 'A');
        const move1 = makeMove(g.gameId, 'B', { x: 0, y: 0, z: 0 });
        const move2 = makeMove(g.gameId, 'B', { x: 1, y: 1, z: 1 });
        expect(move1.success && move2.success).toBe(true);
    });

    it('4️⃣ player leaves → new joins → game continues', () => {
        const g = createGame('A');
        joinGame(g.gameId, 'B');
        leaveGame(g.gameId, 'A');
        const rejoin = joinGame(g.gameId, 'C');
        expect(rejoin.success).toBe(true);
        const move1 = makeMove(g.gameId, 'C', { x: 0, y: 0, z: 0 });
        const move2 = makeMove(g.gameId, 'B', { x: 1, y: 0, z: 0 });
        expect(move1.success && move2.success).toBe(true);
    });

    it('5️⃣ both players leave → others can join', () => {
        const g = createGame('A');
        joinGame(g.gameId, 'B');
        leaveGame(g.gameId, 'A');
        leaveGame(g.gameId, 'B');
        const j1 = joinGame(g.gameId, 'C');
        const j2 = joinGame(g.gameId, 'D');
        expect(j1.success && j2.success).toBe(true);
    });
});
