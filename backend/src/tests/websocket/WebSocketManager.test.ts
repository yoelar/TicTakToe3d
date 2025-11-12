// backend/src/tests/websocket/WebSocketManager.test.ts
describe('WebSocketManager', () => {
    it('should register a new client connection', () => {
        const manager = WebSocketManager.getInstance();
        const mockWs = createMockWebSocket();
        
        manager.registerClient('client-1', 'game-123', mockWs);
        
        expect(manager.getClientCount('game-123')).toBe(1);
    });

    it('should remove client on disconnect', () => {
        const manager = WebSocketManager.getInstance();
        const mockWs = createMockWebSocket();
        
        manager.registerClient('client-1', 'game-123', mockWs);
        manager.unregisterClient('client-1');
        
        expect(manager.getClientCount('game-123')).toBe(0);
    });

    it('should broadcast move to all players in game room', () => {
        const manager = WebSocketManager.getInstance();
        const ws1 = createMockWebSocket();
        const ws2 = createMockWebSocket();
        
        manager.registerClient('client-1', 'game-123', ws1);
        manager.registerClient('client-2', 'game-123', ws2);
        
        manager.broadcastToGame('game-123', {
            type: 'MOVE_MADE',
            payload: { x: 0, y: 0, z: 0, player: 'X' }
        });
        
        expect(ws1.send).toHaveBeenCalled();
        expect(ws2.send).toHaveBeenCalled();
    });
});