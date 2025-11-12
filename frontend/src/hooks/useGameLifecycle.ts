// src/hooks/useGameLifecycle.ts
import { useState, useEffect, useCallback } from 'react';
import { GameState, TicTacToePlayer } from '../../../Shared/types';
import { emptyBoard } from '../utils/board';
import { GameApiService } from '../services/GameApiService';

const api = new GameApiService('/api');

export function useGameLifecycle() {
    const [clientId, setClientId] = useState<string>('');
    const [gameId, setGameId] = useState<string | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [assignedPlayer, setAssignedPlayer] = useState<'X' | 'O' | 'unassigned'>('unassigned');
    const [players, setPlayers] = useState<{ player: TicTacToePlayer; connected: boolean }[]>([]);

    // --- client ID setup ---
    useEffect(() => {
        let id = localStorage.getItem('clientId');
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('clientId', id);
        }
        setClientId(id);
    }, []);

    // --- handle ?join query ---
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const joinGameId = params.get('join');
        if (joinGameId && clientId) {
            joinGame(joinGameId);
        }
    }, [clientId]);

    const createGame = useCallback(async () => {
        if (!clientId) return;
        const { gameId, state } = await api.createGame(clientId);
        setGameId(gameId);
        setAssignedPlayer('X');
        setGameState(state);
    }, [clientId]);

    const joinGame = useCallback(async (id: string) => {
        const { state } = await api.joinGame(id, clientId);
        setGameId(id);
        setAssignedPlayer('O');
        setGameState(state);
    }, [clientId]);

    const submitMove = useCallback(async (x, y, z) => {
        if (!gameId || !clientId || assignedPlayer === 'unassigned') return;
        const { state } = await api.makeMove(gameId, clientId, assignedPlayer, x, y, z);
        setGameState(state);
    }, [clientId, gameId, assignedPlayer]);

    const leaveGame = useCallback(async () => {
        if (gameId && clientId) {
            await fetch(`/api/game/${gameId}/leave?clientId=${clientId}`, { method: 'POST' }).catch(() => { });
        }
        setGameId(null);
        setGameState(null);
        setAssignedPlayer('unassigned');
        setPlayers([]);
    }, [clientId, gameId]);

    const copyJoinLink = useCallback(() => {
        if (!gameId) return;
        const link = `${window.location.origin}?join=${gameId}`;
        navigator.clipboard.writeText(link);
        alert('Join link copied!');
    }, [gameId]);

    return {
        clientId,
        gameId,
        gameState,
        assignedPlayer,
        players,
        createGame,
        joinGame,
        leaveGame,
        submitMove,
        copyJoinLink,
    };
}
