// backend/src/tests/websocket/GameRoom.test.ts
describe('GameRoom', () => {
    it('should add client to room', () => {
        const room = new GameRoom('game-123');
        const ws = createMockWebSocket();

        room.addClient('client-1', ws);

        expect(room.getClientCount()).toBe(1);
    });

    it('should broadcast to all except sender', () => {
        const room = new GameRoom('game-123');
        const ws1 = createMockWebSocket();
        const ws2 = createMockWebSocket();

        room.addClient('client-1', ws1);
        room.addClient('client-2', ws2);

        room.broadcast({ type: 'MOVE_MADE', payload: {} }, 'client-1');

        expect(ws1.send).not.toHaveBeenCalled();
        expect(ws2.send).toHaveBeenCalled();
    });

    it('should notify all clients when player connects', () => {
        const room = new GameRoom('game-123');
        const ws1 = createMockWebSocket();
        const ws2 = createMockWebSocket();

        room.addClient('client-1', ws1);
        room.addClient('client-2', ws2);

        expect(ws1.send).toHaveBeenCalledWith(
            expect.stringContaining('PLAYER_JOINED')
        );
    });
});