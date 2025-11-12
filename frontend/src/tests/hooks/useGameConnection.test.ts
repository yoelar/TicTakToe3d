// frontend/src/tests/hooks/useGameConnection.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameConnection } from '../../hooks/useGameConnection';
import { IGameApiService } from '../../services/GameApiService';

describe('useGameConnection', () => {
    const mockApiService: jest.Mocked<IGameApiService> = {
        createGame: jest.fn(),
        joinGame: jest.fn(),
        leaveGame: jest.fn(),
        makeMove: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a game successfully', async () => {
        mockApiService.createGame.mockResolvedValue({
            gameId: 'game-123',
            state: { id: 'game-123', board: [], currentPlayer: 'X' }
        });

        const { result } = renderHook(() =>
            useGameConnection('client-1', mockApiService)
        );

        await act(async () => {
            await result.current.createGame();
        });

        await waitFor(() => {
            expect(result.current.gameId).toBe('game-123');
            expect(result.current.assignedPlayer).toBe('X');
            expect(result.current.error).toBeNull();
        });
    });

    it('should handle create game error', async () => {
        mockApiService.createGame.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() =>
            useGameConnection('client-1', mockApiService)
        );

        await act(async () => {
            await result.current.createGame();
        });

        await waitFor(() => {
            expect(result.current.error).toBe('Failed to create game');
            expect(result.current.gameId).toBeNull();
        });
    });

    it('should join a game successfully', async () => {
        mockApiService.joinGame.mockResolvedValue({
            state: { id: 'game-456', board: [], currentPlayer: 'X' }
        });

        const { result } = renderHook(() =>
            useGameConnection('client-2', mockApiService)
        );

        await act(async () => {
            await result.current.joinGame('game-456');
        });

        await waitFor(() => {
            expect(result.current.gameId).toBe('game-456');
            expect(result.current.assignedPlayer).toBe('O');
        });
    });

    it('should leave game and reset state', async () => {
        mockApiService.createGame.mockResolvedValue({
            gameId: 'game-123',
            state: { id: 'game-123', board: [], currentPlayer: 'X' }
        });

        const { result } = renderHook(() =>
            useGameConnection('client-1', mockApiService)
        );

        await act(async () => {
            await result.current.createGame();
        });

        await act(async () => {
            await result.current.leaveGame();
        });

        await waitFor(() => {
            expect(result.current.gameId).toBeNull();
            expect(result.current.gameState).toBeNull();
            expect(result.current.assignedPlayer).toBe('unassigned');
        });
    });
});