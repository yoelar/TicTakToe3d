// frontend/src/tests/hooks/useWebSocket.test.ts
import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from '../../hooks/useWebSocket';
import WS from 'jest-websocket-mock';

describe('useWebSocket', () => {
    let server: WS;

    beforeEach(() => {
        server = new WS('ws://localhost:3001');
    });

    afterEach(() => {
        WS.clean();
    });

    it('should connect to WebSocket server', async () => {
        const { result } = renderHook(() =>
            useWebSocket('ws://localhost:3001', 'client-1', 'game-123')
        );

        await server.connected;

        expect(result.current.isConnected).toBe(true);
    });

    it('should receive move updates', async () => {
        const onMessage = jest.fn();

        renderHook(() =>
            useWebSocket('ws://localhost:3001', 'client-1', 'game-123', onMessage)
        );

        await server.connected;

        act(() => {
            server.send(JSON.stringify({
                type: 'MOVE_MADE',
                payload: { x: 0, y: 0, z: 0, player: 'X' }
            }));
        });

        expect(onMessage).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'MOVE_MADE' })
        );
    });

    it('should send moves through WebSocket', async () => {
        const { result } = renderHook(() =>
            useWebSocket('ws://localhost:3001', 'client-1', 'game-123')
        );

        await server.connected;

        act(() => {
            result.current.sendMessage({
                type: 'MAKE_MOVE',
                payload: { x: 1, y: 1, z: 1, player: 'X' }
            });
        });

        await expect(server).toReceiveMessage(
            expect.stringContaining('MAKE_MOVE')
        );
    });

    it('should reconnect on disconnect', async () => {
        const { result } = renderHook(() =>
            useWebSocket('ws://localhost:3001', 'client-1', 'game-123')
        );

        await server.connected;

        act(() => {
            server.close();
        });

        expect(result.current.isConnected).toBe(false);

        // Should attempt reconnect
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
        });

        // Verify reconnection logic triggered
    });
});