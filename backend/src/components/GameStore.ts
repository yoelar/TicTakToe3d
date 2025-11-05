import { ThreeDTicTacToeGame } from './ThreeDTicTacToeGame';
import { TicTacToePlayer } from './TicTacToePlayer';

export const games: Record<string, ThreeDTicTacToeGame> = {};
export const playersByGame: Record<string, TicTacToePlayer[]> = {};

/**
 * Creates a new 3D TicTacToe game for the given clientId.
 */
export function createGame(clientId: string) {
    return {
        gameId: 'not-implemented',
        player: 'X',
        playerId: clientId,
        success: false,
        error: 'Not implemented yet',
    };
}

/**
 * Allows another client to join an existing game.
 */
export function joinGame(gameId: string, clientId: string) {
    return {
        success: false,
        error: 'Not implemented yet',
        player: 'O',
        playerId: clientId,
    };
}

/**
 * Handles a move request from a player.
 */
export function makeMove(
    gameId: string,
    clientId: string,
    moveData: { x: number; y: number; z: number },
    sign: 'X' | 'O'
) {
    return {
        success: false,
        error: 'Not implemented yet',
        state: null,
    };
}
