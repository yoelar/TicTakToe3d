// frontend/src/tests/integration/RealBackendPolling.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { GameController } from '../../components/GameController';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('Real Backend Structure Polling', () => {
    let gameBoard: string[][][];
    let pollCallCount = 0;
    let lastPollTime = 0;

    beforeEach(() => {
        pollCallCount = 0;
        lastPollTime = Date.now();
        gameBoard = Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () =>
                Array.from({ length: 3 }, () => '')
            )
        );
        localStorage.clear();
        localStorage.setItem('clientId', 'player-2');

        server.use(
            // Simulate EXACT backend response structure
            http.post('*/api/game/:gameId/join', ({ params }) => {
                console.log('[Mock] Join game called');
                return HttpResponse.json({
                    success: true,
                    player: 'O',
                    state: {
                        id: params.gameId,
                        createdAt: new Date().toISOString(),
                        players: [
                            { id: 'player-1', symbol: 'X' },
                            { id: 'player-2', symbol: 'O' }
                        ],
                        board: gameBoard,
                        isFinished: false,
                        winner: '',
                        currentPlayer: 'X'
                    }
                });
            }),

            // This is the critical endpoint that polling uses
            http.get('*/api/game/:gameId/state', ({ params }) => {
                const now = Date.now();
                const timeSinceLastPoll = now - lastPollTime;
                pollCallCount++;
                lastPollTime = now;

                console.log(`[Mock] Poll #${pollCallCount} (${timeSinceLastPoll}ms since last) - Board[0][0][0] = "${gameBoard[0][0][0]}"`);

                // Return EXACT backend response structure
                return HttpResponse.json({
                    id: params.gameId,
                    createdAt: new Date().toISOString(),
                    players: [
                        { id: 'player-1', symbol: 'X' },
                        { id: 'player-2', symbol: 'O' }
                    ],
                    board: gameBoard,
                    isFinished: false,
                    winner: '',
                    currentPlayer: gameBoard[0][0][0] ? 'O' : 'X'
                });
            })
        );
    });

    afterEach(() => {
        server.resetHandlers();
    });

    it('should detect board change through polling (matches real backend)', async () => {
        console.log('\n=== TEST START ===');

        // Player 2 joins existing game
        render(<GameController />);

        const gameIdInput = screen.getByPlaceholderText(/enter game id/i);
        const joinBtn = screen.getByRole('button', { name: /join/i });

        fireEvent.change(gameIdInput, { target: { value: 'game-123' } });
        fireEvent.click(joinBtn);

        // Wait for board to render
        await waitFor(() => {
            expect(screen.getAllByLabelText(/cell/i).length).toBe(27);
        }, { timeout: 5000 });

        console.log('[Test] Board rendered, initial state');

        const initialCells = screen.getAllByLabelText(/cell/i);
        expect(initialCells[0]).toHaveTextContent('');

        console.log('[Test] Verified initial cell is empty');
        console.log(`[Test] Poll count before opponent move: ${pollCallCount}`);

        // Simulate opponent (Player 1) making a move
        console.log('[Test] Simulating opponent move: X at [0][0][0]');
        gameBoard[0][0][0] = 'X';

        // Wait for polling to detect the change
        console.log('[Test] Waiting for polling to detect change...');

        await waitFor(() => {
            const cells = screen.getAllByLabelText(/cell/i);
            const firstCell = cells[0];

            console.log(`[Test] Checking cell content: "${firstCell.textContent}"`);

            expect(firstCell).toHaveTextContent('X');
        }, {
            timeout: 5000,
            interval: 500 // Check every 500ms
        });

        console.log(`[Test] SUCCESS! Cell updated. Total polls: ${pollCallCount}`);
        console.log('=== TEST END ===\n');

        // Verify polling actually occurred multiple times
        expect(pollCallCount).toBeGreaterThan(1);
    }, 10000);

    it('should poll at the expected interval', async () => {
        render(<GameController />);

        const gameIdInput = screen.getByPlaceholderText(/enter game id/i);
        const joinBtn = screen.getByRole('button', { name: /join/i });

        fireEvent.change(gameIdInput, { target: { value: 'game-123' } });
        fireEvent.click(joinBtn);

        await waitFor(() => {
            expect(screen.getAllByLabelText(/cell/i).length).toBe(27);
        }, { timeout: 5000 });

        const initialCount = pollCallCount;
        console.log(`[Test] Initial poll count: ${initialCount}`);

        // Wait for 3 seconds (should get at least 1 more poll at 2s interval)
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log(`[Test] After 3 seconds, poll count: ${pollCallCount}`);

        // CRITICAL: Should have polled at least once more
        expect(pollCallCount).toBeGreaterThan(initialCount);
    }, 10000);
});