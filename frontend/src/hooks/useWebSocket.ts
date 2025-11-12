// frontend/src/hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { WSMessage } from '../types';

export const useWebSocket = (
    url: string,
    clientId: string,
    gameId: string | null,
    onMessage?: (message: WSMessage) => void
) => {
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    const connect = useCallback(() => {
        if (!gameId || wsRef.current?.readyState === WebSocket.OPEN) return;

        const ws = new WebSocket(`${url}?clientId=${clientId}&gameId=${gameId}`);

        ws.onopen = () => {
            setIsConnected(true);
            console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
            try {
                const message: WSMessage = JSON.parse(event.data);
                onMessage?.(message);
            } catch (err) {
                console.error('Failed to parse WebSocket message:', err);
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            console.log('WebSocket disconnected');

            // Attempt reconnect after 3 seconds
            reconnectTimeoutRef.current = setTimeout(() => {
                connect();
            }, 3000);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        wsRef.current = ws;
    }, [url, clientId, gameId, onMessage]);

    const sendMessage = useCallback((message: WSMessage) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        }
    }, []);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        wsRef.current?.close();
        wsRef.current = null;
        setIsConnected(false);
    }, []);

    useEffect(() => {
        if (gameId) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [gameId, connect, disconnect]);

    return { isConnected, sendMessage, disconnect };
};