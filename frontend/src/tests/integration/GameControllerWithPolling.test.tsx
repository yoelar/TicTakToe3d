// frontend/src/tests/integration/GameControllerWithPolling.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameController } from '../../components/GameController';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('GameController with Polling', () => {
    let pollCount = 0;
    let currentBoard: string[][][] = Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () => '')
        )
    );

    beforeEach(() => {
        jest.useFakeTimers();
        pollCount = 0;
        currentBoard = Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () =>
                Array.from({ length: 3 }, () => '')
            )
        );
        localStorage.clear();
        localStorage.setItem('clientId', 'test-client-1');

        server.use(
            http.post('*/api/game', () => {
                return HttpResponse.json({
                    gameId: 'game-123',
                    state: {
                        id: 'game-123',
                        board: currentBoard,
                        currentPlayer: 'X',
                        players: [{ id: 'test-client-1', symbol: 'X' }]
                    }
                });
            }),

            http.get('*/api/game/:gameId/state', () => {
                pollCount++;
                return HttpResponse.json({
                    id: 'game-123',
                    board: currentBoard,
                    currentPlayer: 'X',
                    players: [
                        { id: 'test-client-1', symbol: 'X' },
                        { id: 'test-client-2', symbol: 'O' }
                    ],
                    isFinished: false,
                    winner: null
                });
            }),

            http.post('*/api/game/:gameId/move', async ({ request }) => {
                const body = await request.json() as any;
                currentBoard[body.z][body.y][body.x] = body.player;

                return HttpResponse.json({
                    state: {
                        id: 'game-123',
                        board: currentBoard,
                        currentPlayer: body.player === 'X' ? 'O' : 'X',
                        players: [
                            { id: 'test-client-1', symbol: 'X' },
                            { id: 'test-client-2', symbol: 'O' }
                        ],
                        isFinished: false,
                        winner: null
                    }
                });
            })
        );
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        server.resetHandlers();
    });

    it('should start polling after game creation', async () => {
        render(<GameController />);

        const createBtn = await screen.findByTestId('create-game-btn');
        fireEvent.click(createBtn);

        // Wait for game to be created
        await waitFor(() => {
            expect(screen.queryByTestId('game-id')).toBeInTheDocument();
        });

        // Initial poll should have happened
        expect(pollCount).toBeGreaterThanOrEqual(1);

        // Advance timer by 2 seconds
        jest.advanceTimersByTime(2000);

        // Should have polled again
        await waitFor(() => {
            expect(pollCount).toBeGreaterThanOrEqual(2);
        });
    });

    it('should detect opponent move through polling', async () => {
        render(<GameController />);

        const createBtn = await screen.findByTestId('create-game-btn');
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(screen.getAllByLabelText(/cell/i).length).toBe(27);
        });

        const cells = screen.getAllByLabelText(/cell/i);

        // Initial state - all cells empty
        expect(cells[0]).toHaveTextContent('');

        // Simulate opponent making a move (update server state)
        currentBoard[0][0][0] = 'O';

        // Advance timer to trigger poll
        jest.advanceTimersByTime(2000);

        // Board should update with opponent's move
        await waitFor(() => {
            const updatedCells = screen.getAllByLabelText(/cell/i);
            expect(updatedCells[0]).toHaveTextContent('O');
        });
    });

    it('should stop polling when leaving game', async () => {
        render(<GameController />);

        const createBtn = await screen.findByTestId('create-game-btn');
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(screen.queryByTestId('game-id')).toBeInTheDocument();
        });

        const initialPollCount = pollCount;

        // Leave the game
        const leaveBtn = screen.getByRole('button', { name: /leave/i });
        fireEvent.click(leaveBtn);

        // Advance timer significantly
        jest.advanceTimersByTime(10000);

        // Poll count should not have increased
        expect(pollCount).toBe(initialPollCount);
    });
});