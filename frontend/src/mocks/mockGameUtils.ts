// src/mocks/mockGameUtils.ts
import { HttpResponse } from 'msw';

/**
 * Shared helpers for mocking backend TicTacToe game data.
 * Used by both MSW handlers and integration tests.
 */

export const createEmptyBoard = () =>
    Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () => '')
        )
    );

export const createMockGameState = (
    gameId: string,
    players: { id: string; symbol: 'X' | 'O' }[] = [
        { id: 'client-1', symbol: 'X' },
        { id: 'client-2', symbol: 'O' },
    ],
    currentPlayer: 'X' | 'O' = 'X'
) => ({
    id: gameId,
    createdAt: new Date().toISOString(),
    board: createEmptyBoard(),
    players,
    currentPlayer,
    isFinished: false,
    winner: '',
});

/**
 * Convenience JSON response creator for MSW handlers.
 */
export const jsonResponse = <T>(data: T, status = 200) =>
    HttpResponse.json(data, { status });
