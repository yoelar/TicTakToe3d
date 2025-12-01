// frontend/src/hooks/useGamePolling.ts
import { useEffect, useRef, useCallback } from 'react';
import { GameState } from 'tictactoe3d-shared';
import { IGameApiService } from '../services/GameApiService';

/**
 * Polls game state at regular intervals.
 * Single Responsibility: Game state synchronization via polling
 * 
 * @param apiService - API service for fetching game state
 * @param gameId - Current game ID (null if not in a game)
 * @param onStateUpdate - Callback when new state is received
 * @param intervalMs - Polling interval in milliseconds (default: 2000)
 */

export const useGamePolling = (
    apiService: IGameApiService,
    gameId: string | null,
    onStateUpdate: (state: GameState) => void,
    intervalMs: number = 2000
) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    // Memoize fetch function to avoid recreating on every render
    const fetchState = useCallback(async (gameId: string | null) => {
        console.log(`[Polling] fetchState called. gameId is ${gameId}.
        isMountedRef.current is ${isMountedRef.current}`);
        if (!gameId || !isMountedRef.current) {
            console.log('[Polling] Skipped: no gameId or unmounted');
            return;
        }

        console.log(`[Polling] Fetching state for game ${gameId}...`);

        try {
            const state = await apiService.getGameState(gameId);

            console.log('[Polling] Received state:', {
                currentPlayer: state.currentPlayer,
                isFinished: state.isFinished,
                winner: state.winner,
                firstCell: state.board?.[0]?.[0]?.[0],
                boardExists: !!state.board
            });

            // Only update if still mounted
            if (isMountedRef.current) {
                console.log('[Polling] Calling onStateUpdate with new state');
                onStateUpdate(state);
            } else {
                console.log('[Polling] Component unmounted, skipping update');
            }
        } catch (err) {
            console.error('[Polling] Failed to fetch game state:', err);
        }
    }, [gameId, apiService, onStateUpdate]);

    useEffect(() => {
        if (!gameId) {
            console.log('[Polling] No gameId, not starting polling');
            return;
        }

        console.log(`[Polling] Starting polling for game ${gameId} every ${intervalMs}ms`);

        // Fetch immediately
        fetchState(gameId);

        // Set up polling interval
        intervalRef.current = setInterval(() => {
            console.log('[Polling] Interval triggered');
            fetchState(gameId);
        }, intervalMs);

        // Cleanup function
        return () => {
            console.log('[Polling] Cleaning up polling interval');
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [gameId, fetchState, intervalMs]);
};