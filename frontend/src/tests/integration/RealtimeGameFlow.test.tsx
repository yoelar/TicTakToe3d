// frontend/src/tests/integration/RealtimeGameFlow.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { GameController } from '../../components/GameController';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('Real-time game synchronization', () => {
    beforeEach(() => {
        localStorage.clear();

        // Setup API mocks
        server.use(
            http.post('*/api/game', () => {
                return HttpResponse.json({
                    gameId: 'game-123',
                    state: {
                        id: 'game-123',
                        board: Array.from({ length: 3 }, () =>
                            Array.from({ length: 3 }, () =>
                                Array.from({ length: 3 }, () => '')
                            )
                        ),
                        currentPlayer: 'X'
                    }
                });
            }),
            http.post('*/api/game/:gameId/join', () => {
                return HttpResponse.json({
                    state: {
                        id: 'game-123',
                        board: Array.from({ length: 3 }, () =>
                            Array.from({ length: 3 }, () =>
                                Array.from({ length: 3 }, () => '')
                            )
                        ),
                        currentPlayer: 'X'
                    }
                });
            })
        );
    });

    afterEach(() => {
        server.resetHandlers();
    });

    it('should create game and render board', async () => {
        localStorage.setItem('clientId', 'client-1');

        render(<GameController />);

        const createBtn = await screen.findByTestId('create-game-btn');
        fireEvent.click(createBtn);

        // Wait for board to render
        await waitFor(() => {
            const cells = screen.queryAllByLabelText(/cell/i);
            expect(cells.length).toBe(27);
        }, { timeout: 5000 });
    });

    it('should join game and render board', async () => {
        localStorage.setItem('clientId', 'client-2');

        render(<GameController />);

        const input = screen.getByPlaceholderText(/enter game id/i);
        const joinBtn = screen.getByRole('button', { name: /join/i });

        fireEvent.change(input, { target: { value: 'game-123' } });
        fireEvent.click(joinBtn);

        // Wait for board to render
        await waitFor(() => {
            const cells = screen.queryAllByLabelText(/cell/i);
            expect(cells.length).toBe(27);
        }, { timeout: 5000 });
    });

    // WebSocket-specific tests or test them at the hook level
    // See useGameSync.test.ts for WebSocket functionality tests
});