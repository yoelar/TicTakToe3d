// frontend/src/components/GameController.tsx
import React from "react";
import { GameLayout } from "./GameLayout";
import { GameInitializer } from "./GameInitializer";
import { useClientId } from "../hooks/useClientId";
import { useAutoJoin } from "../hooks/useAutoJoin";
import { useGameConnection } from "../hooks/useGameConnection";
import { useGamePolling } from "../hooks/useGamePolling";  // ✅ Add polling
import { GameApiService } from "../services/GameApiService";

const apiService = new GameApiService('/api');

export const GameController: React.FC = () => {
    const clientId = useClientId();

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

    useAutoJoin(clientId, joinGame);

    // ✅ Add polling instead of WebSocket
    useGamePolling(apiService, gameId, updateGameState, 2000);

    // Submit move via REST API
    const submitMove = async (x: number, y: number, z: number) => {
        if (!gameId || assignedPlayer === 'unassigned') return;

        try {
            const result = await apiService.makeMove(gameId, clientId, assignedPlayer, x, y, z);
            updateGameState(result.state);
        } catch (err) {
            console.error('Move failed:', err);
        }
    };

    if (!gameId) {
        return (
            <GameInitializer
                onCreateGame={createGame}
                onJoinGame={(gameId) => joinGame(gameId)}
                error={error}
            />
        );
    }

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
            players={[]}
            onMove={submitMove}
            onLeave={leaveGame}
            isConnected={true}  // Always connected with polling
        />
    );
};