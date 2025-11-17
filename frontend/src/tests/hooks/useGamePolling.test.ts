// frontend/src/tests/hooks/useGamePolling.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useGamePolling } from '../../hooks/useGamePolling';
import { IGameApiService } from '../../services/GameApiService';
import { GameState } from '../../../../Shared/types';

describe('useGamePolling', () => {
    let mockApiService: jest.Mocked<IGameApiService>;
    let mockOnStateUpdate: jest.Mock;

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
        jest.useFakeTimers();
        mockOnStateUpdate = jest.fn();
        mockApiService = {
            createGame: jest.fn(),
            joinGame: jest.fn(),
            leaveGame: jest.fn(),
            makeMove: jest.fn(),
            getGameState: jest.fn().mockResolvedValue(mockGameState),
        };
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('should not poll when gameId is null', () => {
        renderHook(() =>
            useGamePolling(mockApiService, null, mockOnStateUpdate, 1000)
        );

        expect(mockApiService.getGameState).not.toHaveBeenCalled();
    });

    it('should fetch game state immediately on mount', async () => {
        renderHook(() =>
            useGamePolling(mockApiService, 'game-123', mockOnStateUpdate, 1000)
        );

        await waitFor(() => {
            expect(mockApiService.getGameState).toHaveBeenCalledWith('game-123');
            expect(mockApiService.getGameState).toHaveBeenCalledTimes(1);
        });
    });

    it('should call onStateUpdate with fetched state', async () => {
        renderHook(() =>
            useGamePolling(mockApiService, 'game-123', mockOnStateUpdate, 1000)
        );

        await waitFor(() => {
            expect(mockOnStateUpdate).toHaveBeenCalledWith(mockGameState);
        });
    });

    it('should poll at specified interval', async () => {
        renderHook(() =>
            useGamePolling(mockApiService, 'game-123', mockOnStateUpdate, 1000)
        );

        // Wait for initial fetch
        await waitFor(() => {
            expect(mockApiService.getGameState).toHaveBeenCalledTimes(1);
        });

        // Advance time by 1 second
        jest.advanceTimersByTime(1000);

        await waitFor(() => {
            expect(mockApiService.getGameState).toHaveBeenCalledTimes(2);
        });

        // Advance another second
        jest.advanceTimersByTime(1000);

        await waitFor(() => {
            expect(mockApiService.getGameState).toHaveBeenCalledTimes(3);
        });
    });

    it('should stop polling on unmount', async () => {
        const { unmount } = renderHook(() =>
            useGamePolling(mockApiService, 'game-123', mockOnStateUpdate, 1000)
        );

        await waitFor(() => {
            expect(mockApiService.getGameState).toHaveBeenCalledTimes(1);
        });

        unmount();

        // Clear previous calls
        mockApiService.getGameState.mockClear();

        // Advance time - should not trigger more calls
        jest.advanceTimersByTime(5000);

        expect(mockApiService.getGameState).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        mockApiService.getGameState.mockRejectedValueOnce(new Error('Network error'));

        renderHook(() =>
            useGamePolling(mockApiService, 'game-123', mockOnStateUpdate, 1000)
        );

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        expect(mockOnStateUpdate).not.toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });

    it('should continue polling after an error', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        // First call fails, second succeeds
        mockApiService.getGameState
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValueOnce(mockGameState);

        renderHook(() =>
            useGamePolling(mockApiService, 'game-123', mockOnStateUpdate, 1000)
        );

        // Wait for first (failed) call
        await waitFor(() => {
            expect(mockApiService.getGameState).toHaveBeenCalledTimes(1);
        });

        // Advance timer to trigger second call
        jest.advanceTimersByTime(1000);

        // Second call should succeed
        await waitFor(() => {
            expect(mockApiService.getGameState).toHaveBeenCalledTimes(2);
            expect(mockOnStateUpdate).toHaveBeenCalledWith(mockGameState);
        });

        consoleErrorSpy.mockRestore();
    });

    it('should restart polling when gameId changes', async () => {
        const { rerender } = renderHook(
            ({ gameId }) => useGamePolling(mockApiService, gameId, mockOnStateUpdate, 1000),
            { initialProps: { gameId: 'game-123' } }
        );

        await waitFor(() => {
            expect(mockApiService.getGameState).toHaveBeenCalledWith('game-123');
        });

        mockApiService.getGameState.mockClear();

        // Change gameId
        rerender({ gameId: 'game-456' });

        await waitFor(() => {
            expect(mockApiService.getGameState).toHaveBeenCalledWith('game-456');
        });
    });

    it('should stop polling when gameId becomes null', async () => {
        const { rerender } = renderHook(
            ({ gameId }) => useGamePolling(mockApiService, gameId, mockOnStateUpdate, 1000),
            { initialProps: { gameId: 'game-123' } }
        );

        await waitFor(() => {
            expect(mockApiService.getGameState).toHaveBeenCalledTimes(1);
        });

        mockApiService.getGameState.mockClear();

        // Set gameId to null
        rerender({ gameId: null });

        jest.advanceTimersByTime(5000);

        expect(mockApiService.getGameState).not.toHaveBeenCalled();
    });

    it('should use custom interval when provided', async () => {
        renderHook(() =>
            useGamePolling(mockApiService, 'game-123', mockOnStateUpdate, 500) // 500ms interval
        );

        await waitFor(() => {
            expect(mockApiService.getGameState).toHaveBeenCalledTimes(1);
        });

        jest.advanceTimersByTime(500);

        await waitFor(() => {
            expect(mockApiService.getGameState).toHaveBeenCalledTimes(2);
        });

        jest.advanceTimersByTime(500);

        await waitFor(() => {
            expect(mockApiService.getGameState).toHaveBeenCalledTimes(3);
        });
    });

    it('should use default interval of 2000ms when not specified', async () => {
        renderHook(() =>
            useGamePolling(mockApiService, 'game-123', mockOnStateUpdate) // No interval specified
        );

        await waitFor(() => {
            expect(mockApiService.getGameState).toHaveBeenCalledTimes(1);
        });

        // Advance by less than default interval
        jest.advanceTimersByTime(1000);
        expect(mockApiService.getGameState).toHaveBeenCalledTimes(1);

        // Advance to reach default interval (2000ms total)
        jest.advanceTimersByTime(1000);

        await waitFor(() => {
            expect(mockApiService.getGameState).toHaveBeenCalledTimes(2);
        });
    });
});