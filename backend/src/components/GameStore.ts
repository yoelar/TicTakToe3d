import { ThreeDTicTacToeGame } from './ThreeDTicTacToeGame';
import { TicTacToePlayer } from './TicTacToePlayer';
import { toDTO } from '../utils/convert';
import {
    CreateGameResponse,
    JoinGameResponse,
    MoveResponse,
    LeaveGameResponse
} from 'tictactoe3d-shared';

export const games: Record<string, ThreeDTicTacToeGame> = {};

/** Create a new 3D Tic Tac Toe game with the first player */
export function createGame(clientId: string): CreateGameResponse {
    const gameId = `game-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const game = new ThreeDTicTacToeGame(gameId);
    games[gameId] = game;

    const joinRes = game.joinPlayer(clientId);
    if (!joinRes.success || !joinRes.player) {
        return { success: false, error: 'Failed to create or join game' };
    }

    return {
        success: true,
        gameId,
        player: joinRes.player.symbol,
        state: toDTO(game.serialize()),
    };
}

/** Player joins an existing game */
export function joinGame(gameId: string, clientId: string): JoinGameResponse {
    const game = games[gameId];
    if (!game) {
        return { success: false, error: 'Game not found' };
    }

    const result = game.joinPlayer(clientId);
    if (!result.success || !result.player) {
        return { success: false, error: result.error || 'Failed to join game' };
    }

    return {
        success: true,
        player: result.player.symbol,
        state: toDTO(game.serialize()),
    };
}

/** Player makes a move in a game */
export function makeMove(
    gameId: string,
    clientId: string,
    moveData: { x: number; y: number; z?: number }
): MoveResponse {
    const game = games[gameId];
    if (!game) {
        return { success: false, error: 'Game not found' };
    }

    const player = game.getPlayers().find(p => p.id === clientId);
    if (!player) {
        return { success: false, error: 'Player not in game' };
    }

    const result = game.makeMove(player, moveData);

    if (!result.success) {
        return { success: false, error: result.error || 'Invalid move' };
    }

    // Always use the live game state, not a stale or partial one
    const currentState = game.serialize();

    return {
        success: true,
        winner: result.winner ?? currentState.winner ?? '',
        isFinished: result.isFinished ?? currentState.isFinished ?? false,
        state: toDTO(currentState),
    };
}

/** Player leaves an existing game */
export function leaveGame(gameId: string, clientId: string): LeaveGameResponse {
    const game = games[gameId];
    if (!game) {
        return { success: false, error: 'Game not found' };
    }

    const player = game.getPlayers().find(p => p.id === clientId);
    if (!player) {
        return { success: false, error: 'Player not found' };
    }

    const result = game.removePlayer(player.id);

    if (!result.success) {
        return { success: false, error: result.error || 'Failed to remove player' };
    }

    return {
        success: true,
        remaining: game.getPlayers().map(p => ({ id: p.id, symbol: p.symbol })),
        state: toDTO(game.serialize()),
    };
}
