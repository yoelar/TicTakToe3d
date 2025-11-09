// backend/src/tests/components/two_player_session.test.ts
import { TwoPlayerSession } from '../../components/session/TwoPlayerSession';

describe('TwoPlayerSession', () => {
    let session: TwoPlayerSession;

    beforeEach(() => {
        session = new TwoPlayerSession();
    });

    it('should add the first player as X', () => {
        const res = session.addPlayer('p1');
        expect(res.success).toBe(true);
        expect(res.player?.symbol).toBe('X');
    });

    it('should add a second player as O', () => {
        session.addPlayer('p1');
        const res = session.addPlayer('p2');
        expect(res.success).toBe(true);
        expect(res.player?.symbol).toBe('O');
    });

    it('should reject a third player', () => {
        session.addPlayer('p1');
        session.addPlayer('p2');
        const res = session.addPlayer('p3');
        expect(res.success).toBe(false);
        expect(res.error).toMatch(/full/i);
    });

    it('should allow rejoining existing player', () => {
        const p1 = session.addPlayer('p1').player!;
        const again = session.addPlayer('p1').player!;
        expect(again).toBe(p1);
        expect(session.getPlayers().length).toBe(1);
    });

    it('should remove players and detect solo mode', () => {
        session.addPlayer('p1');
        session.addPlayer('p2');
        expect(session.isSolo()).toBe(false);

        session.removePlayer('p2');
        expect(session.isSolo()).toBe(true);
    });

    it('should toggle turns between X and O', () => {
        expect(session.getCurrentTurn()).toBe('X');
        session.toggleTurn();
        expect(session.getCurrentTurn()).toBe('O');
        session.toggleTurn();
        expect(session.getCurrentTurn()).toBe('X');
    });

    it('should find players by symbol', () => {
        session.addPlayer('p1');
        session.addPlayer('p2');
        const x = session.findBySymbol('X');
        const o = session.findBySymbol('O');
        expect(x?.symbol).toBe('X');
        expect(o?.symbol).toBe('O');
    });
});
