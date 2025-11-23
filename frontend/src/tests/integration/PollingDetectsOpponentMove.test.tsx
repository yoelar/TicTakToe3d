// frontend/src/tests/integration/PollingDetectsOpponentMove.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameController } from '../../components/GameController';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('Polling Detects Opponent Move (Real Structure)', () => {
    let gameBoard: string[][][];
    let pollCount = 0;

    beforeEach(() => {
        pollCount = 0;
        gameBoard = Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () =>
                Array.from({ length: 3 }, () => '')
            )
        );
        localStorage.clear();
        localStorage.setItem('clientId', 'player-2');

        server.use(
            // Join game - returns wrapped state
            http.post('*/api/game/:gameId/join', ({ params }) => {
                console.log('[Mock] Join game');
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

            // ✅ Get state - returns state DIRECTLY (not wrapped) - MATCHES BACKEND
            http.get('*/api/game/:gameId/state', ({ params }) => {
                pollCount++;
                console.log(`[Mock] Poll #${pollCount} - Board[0][0][0]="${gameBoard[0][0][0]}"`);

                // Return state directly, like real backend
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

    it('CRITICAL: should show opponent move on board after polling', async () => {
        console.log('\n========== TEST START ==========');

        render(<GameController />);

        // Join game
        const gameIdInput = screen.getByPlaceholderText(/enter game id/i);
        const joinBtn = screen.getByRole('button', { name: /join/i });

        fireEvent.change(gameIdInput, { target: { value: 'game-123' } });
        fireEvent.click(joinBtn);

        // Wait for board
        await waitFor(() => {
            const cells = screen.queryAllByLabelText(/cell/i);
            expect(cells.length).toBe(27);
        }, { timeout: 5000 });

        console.log('[Test] Board rendered');

        // Verify cell is initially empty
        let cells = screen.getAllByLabelText(/cell/i);
        console.log(`[Test] Initial cell[0] content: "${cells[0].textContent}"`);
        expect(cells[0].textContent).toBe('');

        const pollCountBefore = pollCount;
        console.log(`[Test] Poll count before opponent move: ${pollCountBefore}`);

        // ========== OPPONENT MAKES MOVE ==========
        console.log('[Test] >>> OPPONENT MOVES: Setting board[0][0][0] = "X"');
        gameBoard[0][0][0] = 'X';

        // Wait up to 4 seconds for polling to detect change
        console.log('[Test] Waiting for polling to detect change...');

        let detected = false;
        const startTime = Date.now();

        try {
            await waitFor(() => {
                cells = screen.getAllByLabelText(/cell/i);
                const cellContent = cells[0].textContent;

                if (!detected && cellContent === 'X') {
                    detected = true;
                    const detectionTime = Date.now() - startTime;
                    console.log(`[Test] ✅ DETECTED! Cell updated after ${detectionTime}ms`);
                    console.log(`[Test] Total polls: ${pollCount}`);
                }

                expect(cellContent).toBe('X');
            }, {
                timeout: 5000,
                interval: 100
            });

            console.log('[Test] ✅ TEST PASSED');
            console.log(`[Test] Final poll count: ${pollCount}`);
            console.log('========== TEST END ==========\n');

        } catch (error) {
            console.log('[Test] ❌ TEST FAILED');
            console.log(`[Test] Cell content after timeout: "${cells[0].textContent}"`);
            console.log(`[Test] Expected: "X", Actual: "${cells[0].textContent}"`);
            console.log(`[Test] Poll count: ${pollCount} (before: ${pollCountBefore})`);
            console.log(`[Test] Polls occurred: ${pollCount > pollCountBefore ? 'YES' : 'NO'}`);
            console.log('========== TEST END ==========\n');
            throw error;
        }

        // Verify polling occurred
        expect(pollCount).toBeGreaterThan(pollCountBefore);
    }, 10000);
});