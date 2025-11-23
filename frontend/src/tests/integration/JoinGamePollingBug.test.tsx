// frontend/src/tests/integration/JoinGamePollingBug.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameController } from '../../components/GameController';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('JOIN GAME Polling Bug', () => {
    let pollCount = 0;
    let gameBoard: string[][][];

    beforeEach(() => {
        pollCount = 0;
        gameBoard = Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () =>
                Array.from({ length: 3 }, () => '')
            )
        );
        localStorage.clear();

        server.use(
            http.post('*/api/game/:gameId/join', ({ params, request }) => {
                const url = new URL(request.url);
                const clientId = url.searchParams.get('clientId');

                console.log(`[Mock] Join game ${params.gameId} for client ${clientId}`);

                return HttpResponse.json({
                    success: true,
                    player: 'O',
                    state: {
                        id: params.gameId,
                        board: gameBoard,
                        currentPlayer: 'X',
                        players: [
                            { id: 'player-1', symbol: 'X' },
                            { id: clientId, symbol: 'O' }
                        ],
                        isFinished: false,
                        winner: ''
                    }
                });
            }),

            http.get('*/api/game/:gameId/state', ({ params }) => {
                pollCount++;
                console.log(`[Mock] POLL #${pollCount} for game ${params.gameId}`);

                return HttpResponse.json({
                    id: params.gameId,
                    board: gameBoard,
                    currentPlayer: 'X',
                    players: [
                        { id: 'player-1', symbol: 'X' },
                        { id: 'player-2', symbol: 'O' }
                    ],
                    isFinished: false,
                    winner: ''
                });
            })
        );
    });

    afterEach(() => {
        server.resetHandlers();
    });

    it('CRITICAL BUG: Polling should start after JOINING a game', async () => {
        console.log('\n========== BUG TEST: Join Game Polling ==========');

        localStorage.setItem('clientId', 'player-2');

        render(<GameController />);

        // Player joins existing game
        const gameIdInput = screen.getByPlaceholderText(/enter game id/i);
        const joinBtn = screen.getByRole('button', { name: /join/i });

        console.log('[Test] Entering game ID and clicking join...');
        fireEvent.change(gameIdInput, { target: { value: 'game-existing-123' } });
        fireEvent.click(joinBtn);

        // Wait for board to render
        await waitFor(() => {
            const cells = screen.queryAllByLabelText(/cell/i);
            expect(cells.length).toBe(27);
        }, { timeout: 5000 });

        console.log('[Test] ✅ Board rendered');
        console.log(`[Test] Initial poll count: ${pollCount}`);

        // Wait for at least one polling interval (2 seconds)
        console.log('[Test] Waiting 3 seconds for polling to occur...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log(`[Test] Final poll count: ${pollCount}`);
        console.log(`[Test] Expected: At least 2 polls (initial + 1 interval)`);
        console.log(`[Test] Actual: ${pollCount} polls`);

        // CRITICAL ASSERTION: Polling should have occurred at least twice
        // Once on mount, and at least once more after 2 seconds
        if (pollCount < 2) {
            console.log('\n❌ BUG CONFIRMED: Polling is NOT running after joining game!');
            console.log('This means gameId is not being set properly in useGamePolling');
        } else {
            console.log('\n✅ Polling is working correctly');
        }

        console.log('========================================\n');

        expect(pollCount).toBeGreaterThanOrEqual(2);
    }, 10000);

    it('DIAGNOSIS: Check what gameId is passed to useGamePolling after join', async () => {
        console.log('\n========== DIAGNOSIS: gameId Tracking ==========');

        // Track what gameId is being used
        let capturedGameId: string | null = null;

        // Intercept the polling call to see what gameId it has
        server.use(
            http.get('*/api/game/:gameId/state', ({ params }) => {
                capturedGameId = params.gameId as string;
                pollCount++;
                console.log(`[Mock] Poll received for gameId: "${capturedGameId}"`);

                return HttpResponse.json({
                    id: params.gameId,
                    board: gameBoard,
                    currentPlayer: 'X',
                    players: [],
                    isFinished: false,
                    winner: ''
                });
            })
        );

        localStorage.setItem('clientId', 'player-2');

        render(<GameController />);

        const gameIdInput = screen.getByPlaceholderText(/enter game id/i);
        const joinBtn = screen.getByRole('button', { name: /join/i });

        fireEvent.change(gameIdInput, { target: { value: 'my-test-game-id' } });
        fireEvent.click(joinBtn);

        await waitFor(() => {
            expect(screen.queryAllByLabelText(/cell/i).length).toBe(27);
        }, { timeout: 5000 });

        console.log('[Test] Board rendered, waiting for poll...');

        // Give it time to poll
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log(`[Test] Captured gameId from poll: "${capturedGameId}"`);
        console.log(`[Test] Expected gameId: "my-test-game-id"`);
        console.log(`[Test] Poll count: ${pollCount}`);

        if (!capturedGameId) {
            console.log('\n❌ BUG: No polls occurred! gameId is null or undefined in useGamePolling');
        } else if (capturedGameId !== 'my-test-game-id') {
            console.log(`\n❌ BUG: Wrong gameId! Expected "my-test-game-id" but got "${capturedGameId}"`);
        } else {
            console.log('\n✅ Correct gameId is being used');
        }

        console.log('========================================\n');

        expect(pollCount).toBeGreaterThanOrEqual(1);
        expect(capturedGameId).toBe('my-test-game-id');
    }, 10000);
});