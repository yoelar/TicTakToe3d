// frontend/src/hooks/useGameConnection.ts
import { useState, useCallback } from 'react';
import { GameState } from '../../../Shared/types';
import { IGameApiService } from '../services/GameApiService';

/**
 * Manages game lifecycle: create, join, leave.
 * Single Responsibility: Game connection state
 */
export const useGameConnection = (
    clientId: string,
    apiService: IGameApiService
) => {
    const [gameId, setGameId] = useState<string | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [assignedPlayer, setAssignedPlayer] = useState<"X" | "O" | "unassigned">("unassigned");
    const [error, setError] = useState<string | null>(null);

    const emptyBoard = () =>
        Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () =>
                Array.from({ length: 3 }, () => "")
            )
        );

    const createGame = useCallback(async () => {
        if (!clientId) return;

        try {
            setError(null);
            const data = await apiService.createGame(clientId);
            setGameId(data.gameId);
            setAssignedPlayer("X");
            setGameState({ id: data.gameId, board: emptyBoard(), currentPlayer: "X" });
        } catch (err) {
            setError('Failed to create game');
            console.error("Error creating game:", err);
        }
    }, [clientId, apiService]);

    const joinGame = useCallback(async (joinGameId: string) => {
        if (!clientId) return;

        try {
            setError(null);
            const data = await apiService.joinGame(joinGameId, clientId);
            setGameId(joinGameId);
            setAssignedPlayer("O");
            setGameState(data.state || { id: joinGameId, board: emptyBoard(), currentPlayer: "X" });
        } catch (err) {
            setError('Failed to join game');
            console.error("Error joining game:", err);
        }
    }, [clientId, apiService]);

    const leaveGame = useCallback(async () => {
        if (!gameId || !clientId) return;

        try {
            await apiService.leaveGame(gameId, clientId);
        } catch (err) {
            console.error("Error leaving game:", err);
        } finally {
            setGameId(null);
            setGameState(null);
            setAssignedPlayer("unassigned");
            setError(null);
            window.history.replaceState({}, "", window.location.pathname);
        }
    }, [gameId, clientId, apiService]);

    const updateGameState = useCallback((newState: GameState) => {
        console.log('[GameConnection] updateGameState called with:', {
            currentPlayer: newState.currentPlayer,
            isFinished: newState.isFinished,
            winner: newState.winner,
            firstCell: newState.board?.[0]?.[0]?.[0],
            stateId: newState.id
        });

        setGameState(prevState => {
            console.log('[GameConnection] Previous state:', {
                currentPlayer: prevState?.currentPlayer,
                firstCell: prevState?.board?.[0]?.[0]?.[0]
            });
            console.log('[GameConnection] Setting new state');
            return newState;
        });
    }, []);

    return {
        gameId,
        gameState,
        assignedPlayer,
        error,
        createGame,
        joinGame,
        leaveGame,
        updateGameState
    };
};