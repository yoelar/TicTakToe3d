// frontend/src/tests/integration/ButtonToBackend.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameController } from '../../components/GameController';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('Button Click to Backend Integration', () => {
    let apiCallsMade: string[] = [];
    let wsMessagesSent: any[] = [];

    beforeEach(() => {
        apiCallsMade = [];
        wsMessagesSent = [];
        localStorage.clear();
        localStorage.setItem('clientId', 'test-client-1');

        // Track API calls
        server.use(
            http.post('*/api/game', ({ request }) => {
                apiCallsMade.push('POST /api/game');
                return HttpResponse.json({
                    gameId: 'game-123',
                    state: {
                        id: 'game-123',
                        board: Array.from({ length: 3 }, () =>
                            Array.from({ length: 3 }, () =>
                                Array.from({ length: 3 }, () => '')
                            )
                        ),
                        currentPlayer: 'X',
                        players: [{ id: 'test-client-1', symbol: 'X' }]
                    }
                });
            }),

            http.post('*/api/game/:gameId/move', async ({ request, params }) => {
                const body = await request.json() as any;
                apiCallsMade.push(`POST /api/game/${params.gameId}/move`);

                return HttpResponse.json({
                    state: {
                        id: params.gameId,
                        board: Array.from({ length: 3 }, () =>
                            Array.from({ length: 3 }, () =>
                                Array.from({ length: 3 }, () => '')
                            )
                        ),
                        currentPlayer: 'O',
                        players: [
                            { id: 'test-client-1', symbol: 'X' },
                            { id: 'test-client-2', symbol: 'O' }
                        ]
                    }
                });
            })
        );
    });

    it('should call backend API when create game button is clicked', async () => {
        render(<GameController />);

        const createBtn = await screen.findByTestId('create-game-btn');
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(apiCallsMade).toContain('POST /api/game');
        }, { timeout: 3000 });
    });

    it('should render board after successful game creation', async () => {
        render(<GameController />);

        const createBtn = await screen.findByTestId('create-game-btn');
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(screen.queryByTestId('game-id')).toBeInTheDocument();
        }, { timeout: 3000 });

        await waitFor(() => {
            const cells = screen.queryAllByLabelText(/cell/i);
            expect(cells.length).toBe(27);
        }, { timeout: 3000 });
    });

    it('should send WebSocket message when cell is clicked', async () => {
        // Mock WebSocket to track messages
        const mockWsSend = jest.fn();
        jest.spyOn(require('../../services/WebSocketService'), 'WebSocketService')
            .mockImplementation(() => ({
                connect: jest.fn(),
                disconnect: jest.fn(),
                send: mockWsSend,
                onMessage: jest.fn(),
                onConnectionChange: jest.fn(),
            }));

        render(<GameController />);

        // Create game
        const createBtn = await screen.findByTestId('create-game-btn');
        fireEvent.click(createBtn);

        // Wait for board
        await waitFor(() => {
            const cells = screen.queryAllByLabelText(/cell/i);
            expect(cells.length).toBe(27);
        }, { timeout: 3000 });

        // Click a cell
        const cells = screen.getAllByLabelText(/cell/i);
        fireEvent.click(cells[0]);

        // Verify WebSocket message was sent
        await waitFor(() => {
            expect(mockWsSend).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'MAKE_MOVE',
                    payload: expect.objectContaining({
                        player: 'X',
                        x: 0,
                        y: 0,
                        z: 0
                    })
                })
            );
        });
    });

    it('should display error when API call fails', async () => {
        server.use(
            http.post('*/api/game', () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        render(<GameController />);

        const createBtn = await screen.findByTestId('create-game-btn');
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(screen.queryByText(/failed to create game/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});