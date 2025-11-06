import { TicTacToePlayer } from '../../../src/components/TicTacToePlayer';

describe('TicTacToePlayer', () => {
    it('should create a TicTacToe player with a valid symbol', () => {
        const player = new TicTacToePlayer('p1', 'X');
        expect(player.id).toBe('p1');
        expect(player.symbol).toBe('X');
    });

    it('should throw error for invalid symbol', () => {
        // @ts-expect-error
        expect(() => new TicTacToePlayer('p2', 'Z')).toThrow(/invalid symbol/i);
    });

    it('should correctly determine if it can play based on current turn', () => {
        const xPlayer = new TicTacToePlayer('p1', 'X');
        const oPlayer = new TicTacToePlayer('p2', 'O');

        expect(xPlayer.canPlay('X')).toBe(true);
        expect(xPlayer.canPlay('O')).toBe(false);
        expect(oPlayer.canPlay('O')).toBe(true);
    });

    it('should support connecting and disconnecting (inherited)', () => {
        const player = new TicTacToePlayer('p3', 'O');
        player.connect();
        expect(player.connected).toBe(true);
        player.disconnect();
        expect(player.connected).toBe(false);
    });
});
