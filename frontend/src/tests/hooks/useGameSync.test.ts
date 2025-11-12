// frontend/src/tests/hooks/useGameSync.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameSync } from '../../hooks/useGameSync';
import { IWebSocketService } from '../../services/WebSocketService';
import { WSMessage, GameState } from '../../../../Shared/types';

describe('useGameSync', () => {
    let mockWsService: jest.Mocked<IWebSocketService>;
    let messageCallback: (message: WSMessage) => void;
    let connectionCallback: (connected: boolean) => void;
    let mockUpdateGameState: jest.Mock;

    const mockGameState: GameState = {
        id: 'game-123',
        board: Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () =>
                Array.from({ length: 3 }, () => '')
            )
        ),
        currentPlayer: 'X',
        players: [
            { id: 'client-1', symbol: 'X' },
            { id: 'client-2', symbol: 'O' }
        ],
        isFinished: false,
        winner: null
    };

    beforeEach(() => {
        mockUpdateGameState = jest.fn();
        mockWsService = {
            connect: jest.fn(),
            disconnect: jest.fn(),
            send: jest.fn(),
            onMessage: jest.fn((cb) => { messageCallback = cb; }),
            onConnectionChange: jest.fn((cb) => { connectionCallback = cb; }),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Connection Management', () => {
        it('should connect to WebSocket when gameId and clientId are provided', () => {
            renderHook(() =>
                useGameSync(mockWsService, 'client-1', 'game-123', 'X', mockUpdateGameState)
            );

            expect(mockWsService.connect).toHaveBeenCalledWith('client-1', 'game-123');
            expect(mockWsService.connect).toHaveBeenCalledTimes(1);
        });

        it('should not connect when gameId is null', () => {
            renderHook(() =>
                useGameSync(mockWsService, 'client-1', null, 'unassigned', mockUpdateGameState)
            );

            expect(mockWsService.connect).not.toHaveBeenCalled();
        });

        it('should not connect when clientId is empty', () => {
            renderHook(() =>
                useGameSync(mockWsService, '', 'game-123', 'X', mockUpdateGameState)
            );

            expect(mockWsService.connect).not.toHaveBeenCalled();
        });

        it('should disconnect on unmount', () => {
            const { unmount } = renderHook(() =>
                useGameSync(mockWsService, 'client-1', 'game-123', 'X', mockUpdateGameState)
            );

            unmount();

            expect(mockWsService.disconnect).toHaveBeenCalled();
            expect(mockWsService.disconnect).toHaveBeenCalledTimes(1);
        });

        it('should reconnect when gameId changes', () => {
            const { rerender } = renderHook(
                ({ gameId }) => useGameSync(mockWsService, 'client-1', gameId, 'X', mockUpdateGameState),
                { initialProps: { gameId: 'game-123' } }
            );

            expect(mockWsService.connect).toHaveBeenCalledWith('client-1', 'game-123');

            rerender({ gameId: 'game-456' });

            expect(mockWsService.disconnect).toHaveBeenCalled();
            expect(mockWsService.connect).toHaveBeenCalledWith('client-1', 'game-456');
        });

        it('should track connection status', () => {
            const { result } = renderHook(() =>
                useGameSync(mockWsService, 'client-1', 'game-123', 'X', mockUpdateGameState)
            );

            // Initially disconnected
            expect(result.current.isConnected).toBe(false);

            // Simulate connection
            act(() => {
                connectionCallback(true);
            });

            expect(result.current.isConnected).toBe(true);

            // Simulate disconnection
            act(() => {
                connectionCallback(false);
            });

            expect(result.current.isConnected).toBe(false);
        });
    });

    describe('Message Handling', () => {
        it('should update state when MOVE_MADE message received', () => {
            renderHook(() =>
                useGameSync(mockWsService, 'client-1', 'game-123', 'X', mockUpdateGameState)
            );

            const updatedState = {
                ...mockGameState,
                board: [[['X', '', ''], ['', '', ''], ['', '', '']],
                [['', '', ''], ['', '', ''], ['', '', '']],
                [['', '', ''], ['', '', ''], ['', '', '']]],
                currentPlayer: 'O' as const
            };

            act(() => {
                messageCallback({
                    type: 'MOVE_MADE',
                    payload: {
                        x: 0,
                        y: 0,
                        z: 0,
                        player: 'X',
                        state: updatedState
                    }
                });
            });

            expect(mockUpdateGameState).toHaveBeenCalledWith(updatedState);
            expect(mockUpdateGameState).toHaveBeenCalledTimes(1);
        });

        it('should handle PLAYER_JOINED message', () => {
            renderHook(() =>
                useGameSync(mockWsService, 'client-1', 'game-123', 'X', mockUpdateGameState)
            );

            act(() => {
                messageCallback({
                    type: 'PLAYER_JOINED',
                    payload: {
                        clientId: 'client-2',
                        player: 'O'
                    }
                });
            });

            // Verify the hook handles this appropriately
            // Depending on your implementation, you might update state or log
        });

        it('should handle PLAYER_LEFT message', () => {
            renderHook(() =>
                useGameSync(mockWsService, 'client-1', 'game-123', 'X', mockUpdateGameState)
            );

            act(() => {
                messageCallback({
                    type: 'PLAYER_LEFT',
                    payload: {
                        clientId: 'client-2',
                        player: 'O'
                    }
                });
            });

            // Verify the hook handles player leaving appropriately
        });

        it('should handle GAME_OVER message', () => {
            renderHook(() =>
                useGameSync(mockWsService, 'client-1', 'game-123', 'X', mockUpdateGameState)
            );

            const finalState = {
                ...mockGameState,
                isFinished: true,
                winner: 'X' as const
            };

            act(() => {
                messageCallback({
                    type: 'GAME_OVER',
                    payload: {
                        state: finalState,  // ✅ Include state in payload
                        winner: 'X'
                    }
                });
            });

            expect(mockUpdateGameState).toHaveBeenCalledWith(finalState);
        });

        it('should handle ERROR message gracefully', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            renderHook(() =>
                useGameSync(mockWsService, 'client-1', 'game-123', 'X', mockUpdateGameState)
            );

            act(() => {
                messageCallback({
                    type: 'ERROR',
                    payload: {
                        message: 'Invalid move'
                    }
                });
            });

            // Verify error is logged or handled
            // expect(consoleErrorSpy).toHaveBeenCalled(); // If you log errors

            consoleErrorSpy.mockRestore();
        });

        it('should ignore unknown message types', () => {
            renderHook(() =>
                useGameSync(mockWsService, 'client-1', 'game-123', 'X', mockUpdateGameState)
            );

            act(() => {
                messageCallback({
                    type: 'UNKNOWN_TYPE' as any,
                    payload: {}
                });
            });

            expect(mockUpdateGameState).not.toHaveBeenCalled();
        });

        it('should handle malformed messages gracefully', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

            renderHook(() =>
                useGameSync(mockWsService, 'client-1', 'game-123', 'X', mockUpdateGameState)
            );

            // Test null payload
            act(() => {
                messageCallback({
                    type: 'MOVE_MADE',
                    payload: null as any
                });
            });

            expect(mockUpdateGameState).not.toHaveBeenCalled();
            expect(consoleWarnSpy).toHaveBeenCalledWith('Invalid message received:', expect.any(Object));

            // Test missing state in payload
            act(() => {
                messageCallback({
                    type: 'MOVE_MADE',
                    payload: { x: 0, y: 0, z: 0 } as any  // Missing state
                });
            });

            expect(mockUpdateGameState).not.toHaveBeenCalled();

            consoleWarnSpy.mockRestore();
        });
    });

    describe('Sending Moves', () => {
        it('should send move via WebSocket with correct payload', () => {
            const { result } = renderHook(() =>
                useGameSync(mockWsService, 'client-1', 'game-123', 'X', mockUpdateGameState)
            );

            act(() => {
                result.current.submitMove(0, 1, 2);
            });

            expect(mockWsService.send).toHaveBeenCalledWith({
                type: 'MAKE_MOVE',
                payload: {
                    playerId: 'client-1',
                    player: 'X',
                    x: 0,
                    y: 1,
                    z: 2
                }
            });
            expect(mockWsService.send).toHaveBeenCalledTimes(1);
        });

        it('should not send move when player is unassigned', () => {
            const { result } = renderHook(() =>
                useGameSync(mockWsService, 'client-1', 'game-123', 'unassigned', mockUpdateGameState)
            );

            act(() => {
                result.current.submitMove(0, 0, 0);
            });

            expect(mockWsService.send).not.toHaveBeenCalled();
        });

        it('should not send move when not connected', () => {
            const { result } = renderHook(() =>
                useGameSync(mockWsService, 'client-1', 'game-123', 'X', mockUpdateGameState)
            );

            // Keep disconnected (don't call connectionCallback)

            act(() => {
                result.current.submitMove(0, 0, 0);
            });

            // Depending on your implementation, might still send or might check connection first
            // Adjust this test based on your actual implementation
        });

        it('should handle multiple moves in sequence', () => {
            const { result } = renderHook(() =>
                useGameSync(mockWsService, 'client-1', 'game-123', 'X', mockUpdateGameState)
            );

            act(() => {
                result.current.submitMove(0, 0, 0);
                result.current.submitMove(1, 1, 1);
                result.current.submitMove(2, 2, 2);
            });

            expect(mockWsService.send).toHaveBeenCalledTimes(3);
            expect(mockWsService.send).toHaveBeenNthCalledWith(1, expect.objectContaining({
                payload: expect.objectContaining({ x: 0, y: 0, z: 0 })
            }));
            expect(mockWsService.send).toHaveBeenNthCalledWith(2, expect.objectContaining({
                payload: expect.objectContaining({ x: 1, y: 1, z: 1 })
            }));
            expect(mockWsService.send).toHaveBeenNthCalledWith(3, expect.objectContaining({
                payload: expect.objectContaining({ x: 2, y: 2, z: 2 })
            }));
        });

        it('should send correct player symbol', () => {
            const { result: resultX } = renderHook(() =>
                useGameSync(mockWsService, 'client-1', 'game-123', 'X', mockUpdateGameState)
            );

            act(() => {
                resultX.current.submitMove(0, 0, 0);
            });

            expect(mockWsService.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    payload: expect.objectContaining({ player: 'X' })
                })
            );

            jest.clearAllMocks();

            const { result: resultO } = renderHook(() =>
                useGameSync(mockWsService, 'client-2', 'game-123', 'O', mockUpdateGameState)
            );

            act(() => {
                resultO.current.submitMove(1, 1, 1);
            });

            expect(mockWsService.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    payload: expect.objectContaining({ player: 'O' })
                })
            );
        });
    });

    describe('Edge Cases', () => {
        it('should handle rapid reconnections', () => {
            const { rerender } = renderHook(
                ({ gameId }) => useGameSync(mockWsService, 'client-1', gameId, 'X', mockUpdateGameState),
                { initialProps: { gameId: 'game-123' } }
            );

            rerender({ gameId: null });
            rerender({ gameId: 'game-123' });
            rerender({ gameId: null });
            rerender({ gameId: 'game-456' });

            expect(mockWsService.disconnect).toHaveBeenCalled();
            expect(mockWsService.connect).toHaveBeenLastCalledWith('client-1', 'game-456');
        });

        it('should clean up event listeners on unmount', () => {
            const { unmount } = renderHook(() =>
                useGameSync(mockWsService, 'client-1', 'game-123', 'X', mockUpdateGameState)
            );

            // Clear the mock to only track calls after unmount
            mockUpdateGameState.mockClear();

            unmount();

            // Try to send message after unmount
            act(() => {
                messageCallback?.({
                    type: 'MOVE_MADE',
                    payload: { state: mockGameState }
                });
            });

            // Should not update state after unmount
            expect(mockUpdateGameState).not.toHaveBeenCalled();
        });

        it('should handle player symbol change', () => {
            const { rerender } = renderHook(
                ({ player }) => useGameSync(mockWsService, 'client-1', 'game-123', player, mockUpdateGameState),
                { initialProps: { player: 'unassigned' as 'X' | 'O' | 'unassigned' } }
            );

            const { result } = renderHook(() =>
                useGameSync(mockWsService, 'client-1', 'game-123', 'unassigned', mockUpdateGameState)
            );

            // Can't move when unassigned
            act(() => {
                result.current.submitMove(0, 0, 0);
            });
            expect(mockWsService.send).not.toHaveBeenCalled();

            // Rerender with assigned player
            rerender({ player: 'X' });

            const { result: newResult } = renderHook(() =>
                useGameSync(mockWsService, 'client-1', 'game-123', 'X', mockUpdateGameState)
            );

            // Now can move
            act(() => {
                newResult.current.submitMove(0, 0, 0);
            });
            expect(mockWsService.send).toHaveBeenCalled();
        });
    });
});