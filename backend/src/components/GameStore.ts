import { ThreeDTicTacToeGame } from './ThreeDTicTacToeGame';
import { TicTacToePlayer } from './TicTacToePlayer';
import { randomUUID } from 'crypto';

export const games: Record<string, ThreeDTicTacToeGame> = {};
export const playersByGame: Record<string, TicTacToePlayer[]> = {};

/**
 * Creates a new 3D TicTacToe game for the given clientId.
 */
export function createGame(clientId: string) {
    const gameId = randomUUID();
    const game = new ThreeDTicTacToeGame(gameId);

    const player = new TicTacToePlayer(clientId, 'X');
    game.addPlayer(player);

    // ✅ Explicitly initialize first turn to 'X'
    (game as any).currentPlayerSign = 'X';

    games[gameId] = game;
    playersByGame[gameId] = [player];

    return {
        success: true,
        gameId,
        player: 'X' as const,
        playerId: clientId,
    };
}

/**
 * Allows another client to join an existing game.
 */
export function joinGame(gameId: string, clientId: string) {
    const game = games[gameId];
    if (!game) {
        return { success: false, error: 'Game not found' };
    }

    const players = playersByGame[gameId] || [];

    // 🧩 Reject if already two players are connected
    if (players.length >= 2) {
        return { success: false, error: 'Game full' };
    }

    // 🧩 Prevent same client from joining again
    if (players.some(p => p.id === clientId)) {
        return { success: false, error: 'Player already joined' };
    }

    const existingSigns = players.map(p => p.sign);
    const newSign: 'X' | 'O' = existingSigns.includes('X') ? 'O' : 'X';

    const newPlayer = new TicTacToePlayer(clientId, newSign);
    game.addPlayer(newPlayer);
    players.push(newPlayer);
    playersByGame[gameId] = players;

    // ✅ If there are now two players, ensure the first turn starts with X
    if (players.length === 2) {
        (game as any).currentPlayerSign = 'X';
    }

    return {
        success: true,
        player: newSign,
        playerId: clientId,
    };
}

/**
 * Handles a move request from a player.
 */
export function makeMove(gameId: string, clientId: string, moveData: any) {
    const game = games[gameId];
    if (!game) {
        return { success: false, error: 'Game not found' };
    }

    const players = playersByGame[gameId];
    if (!players) {
        return { success: false, error: 'No players for this game' };
    }

    // 🧩 Locate player
    const player = players.find(p => p.id === clientId);
    if (!player) {
        return { success: false, error: 'Invalid playerId' };
    }

    // 🧩 Delegate to the actual game logic
    const result = game.makeMove(player, moveData);

    // ✅ Return full state snapshot
    return {
        success: result.success,
        error: result.error,
        state: game.serialize(),
    };
}

/**
 * Handles a player leaving a game.
 */
export function leaveGame(gameId: string, clientId: string) {
    const game = games[gameId];
    if (!game) {
        return { success: false, error: 'Game not found' };
    }

    const players = playersByGame[gameId];
    if (!players || players.length === 0) {
        return { success: false, error: 'No players to remove' };
    }

    const playerIndex = players.findIndex(p => p.id === clientId);
    if (playerIndex === -1) {
        return { success: false, error: 'Player not found in this game' };
    }

    // Remove the player from the registry
    const [removedPlayer] = players.splice(playerIndex, 1);

    // Reflect removal in the actual game object
    game.removePlayer(removedPlayer);

    // Determine resulting mode
    if (players.length === 1) {
        // One player left — revert to solo mode
        game.setSoloMode(true);
    } else if (players.length === 0) {
        // Game empty — still reusable by future players
        playersByGame[gameId] = [];
    }

    return {
        success: true,
        remainingPlayers: players.map(p => ({ id: p.id, sign: p.sign })),
        soloMode: game.isSoloMode(),
    };
}

