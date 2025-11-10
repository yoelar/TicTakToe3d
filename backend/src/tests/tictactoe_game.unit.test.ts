import { ThreeDTicTacToeGame } from '../components/ThreeDTicTacToeGame';
import { TicTacToePlayer } from '../components/TicTacToePlayer';

describe('TicTacToeGame base behavior', () => {
    it('allows adding and removing players via joinPlayer/removePlayer', () => {
        const g = new ThreeDTicTacToeGame('g1');

        const r1 = g.joinPlayer('p1');
        expect(r1.success).toBe(true);
        const r2 = g.joinPlayer('p2');
        expect(r2.success).toBe(true);

        expect(g.getPlayers().length).toBe(2);

        const removed = g.removePlayer('p1');
        expect(removed.success).toBe(true);
        expect(g.getPlayers().length).toBe(1);
        expect(g.getPlayers().length).toBe(1);
    });

    it('joinPlayer assigns symbols and prevents duplicates', () => {
        const g = new ThreeDTicTacToeGame('g2');
        const res1 = g.joinPlayer('a');
        expect(res1.success).toBe(true);
        expect(res1.player).toBeDefined();
        const res2 = g.joinPlayer('b');
        expect(res2.success).toBe(true);
        expect(g.getPlayers().length).toBe(2);
        const res3 = g.joinPlayer('a');
        expect(res3.success).toBe(true); // rejoin returns success with existing player
    });
});

describe('ThreeDTicTacToeGame moves and validation', () => {
    let g: ThreeDTicTacToeGame;
    let p: TicTacToePlayer;

    beforeEach(() => {
        g = new ThreeDTicTacToeGame('g3');
        const join = g.joinPlayer('p1');
        if (!join.success || !join.player) throw new Error('join failed');
        p = join.player;
    });

    it('rejects invalid move data', () => {
        const bad = { y: 0, z: 0 } as any;
        const r = g.makeMove(p, bad);
        expect(r.success).toBe(false);
        expect(r.error).toMatch(/missing|invalid/i);
    });

    it('accepts valid move and alternates in solo', () => {
        const r1 = g.makeMove(p, { x: 0, y: 0, z: 0 });
        expect(r1.success).toBe(true);
        const r2 = g.makeMove(p, { x: 1, y: 1, z: 1 });
        expect(r2.success).toBe(true);
        expect(g.getBoard().toJSON()[0][0][0]).toBe('X');
    });

    it('rejects out of range', () => {
        const r = g.makeMove(p, { x: 5, y: 0, z: 0 } as any);
        expect(r.success).toBe(false);
    });

    it('rejects occupied cell', () => {
        g.makeMove(p, { x: 1, y: 1, z: 1 });
        const r = g.makeMove(p, { x: 1, y: 1, z: 1 });
        expect(r.success).toBe(false);
    });
});
