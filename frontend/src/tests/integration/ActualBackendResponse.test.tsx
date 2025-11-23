// frontend/src/tests/integration/ActualBackendResponse.test.tsx
import { GameApiService } from '../../services/GameApiService';
import { server } from '../../mocks/server';

describe('Actual Backend Response Structure', () => {
    beforeEach(() => {
        // Disable MSW for this test to hit real backend
        server.close();
    });

    afterAll(() => {
        // Re-enable MSW for other tests
        server.listen();
    });

    it('should log actual backend response structure', async () => {
        const apiService = new GameApiService('http://localhost:4000/api');

        try {
            // Create a game
            console.log('[Test] Creating game...');
            const createResult = await apiService.createGame('test-client-' + Date.now());
            console.log('[Real Backend] Create game response:');
            console.log(JSON.stringify(createResult, null, 2));

            // Get state
            console.log('\n[Test] Getting game state for:', createResult.gameId);
            const state = await apiService.getGameState(createResult.gameId);
            console.log('[Real Backend] Get state response:');
            console.log(JSON.stringify(state, null, 2));

        } catch (err: any) {
            console.error('[Real Backend] Error:', err.message);
            console.error('[Real Backend] Full error:', err);
            console.log('\nMake sure backend is running: cd backend && npm start');
        }
    });
});