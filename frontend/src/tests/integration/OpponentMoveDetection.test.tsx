// frontend/src/tests/integration/OpponentMoveDetection.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { GameController } from '../../components/GameController';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('Opponent Move Detection via Polling', () => {
    let gameBoard: string[][][];
    let pollCount = 0;

    beforeEach(() => {
        jest.useFakeTimers();
        pollCount = 0;
        gameBoard = Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () =>
                Array.from({ length: 3 }, () => '')
            )
        );
        localStorage.clear();
        localStorage.setItem('clientId', 'player-1');

        server.use(
            http.post('*/api/game', () => {
                return HttpResponse.json({
                    gameId: 'game-123',
                    state: {
                        id: 'game-123',
                        board: gameBoard,
                        currentPlayer: 'X',
                        players: [
                            { id: 'player-1', symbol: 'X' },
                            { id: 'player-2', symbol: 'O' }
                        ],
                        isFinished: false,
                        winner: null
                    }
                });
            }),

            http.get('*/api/game/:gameId/state', () => {
                pollCount++;
                return HttpResponse.json({
                    id: 'game-123',
                    board: gameBoard,
                    currentPlayer: gameBoard[0][0][0] ? 'O' : 'X',
                    players: [
                        { id: 'player-1', symbol: 'X' },
                        { id: 'player-2', symbol: 'O' }
                    ],
                    isFinished: false,
                    winner: null
                });
            })
        );
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        server.resetHandlers();
    });

    it('should detect opponent move without player action', async () => {
        render(<GameController />);

        // Create game
        const createBtn = await screen.findByTestId('create-game-btn');
        fireEvent.click(createBtn);

        // Wait for board to render
        await waitFor(() => {
            expect(screen.getAllByLabelText(/cell/i).length).toBe(27);
        });

        const cells = screen.getAllByLabelText(/cell-empty/i);

        // Verify initial state - first cell is empty
        expect(cells[0]).toHaveTextContent('');

        // Simulate opponent making a move (update backend state)
        gameBoard[0][0][0] = 'O';

        // Advance time to trigger polling (2 seconds)
        await act(async () => {
            jest.advanceTimersByTime(2000);
        });

        // CRITICAL TEST: Board should update WITHOUT player clicking anything
        await waitFor(() => {
            const updatedCells = screen.getAllByLabelText(/cell/i);
            const firstCell = updatedCells[0];
            expect(firstCell).toHaveTextContent('O');
        }, { timeout: 1000 });

        // Verify polling actually happened
        expect(pollCount).toBeGreaterThan(1);
    });

    it('should continuously poll and detect multiple opponent moves', async () => {
        render(<GameController />);

        const createBtn = await screen.findByTestId('create-game-btn');
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(screen.getAllByLabelText(/cell/i).length).toBe(27);
        });

        // First opponent move
        gameBoard[0][0][0] = 'O';

        await act(async () => {
            jest.advanceTimersByTime(2000);
        });

        await waitFor(() => {
            const cells = screen.getAllByLabelText(/cell/i);
            expect(cells[0]).toHaveTextContent('O');
        });

        // Second opponent move
        gameBoard[0][0][1] = 'O';

        await act(async () => {
            jest.advanceTimersByTime(2000);
        });

        await waitFor(() => {
            const cells = screen.getAllByLabelText(/cell/i);
            expect(cells[1]).toHaveTextContent('O');
        });

        // Polling should have happened at least 3 times (initial + 2 intervals)
        expect(pollCount).toBeGreaterThanOrEqual(3);
    });
});