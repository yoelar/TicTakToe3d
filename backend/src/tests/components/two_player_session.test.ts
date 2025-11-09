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

    // 🧩 NEW TESTS BELOW

    it('should assign X to a new player if only O remains', () => {
        const p1 = session.addPlayer('p1').player!;
        const p2 = session.addPlayer('p2').player!;
        expect(p1.symbol).toBe('X');
        expect(p2.symbol).toBe('O');

        session.removePlayer('p1'); // remove X

        const join3 = session.addPlayer('p3');
        expect(join3.success).toBe(true);
        expect(join3.player?.symbol).toBe('X');
        expect(session.getPlayers().map(p => p.symbol).sort()).toEqual(['O', 'X']);
    });

    it('should assign O to a new player if only X remains', () => {
        const p1 = session.addPlayer('p1').player!;
        const p2 = session.addPlayer('p2').player!;
        session.removePlayer('p2'); // remove O

        const join3 = session.addPlayer('p3');
        expect(join3.success).toBe(true);
        expect(join3.player?.symbol).toBe('O');
        expect(session.getPlayers().map(p => p.symbol).sort()).toEqual(['O', 'X']);
    });

    it('should reset to X for first player if both leave', () => {
        const p1 = session.addPlayer('p1').player!;
        const p2 = session.addPlayer('p2').player!;
        session.removePlayer('p1');
        session.removePlayer('p2');

        expect(session.getPlayers().length).toBe(0);

        const join3 = session.addPlayer('p3');
        expect(join3.player?.symbol).toBe('X');
    });

    it('should not break if trying to remove nonexistent player', () => {
        session.addPlayer('p1');
        const res = session.removePlayer('ghost');
        expect(res.success).toBe(false);
        expect(res.error).toMatch(/not found/i);
    });

    it('should maintain current turn after rejoin', () => {
        session.addPlayer('p1');
        session.addPlayer('p2');
        session.toggleTurn(); // now O's turn
        const before = session.getCurrentTurn();

        session.addPlayer('p2'); // rejoin existing player
        const after = session.getCurrentTurn();

        expect(after).toBe(before);
    });
    it('should serialize to JSON with correct player IDs and symbols', () => {
        const session = new TwoPlayerSession();
        session.addPlayer('alice'); // X
        session.addPlayer('bob');   // O

        const json = session.toJSON();

        // Basic shape check
        expect(Array.isArray(json)).toBe(true);
        expect(json.length).toBe(2);

        // Each entry should have id + symbol
        expect(json[0]).toHaveProperty('id', 'alice');
        expect(json[0]).toHaveProperty('symbol', 'X');
        expect(json[1]).toHaveProperty('id', 'bob');
        expect(json[1]).toHaveProperty('symbol', 'O');

        // Defensive: ensure modifying the returned array does not affect internal state
        json.pop();
        expect(session.getPlayers().length).toBe(2);
    });
    it('should allow adding new players after both removed', () => {
        session.addPlayer('p1');
        session.addPlayer('p2');
        session.removePlayer('p1');
        session.removePlayer('p2');

        const r1 = session.addPlayer('p3');
        const r2 = session.addPlayer('p4');

        expect(r1.success).toBe(true);
        expect(r1.player?.symbol).toBe('X');
        expect(r2.success).toBe(true);
        expect(r2.player?.symbol).toBe('O');
        expect(session.getPlayers().length).toBe(2);
    });
    it('should not duplicate player when re-adding existing one', () => {
        const firstAdd = session.addPlayer('p1');
        const secondAdd = session.addPlayer('p1');

        expect(secondAdd.success).toBe(true);
        expect(session.getPlayers().length).toBe(1);
        expect(session.getPlayers()[0].id).toBe('p1');
        expect(session.getPlayers()[0].symbol).toBe(firstAdd.player?.symbol);
    });

});
