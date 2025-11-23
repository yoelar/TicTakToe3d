// frontend/src/tests/hooks/useGamePolling.bug.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useGamePolling } from '../../hooks/useGamePolling';
import { IGameApiService } from '../../services/GameApiService';
describe('useGamePolling - isMountedRef Bug', () => {
    let mockApiService: jest.Mocked<IGameApiService>;
    let callCount = 0;

    beforeEach(() => {
        callCount = 0;
        mockApiService = {
            createGame: jest.fn(),
            joinGame: jest.fn(),
            leaveGame: jest.fn(),
            makeMove: jest.fn(),
            getGameState: jest.fn().mockImplementation(async () => {
                callCount++;
                return { id: 'game-123', board: [], currentPlayer: 'X' };
            }),
        };
    });

    it('BUG TEST: should poll when gameId changes from null to value', async () => {
        console.log('\n=== BUG TEST: gameId transition ===');

        const { rerender } = renderHook(  // ✅ Remove waitFor from destructuring
            ({ gameId }) => useGamePolling(mockApiService, gameId, jest.fn(), 1000),
            { initialProps: { gameId: null } }
        );

        console.log('[Test] Initial render with gameId=null');
        expect(callCount).toBe(0);

        // Change gameId from null to actual value (simulates joining a game)
        console.log('[Test] Changing gameId to "game-123" (simulates join)');
        rerender({ gameId: 'game-123' });

        // Should poll immediately
        await waitFor(() => {  // ✅ Use imported waitFor
            console.log(`[Test] Call count: ${callCount}`);
            expect(callCount).toBeGreaterThanOrEqual(1);
        }, { timeout: 2000 });

        console.log('[Test] ✅ Polling started after gameId changed from null');
        console.log('=================================\n');
    });
});