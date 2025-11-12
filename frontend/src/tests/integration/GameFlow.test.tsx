import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { http } from 'msw';
import { server } from '../../mocks/server';
import App from '../../App';
import { createMockGameState, jsonResponse } from '../../mocks/mockGameUtils';

const testHandlers = [
    http.post('*/api/game', async () =>
        jsonResponse({
            success: true,
            gameId: 'game-123',
            state: createMockGameState('game-123'),
        })
    ),
    http.post('*/api/game/:gameId/join', async ({ params }) =>
        jsonResponse({
            success: true,
            state: createMockGameState(params.gameId as string),
        })
    ),
    http.post('*/api/game/:gameId/move', async ({ params }) => {
        const state = createMockGameState(params.gameId as string);
        state.board[0][0][0] = 'X';
        state.currentPlayer = 'O';
        return jsonResponse({ success: true, state });
    }),
    http.get('*/api/game/:gameId/state', async ({ params }) =>
        jsonResponse(createMockGameState(params.gameId as string))
    ),
];

describe('Full Game Flow Integration', () => {
    beforeAll(() => server.use(...testHandlers));
    afterEach(() => {
        cleanup();
        localStorage.clear();
    });
    afterAll(() => server.resetHandlers());

    it('allows Player A to create a game and see the board', async () => {
        localStorage.setItem('clientId', 'client-1');
        render(<App />);

        const createBtn = screen.getByTestId('create-game-btn');
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(screen.queryByText(/failed to create/i)).not.toBeInTheDocument();
        });

        await waitFor(() => {
            const gameIdElement = screen.queryByTestId('game-id');
            expect(gameIdElement?.textContent).toContain('game-123');
        });

        const cells = await screen.findAllByLabelText(/cell/i);
        expect(cells.length).toBe(27);
    });

    it('allows Player B to join an existing game', async () => {
        localStorage.setItem('clientId', 'client-2');
        render(<App />);

        fireEvent.change(screen.getByPlaceholderText(/enter game id/i), {
            target: { value: 'game-123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /join game/i }));

        await waitFor(() => {
            expect(screen.queryByText(/failed to join/i)).not.toBeInTheDocument();
        });

        const cells = await screen.findAllByLabelText(/cell/i);
        expect(cells.length).toBe(27);
    });
});
