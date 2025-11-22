// frontend/src/components/GameController.tsx
import React, { useCallback } from "react";
import { GameLayout } from "./GameLayout";
import { GameInitializer } from "./GameInitializer";
import { useClientId } from "../hooks/useClientId";
import { useAutoJoin } from "../hooks/useAutoJoin";
import { useGameConnection } from "../hooks/useGameConnection";
import { useGamePolling } from "../hooks/useGamePolling";
import { GameApiService } from "../services/GameApiService";

// Dependency Injection: Services created once
const apiService = new GameApiService('/api');

/**
 * Main game orchestrator following Single Responsibility Principle.
 * Responsibilities: Compose hooks and services, render appropriate view
 */
export const GameController: React.FC = () => {
    // 1️⃣ Client identification
    const clientId = useClientId();

    // 2️⃣ Game connection management
    const {
        gameId,
        gameState,
        assignedPlayer,
        error,
        createGame,
        joinGame,
        leaveGame,
        updateGameState
    } = useGameConnection(clientId, apiService);

    // 3️⃣ Auto-join from URL
    useAutoJoin(clientId, joinGame);

    // 4️⃣ Polling for game state updates (replaces WebSocket)
    useGamePolling(apiService, gameId, updateGameState, 2000);

    // 5️⃣ Submit move via REST API
    const submitMove = useCallback(async (x: number, y: number, z: number) => {
        if (!gameId || assignedPlayer === 'unassigned' || !clientId) {
            console.warn('Cannot submit move: missing game context');
            return;
        }

        try {
            const result = await apiService.makeMove(gameId, clientId, assignedPlayer, x, y, z);
            updateGameState(result.state);
        } catch (err) {
            console.error('Move failed:', err);
        }
    }, [gameId, clientId, assignedPlayer, updateGameState]);

    // 6️⃣ View selection
    if (!gameId) {
        return (
            <GameInitializer
                onCreateGame={createGame}
                onJoinGame={(gameId) => joinGame(gameId)}
                error={error}
            />
        );
    }

    // Don't render GameLayout until gameState is available
    if (!gameState) {
        return (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <h1>3D Tic Tac Toe</h1>
                <p>Loading game...</p>
            </div>
        );
    }

    return (
        <GameLayout
            gameId={gameId}
            gameState={gameState}
            assignedPlayer={assignedPlayer}
            players={[]} // TODO: Add player connection tracking
            onMove={submitMove}
            onLeave={leaveGame}
            isConnected={true}  // Always "connected" with polling
        />
    );
};