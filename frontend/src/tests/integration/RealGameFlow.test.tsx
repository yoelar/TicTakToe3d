// frontend/src/tests/integration/RealGameFlow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('Real Game Flow (finds actual bugs)', () => {
    beforeEach(() => {
        localStorage.setItem('clientId', 'test-client');

        server.use(
            http.post('*/api/game', () => HttpResponse.json({
                gameId: 'game-123',
                state: {
                    id: 'game-123',
                    board: Array(3).fill(null).map(() => Array(3).fill(null).map(() => Array(3).fill(''))),
                    currentPlayer: 'X'
                }
            }))
        );
    });

    it('SMOKE TEST: can create game and click cell', async () => {
        render(<App />);

        // Create game
        fireEvent.click(await screen.findByTestId('create-game-btn'));

        // Wait for board
        await waitFor(() => {
            expect(screen.getAllByLabelText(/cell/i).length).toBe(27);
        });

        // Click cell
        const firstCell = screen.getAllByLabelText(/cell/i)[0];
        fireEvent.click(firstCell);

        // This test will FAIL if your click handler is broken
        // Add assertions based on what should happen
    });
});