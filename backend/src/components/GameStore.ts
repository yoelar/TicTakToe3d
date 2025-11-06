import { ThreeDTicTacToeGame } from './ThreeDTicTacToeGame';
import { TicTacToePlayer } from './TicTacToePlayer';
import { randomUUID } from 'crypto';

// Store all active games
export const games: Record<string, ThreeDTicTacToeGame> = {};

// --- Create a new game ---
export function createGame(clientId: string) {
    const gameId = randomUUID();
    const game = new ThreeDTicTacToeGame(gameId);

    // Player X always starts
    const player = new TicTacToePlayer(clientId, 'X');
    game.addPlayer(player);
    games[gameId] = game;

    return {
        success: true,
        gameId,
        player: 'X' as const,
        playerId: clientId,
    };
}

// --- Join an existing game ---
export function joinGame(gameId: string, clientId: string) {
    const game = games[gameId];
    if (!game) {
        return { success: false, error: 'Game not found' };
    }

    // `joinPlayer` now comes from TicTacToeGame base class
    const result = game.joinPlayer(clientId);
    return result.success
        ? { success: true, player: result.player, playerId: clientId }
        : { success: false, error: result.error };
}

// --- Make a move ---
export function makeMove(gameId: string, clientId: string, moveData: any) {
    const game = games[gameId];
    if (!game) {
        return { success: false, error: 'Game not found' };
    }

    const player = game.getPlayers().find(p => p.id === clientId);
    if (!player) {
        return { success: false, error: 'Invalid playerId' };
    }

    const result = game.makeMove(player, moveData);
    return {
        success: result.success,
        error: result.error,
        state: game.serialize(),
    };
}

// --- Leave a game ---
export function leaveGame(gameId: string, clientId: string) {
    const game = games[gameId];
    if (!game) {
        return { success: false, error: 'Game not found' };
    }

    // `removePlayer` now supports both string and player arguments
    return game.removePlayer(clientId);
}
