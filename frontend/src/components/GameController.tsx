// frontend/src/components/GameController.tsx
import React from "react";
import { GameLayout } from "./GameLayout";
import { GameInitializer } from "./GameInitializer";
import { useClientId } from "../hooks/useClientId";
import { useAutoJoin } from "../hooks/useAutoJoin";
import { useGameConnection } from "../hooks/useGameConnection";
import { useGameSync } from "../hooks/useGameSync";
import { GameApiService } from "../services/GameApiService";
import { WebSocketService } from "../services/WebSocketService";

// Dependency Injection: Services created once
const apiService = new GameApiService('/api');
const wsService = new WebSocketService('ws://localhost:3001');

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

    // 4️⃣ Real-time synchronization
    const { isConnected, submitMove } = useGameSync(
        wsService,
        clientId,
        gameId,
        assignedPlayer,
        updateGameState
    );

    // 5️⃣ View selection
    if (!gameId) {
        return (
            <GameInitializer
                onCreateGame={createGame}
                onJoinGame={(gameId) => joinGame(gameId)}
                error={error}
            />
        );
    }

    // ✅ Don't render GameLayout until gameState is available
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
        //    isConnected={isConnected}
        />
    );
};