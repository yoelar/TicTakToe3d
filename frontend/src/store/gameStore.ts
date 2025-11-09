import create from 'zustand';
import type { GameState, PlayerInfo } from '../types/game';

type State = {
    game?: GameState;
    clientId?: string;
    setGame: (g: GameState) => void;
    setClientId: (id: string) => void;
    updateBoard: (board: string[][][]) => void;
    addPlayer: (p: PlayerInfo) => void;
};

export const useGameStore = create<State>((set) => ({
    game: undefined,
    clientId: undefined,
    setGame: (g) => set({ game: g }),
    setClientId: (id) => set({ clientId: id }),
    updateBoard: (board) => set((s) => ({ game: s.game ? { ...s.game, board } : s.game })),
    addPlayer: (p) => set((s) => ({ game: s.game ? { ...s.game, players: [...s.game.players, p] } : s.game })),
}));
