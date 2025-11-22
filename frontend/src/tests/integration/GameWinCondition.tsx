// frontend/src/tests/integration/GameWinCondition.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameController } from '../../components/GameController';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('Game Win Condition', () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('clientId', 'player-1');
    });

    afterEach(() => {
        server.resetHandlers();
    });

    it('should disable all cells when game is won', async () => {
        const winningBoard = Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () =>
                Array.from({ length: 3 }, () => '')
            )
        );

        // Create winning condition: X wins with first row of first layer
        winningBoard[0][0][0] = 'X';
        winningBoard[0][0][1] = 'X';
        winningBoard[0][0][2] = 'X';

        server.use(
            http.post('*/api/game', () => {
                return HttpResponse.json({
                    gameId: 'game-123',
                    state: {
                        id: 'game-123',
                        board: winningBoard,
                        currentPlayer: 'O',
                        players: [
                            { id: 'player-1', symbol: 'X' },
                            { id: 'player-2', symbol: 'O' }
                        ],
                        isFinished: true,
                        winner: 'X'
                    }
                });
            }),

            http.get('*/api/game/:gameId/state', () => {
                return HttpResponse.json({
                    id: 'game-123',
                    board: winningBoard,
                    currentPlayer: 'O',
                    players: [
                        { id: 'player-1', symbol: 'X' },
                        { id: 'player-2', symbol: 'O' }
                    ],
                    isFinished: true,
                    winner: 'X'
                });
            })
        );

        render(<GameController />);

        const createBtn = await screen.findByTestId('create-game-btn');
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(screen.getAllByLabelText(/cell/i).length).toBe(27);
        });

        // CRITICAL TEST: All cells should be disabled when game is finished
        const cells = screen.getAllByLabelText(/cell/i);
        cells.forEach(cell => {
            expect(cell).toBeDisabled();
        });
    });

    it('should display winner message when game is won', async () => {
        const winningBoard = Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () =>
                Array.from({ length: 3 }, () => '')
            )
        );

        winningBoard[0][0][0] = 'O';
        winningBoard[0][0][1] = 'O';
        winningBoard[0][0][2] = 'O';

        server.use(
            http.post('*/api/game', () => {
                return HttpResponse.json({
                    gameId: 'game-123',
                    state: {
                        id: 'game-123',
                        board: winningBoard,
                        currentPlayer: 'X',
                        players: [
                            { id: 'player-1', symbol: 'X' },
                            { id: 'player-2', symbol: 'O' }
                        ],
                        isFinished: true,
                        winner: 'O'
                    }
                });
            }),

            http.get('*/api/game/:gameId/state', () => {
                return HttpResponse.json({
                    id: 'game-123',
                    board: winningBoard,
                    currentPlayer: 'X',
                    players: [
                        { id: 'player-1', symbol: 'X' },
                        { id: 'player-2', symbol: 'O' }
                    ],
                    isFinished: true,
                    winner: 'O'
                });
            })
        );

        render(<GameController />);

        const createBtn = await screen.findByTestId('create-game-btn');
        fireEvent.click(createBtn);

        // CRITICAL TEST: Winner message should be displayed
        await waitFor(() => {
            expect(screen.getByText(/winner|won|game over/i)).toBeInTheDocument();
        });
    });

    it('should not allow moves after game is won', async () => {
        const winningBoard = Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () =>
                Array.from({ length: 3 }, () => '')
            )
        );

        winningBoard[0][0][0] = 'X';
        winningBoard[0][0][1] = 'X';
        winningBoard[0][0][2] = 'X';

        let moveAttempted = false;

        server.use(
            http.post('*/api/game', () => {
                return HttpResponse.json({
                    gameId: 'game-123',
                    state: {
                        id: 'game-123',
                        board: winningBoard,
                        currentPlayer: 'O',
                        players: [
                            { id: 'player-1', symbol: 'X' },
                            { id: 'player-2', symbol: 'O' }
                        ],
                        isFinished: true,
                        winner: 'X'
                    }
                });
            }),

            http.get('*/api/game/:gameId/state', () => {
                return HttpResponse.json({
                    id: 'game-123',
                    board: winningBoard,
                    currentPlayer: 'O',
                    players: [
                        { id: 'player-1', symbol: 'X' },
                        { id: 'player-2', symbol: 'O' }
                    ],
                    isFinished: true,
                    winner: 'X'
                });
            }),

            http.post('*/api/game/:gameId/move', () => {
                moveAttempted = true;
                return new HttpResponse(null, { status: 400 });
            })
        );

        render(<GameController />);

        const createBtn = await screen.findByTestId('create-game-btn');
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(screen.getAllByLabelText(/cell/i).length).toBe(27);
        });

        // Try to click a cell
        const cells = screen.getAllByLabelText(/cell/i);
        const emptyCell = cells.find(cell => cell.textContent === '');

        if (emptyCell && !emptyCell.hasAttribute('disabled')) {
            fireEvent.click(emptyCell);
        }

        // Wait a bit to see if move was attempted
        await new Promise(resolve => setTimeout(resolve, 100));

        // CRITICAL TEST: Move should not be sent to backend when game is finished
        expect(moveAttempted).toBe(false);
    });
});