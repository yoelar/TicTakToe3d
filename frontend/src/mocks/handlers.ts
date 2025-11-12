import { http } from 'msw';
import { createEmptyBoard, createMockGameState, jsonResponse } from './mockGameUtils';

export const handlers = [
    // 🎮 CREATE GAME
    http.post('*/api/game', async ({ request }) => {
        const url = new URL(request.url);
        const clientId = url.searchParams.get('clientId') || 'mock-client-A';
        const gameId = 'game-123';

        const state = createMockGameState(gameId, [{ id: clientId, symbol: 'X' }], 'X');
        return jsonResponse({ success: true, gameId, player: 'X', state }, 201);
    }),

    // 🎮 JOIN GAME
    http.post('*/api/game/:gameId/join', async ({ params, request }) => {
        const url = new URL(request.url);
        const clientId = url.searchParams.get('clientId') || 'mock-client-B';
        const { gameId } = params;

        const state = createMockGameState(
            gameId as string,
            [
                { id: 'mock-client-A', symbol: 'X' },
                { id: clientId, symbol: 'O' },
            ],
            'O'
        );

        return jsonResponse({ success: true, state });
    }),

    // 🎯 MOVE
    http.post('*/api/game/:gameId/move', async ({ params, request }) => {
        const { gameId } = params;
        const body = await request.json();
        const { x, y, z, player } = body;

        const state = createMockGameState(gameId as string);
        if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
            state.board[z][y][x] = player;
        }
        state.currentPlayer = player === 'X' ? 'O' : 'X';

        return jsonResponse({ success: true, state });
    }),

    // 🔄 RESTART
    http.post('*/api/restart', () =>
        jsonResponse({
            success: true,
            message: 'Board reset',
            state: { board: createEmptyBoard() },
        })
    ),
];
