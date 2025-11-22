// frontend/src/tests/hooks/useGamePolling.debug.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useGamePolling } from '../../hooks/useGamePolling';
import { IGameApiService } from '../../services/GameApiService';

describe('useGamePolling - Real Timer Debug', () => {
    let mockApiService: jest.Mocked<IGameApiService>;
    let mockOnStateUpdate: jest.Mock;
    let callCount = 0;

    beforeEach(() => {
        callCount = 0;
        mockOnStateUpdate = jest.fn();
        mockApiService = {
            createGame: jest.fn(),
            joinGame: jest.fn(),
            leaveGame: jest.fn(),
            makeMove: jest.fn(),
            getGameState: jest.fn().mockImplementation(async () => {
                callCount++;
                console.log(`Poll #${callCount} at ${Date.now()}`);
                return {
                    id: 'game-123',
                    board: [],
                    currentPlayer: 'X'
                };
            }),
        };
    });

    it('should actually poll with REAL timers', async () => {
        console.log('Test started at', Date.now());

        renderHook(() =>
            useGamePolling(mockApiService, 'game-123', mockOnStateUpdate, 1000)
        );

        // Wait for initial call
        await waitFor(() => {
            expect(callCount).toBeGreaterThanOrEqual(1);
        }, { timeout: 2000 });

        console.log('After initial call:', callCount);

        // Wait for second poll (should happen ~1s later)
        await waitFor(() => {
            expect(callCount).toBeGreaterThanOrEqual(2);
        }, { timeout: 2000 });

        console.log('After second poll:', callCount);

        // Wait for third poll
        await waitFor(() => {
            expect(callCount).toBeGreaterThanOrEqual(3);
        }, { timeout: 2000 });

        console.log('After third poll:', callCount);

        // CRITICAL: At least 3 polls should have happened
        expect(callCount).toBeGreaterThanOrEqual(3);
    }, 10000);
});