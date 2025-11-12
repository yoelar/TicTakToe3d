// frontend/src/hooks/useGameSync.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { IWebSocketService } from '../services/WebSocketService';
import { WSMessage, GameState } from '../../../Shared/types';

export const useGameSync = (
    wsService: IWebSocketService,
    clientId: string,
    gameId: string | null,
    assignedPlayer: 'X' | 'O' | 'unassigned',
    onStateUpdate: (state: GameState) => void
) => {
    const [isConnected, setIsConnected] = useState(false);
    const isMountedRef = useRef(true);

    // Message handler with null safety and proper cleanup
    const handleMessage = useCallback((message: WSMessage) => {
        // Check if component is still mounted
        if (!isMountedRef.current) {
            return;
        }

        // Validate message structure
        if (!message || !message.type || !message.payload) {
            console.warn('Invalid message received:', message);
            return;
        }

        switch (message.type) {
            case 'MOVE_MADE':
                if (message.payload.state) {
                    onStateUpdate(message.payload.state);
                }
                break;

            case 'PLAYER_JOINED':
                console.log('Player joined:', message.payload);
                break;

            case 'PLAYER_LEFT':
                console.log('Player left:', message.payload);
                break;

            case 'GAME_OVER':
                console.log('Game over:', message.payload);
                // Update state when game is over
                if (message.payload.state) {
                    onStateUpdate(message.payload.state);
                }
                break;

            case 'ERROR':
                console.error('WebSocket error:', message.payload);
                break;

            default:
                console.warn('Unknown message type:', message.type);
        }
    }, [onStateUpdate]);

    // Connection handler
    const handleConnection = useCallback((connected: boolean) => {
        if (isMountedRef.current) {
            setIsConnected(connected);
        }
    }, []);

    // Connect/disconnect effect
    useEffect(() => {
        if (!gameId || !clientId) {
            return;
        }

        wsService.onMessage(handleMessage);
        wsService.onConnectionChange(handleConnection);
        wsService.connect(clientId, gameId);

        return () => {
            wsService.disconnect();
        };
    }, [gameId, clientId, wsService, handleMessage, handleConnection]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const submitMove = useCallback((x: number, y: number, z: number) => {
        console.log(`Submitting move: (${x}, ${y}, ${z}) by player ${assignedPlayer}`);

        if (!gameId || assignedPlayer === 'unassigned' || !clientId) {
            console.warn('Cannot submit move: missing game context');
            return;
        }

        wsService.send({
            type: 'MAKE_MOVE',
            payload: {
                playerId: clientId,
                player: assignedPlayer,
                x,
                y,
                z
            }
        });
    }, [wsService, clientId, gameId, assignedPlayer]);

    return {
        isConnected,
        submitMove
    };
};