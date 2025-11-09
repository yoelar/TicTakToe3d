import axios from 'axios';
import type { GameState } from '../types/game';

const api = axios.create({
    baseURL: (import.meta.env.VITE_API_BASE || '') + '/api',
    timeout: 5000,
});

export async function createGame(clientId?: string) {
    const res = await api.post('/game', undefined, { params: { clientId } });
    return res.data;
}

export async function joinGame(gameId: string, clientId?: string) {
    const res = await api.post(`/game/${gameId}/join`, undefined, { params: { clientId } });
    return res.data;
}

export async function makeMove(gameId: string, clientId: string, x: number, y: number, z: number) {
    const res = await api.post(`/game/${gameId}/move`, { player: clientId, x, y, z }, { params: { clientId } });
    return res.data;
}

export async function getState(gameId: string): Promise<GameState> {
    const res = await api.get(`/game/${gameId}/state`);
    return res.data;
}
