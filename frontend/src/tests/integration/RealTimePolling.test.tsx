// frontend/src/tests/integration/RealTimePolling.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameController } from '../../components/GameController';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('Real-Time Polling Between Players', () => {
    let gameBoard: string[][][];
    let currentPlayer: 'X' | 'O';
    let stateUpdateCount = 0;

    beforeEach(() => {
        // ✅ DON'T use fake timers - we need real timers for this test
        stateUpdateCount = 0;
        currentPlayer = 'X';
        gameBoard = Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () =>
                Array.from({ length: 3 }, () => '')
            )
        );
        localStorage.clear();

        server.use(
            http.post('*/api/game', ({ request }) => {
                const url = new URL(request.url);
                const clientId = url.searchParams.get('clientId');

                return HttpResponse.json({
                    gameId: 'game-123',
                    state: {
                        id: 'game-123',
                        board: gameBoard,
                        currentPlayer: 'X',
                        players: [
                            { id: clientId, symbol: 'X' }
                        ],
                        isFinished: false,
                        winner: null
                    }
                });
            }),

            http.post('*/api/game/:gameId/join', ({ request }) => {
                const url = new URL(request.url);
                const clientId = url.searchParams.get('clientId');

                return HttpResponse.json({
                    state: {
                        id: 'game-123',
                        board: gameBoard,
                        currentPlayer: 'X',
                        players: [
                            { id: 'player-1', symbol: 'X' },
                            { id: clientId, symbol: 'O' }
                        ],
                        isFinished: false,
                        winner: null
                    }
                });
            }),

            http.get('*/api/game/:gameId/state', () => {
                stateUpdateCount++;

                return HttpResponse.json({
                    id: 'game-123',
                    board: gameBoard,
                    currentPlayer,
                    players: [
                        { id: 'player-1', symbol: 'X' },
                        { id: 'player-2', symbol: 'O' }
                    ],
                    isFinished: false,
                    winner: null
                });
            }),

            http.post('*/api/game/:gameId/move', async ({ request }) => {
                const body = await request.json() as any;

                // Update the board
                gameBoard[body.z][body.y][body.x] = body.player;
                currentPlayer = body.player === 'X' ? 'O' : 'X';

                return HttpResponse.json({
                    state: {
                        id: 'game-123',
                        board: gameBoard,
                        currentPlayer,
                        players: [
                            { id: 'player-1', symbol: 'X' },
                            { id: 'player-2', symbol: 'O' }
                        ],
                        isFinished: false,
                        winner: null
                    }
                });
            })
        );
    });

    afterEach(() => {
        server.resetHandlers();
    });

    it('should detect opponent move through polling with REAL timers', async () => {
        localStorage.setItem('clientId', 'player-2');

        // Render Player 2's board
        render(<GameController />);

        // Player 2 joins the game
        const gameIdInput = screen.getByPlaceholderText(/enter game id/i);
        const joinBtn = screen.getByRole('button', { name: /join/i });

        fireEvent.change(gameIdInput, { target: { value: 'game-123' } });
        fireEvent.click(joinBtn);

        // Wait for board to render
        await waitFor(() => {
            expect(screen.getAllByLabelText(/cell/i).length).toBe(27);
        }, { timeout: 5000 });

        const initialCells = screen.getAllByLabelText(/cell-empty/i);

        // Verify initial state - all cells empty
        expect(initialCells[0]).toHaveTextContent('');

        // Reset state update count after initial load
        const initialCount = stateUpdateCount;

        // Simulate Player 1 (opponent) making a move on backend
        gameBoard[0][0][0] = 'X';
        currentPlayer = 'O';

        // CRITICAL TEST: Wait for polling to detect the change (max 3 seconds)
        // Polling interval is 2s, so should detect within 2-3 seconds
        await waitFor(() => {
            const updatedCells = screen.queryAllByLabelText(/cell-X/i);
            expect(updatedCells.length).toBeGreaterThan(0);
        }, { timeout: 4000 });

        // Verify the specific cell was updated
        const cells = screen.getAllByLabelText(/cell/i);
        expect(cells[0]).toHaveTextContent('X');

        // Verify polling actually happened
        expect(stateUpdateCount).toBeGreaterThan(initialCount);
    }, 10000); // Increase test timeout to 10s

    it('should continuously poll and update board without user action', async () => {
        localStorage.setItem('clientId', 'player-2');

        render(<GameController />);

        const gameIdInput = screen.getByPlaceholderText(/enter game id/i);
        const joinBtn = screen.getByRole('button', { name: /join/i });

        fireEvent.change(gameIdInput, { target: { value: 'game-123' } });
        fireEvent.click(joinBtn);

        await waitFor(() => {
            expect(screen.getAllByLabelText(/cell/i).length).toBe(27);
        }, { timeout: 5000 });

        // Track initial poll count
        const initialPollCount = stateUpdateCount;

        // Simulate opponent making first move
        gameBoard[0][0][0] = 'X';

        // Wait for first detection
        await waitFor(() => {
            const cells = screen.getAllByLabelText(/cell/i);
            expect(cells[0]).toHaveTextContent('X');
        }, { timeout: 4000 });

        // Simulate opponent making second move
        gameBoard[0][0][1] = 'X';

        // Wait for second detection
        await waitFor(() => {
            const cells = screen.getAllByLabelText(/cell/i);
            expect(cells[1]).toHaveTextContent('X');
        }, { timeout: 4000 });

        // CRITICAL TEST: Multiple polls should have occurred
        expect(stateUpdateCount).toBeGreaterThan(initialPollCount + 1);
    }, 15000);

    it('should show current player indicator updates from polling', async () => {
        localStorage.setItem('clientId', 'player-2');

        render(<GameController />);

        const gameIdInput = screen.getByPlaceholderText(/enter game id/i);
        const joinBtn = screen.getByRole('button', { name: /join/i });

        fireEvent.change(gameIdInput, { target: { value: 'game-123' } });
        fireEvent.click(joinBtn);

        await waitFor(() => {
            expect(screen.getAllByLabelText(/cell/i).length).toBe(27);
        }, { timeout: 5000 });

        // Initial turn indicator
        await waitFor(() => {
            expect(screen.getByText(/next.*X/i)).toBeInTheDocument();
        });

        // Simulate opponent (X) making a move
        gameBoard[0][0][0] = 'X';
        currentPlayer = 'O';

        // CRITICAL TEST: Turn indicator should update via polling
        await waitFor(() => {
            expect(screen.getByText(/next.*O/i)).toBeInTheDocument();
        }, { timeout: 4000 });
    }, 10000);
});