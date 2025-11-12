// frontend/src/tests/integration/RealtimeGameFlow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WS from 'jest-websocket-mock';
import { GameController } from '../../components/GameController';

describe('Real-time game synchronization', () => {
    let server: WS;

    beforeEach(() => {
        server = new WS('ws://localhost:3001');
        sessionStorage.clear();
    });

    afterEach(() => {
        WS.clean();
    });

    it('should update board when other player makes a move', async () => {
        sessionStorage.setItem('clientId', 'client-2');

        render(<GameController />);

        // Join game
        const input = screen.getByPlaceholderText(/enter game id/i);
        const joinBtn = screen.getByRole('button', { name: /join/i });

        fireEvent.change(input, { target: { value: 'game-123' } });
        fireEvent.click(joinBtn);

        await server.connected;

        // Wait for board to render
        await waitFor(() => {
            expect(screen.getAllByLabelText(/cell/i).length).toBe(27);
        });

        const cells = screen.getAllByLabelText(/cell/i);
        expect(cells[0]).toHaveTextContent('');

        // Simulate receiving move from other player
        act(() => {
            server.send(JSON.stringify({
                type: 'MOVE_MADE',
                payload: {
                    x: 0, y: 0, z: 0,
                    player: 'X',
                    state: {
                        board: [[["X", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]]], 
                        currentPlayer: 'O'
                    }
                }
            }));
        });

        // Verify board updated
        await waitFor(() => {
            expect(cells[0]).toHaveTextContent('X');
        });
    });

    it('should send move through WebSocket instead of REST', async () => {
        sessionStorage.setItem('clientId', 'client-1');

        render(<GameController />);

        const createBtn = screen.getByTestId('create-game-btn');
        fireEvent.click(createBtn);

        await server.connected;

        await waitFor(() => {
            expect(screen.getAllByLabelText(/cell/i).length).toBe(27);
        });

        const cells = screen.getAllByLabelText(/cell/i);
        fireEvent.click(cells[0]);

        // Verify WebSocket message sent
        await expect(server).toReceiveMessage(
            expect.stringContaining('"type":"MAKE_MOVE"')
        );
    });
});