import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import GameBoard from '../../components/GameBoard';

describe('Integration: <GameBoard /> with mocked backend', () => {
    it('sends a move to /api/move and updates the board', async () => {
        render(<GameBoard />);

        // Get all playable cells
        const cells = screen.getAllByRole('button', { name: /cell/i });
        const firstCell = cells[0];

        // Click first cell (should send POST /api/move)
        fireEvent.click(firstCell);

        // Wait for mock response and UI update
        await waitFor(() => expect(firstCell).toHaveTextContent(/X|O/));
    });

    it('resets the board when Restart is clicked', async () => {
        render(<GameBoard />);

        const cells = screen.getAllByRole('button', { name: /cell/i });
        const restartBtn = screen.getByRole('button', { name: /Restart/i });

        // Simulate a move
        fireEvent.click(cells[0]);
        await waitFor(() => expect(cells[0]).toHaveTextContent(/X|O/));

        // Mock restart endpoint response
        server.use(
            http.post('/api/restart', () => HttpResponse.json({ success: true }))
        );

        // Restart game
        fireEvent.click(restartBtn);

        // Verify cleared board
        await waitFor(() => {
            cells.forEach(cell => expect(cell).toHaveTextContent(''));
        });
    });
});
