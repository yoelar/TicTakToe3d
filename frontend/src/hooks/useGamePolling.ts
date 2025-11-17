// frontend/src/hooks/useGamePolling.ts
import { useEffect, useRef, useCallback } from 'react';
import { GameState } from '../../../Shared/types';
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
    const fetchState = useCallback(async () => {
        if (!gameId || !isMountedRef.current) {
            return;
        }

        try {
            const state = await apiService.getGameState(gameId);

            // Only update if still mounted
            if (isMountedRef.current) {
                onStateUpdate(state);
            }
        } catch (err) {
            console.error('Failed to fetch game state:', err);
        }
    }, [gameId, apiService, onStateUpdate]);

    useEffect(() => {
        // Don't poll if no game
        if (!gameId) {
            return;
        }

        // Fetch immediately on mount/gameId change
        fetchState();

        // Set up polling interval
        intervalRef.current = setInterval(fetchState, intervalMs);

        // Cleanup function
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [gameId, fetchState, intervalMs]);

    // Track mount status for cleanup
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);
};