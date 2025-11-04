import { Player } from '../../../src/components/Player';

describe('Player (abstract base)', () => {
    class TestPlayer extends Player { } // concrete subclass for testing

    it('should create a player with a unique id', () => {
        const player = new TestPlayer('p1');
        expect(player.id).toBe('p1');
    });

    it('should start as disconnected', () => {
        const player = new TestPlayer('p1');
        expect(player.connected).toBe(false);
    });

    it('should allow connecting and disconnecting', () => {
        const player = new TestPlayer('p1');
        player.connect();
        expect(player.connected).toBe(true);

        player.disconnect();
        expect(player.connected).toBe(false);
    });

    it('should consider two players equal if they share the same id', () => {
        const p1 = new TestPlayer('abc');
        const p2 = new TestPlayer('abc');
        const p3 = new TestPlayer('xyz');

        expect(p1.equals(p2)).toBe(true);
        expect(p1.equals(p3)).toBe(false);
    });
});
