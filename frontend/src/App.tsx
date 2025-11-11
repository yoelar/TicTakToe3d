import React, { useEffect, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import GameStatus from './components/GameStatus';
import PlayerPanel from './components/PlayerPanel';
import GameMenu from './components/GameMenu';
import './styles/layout.css';
import './styles/components.css';
import { createGame, joinGame, makeMove, getState } from './api/client';
import { useGameStore } from './store/gameStore';
import type { PlayerInfo } from './types/game';

export default function App() {
    const { game, setGame, clientId, setClientId, updateBoard } = useGameStore();

    useEffect(() => {
        // place-holder client id; in production you persist this
        const id = 'client-' + Math.floor(Math.random() * 100000);
        setClientId(id);

        // create a solo game automatically for demo (best-effort)
        (async () => {
            try {
                const res = await createGame(id);
                if (res && res.state) setGame(res.state);
            } catch (err) {
                // fallback to a local in-memory game state if backend isn't available
                const fallback = {
                    id: 'local-' + Math.floor(Math.random() * 10000),
                    createdAt: new Date(),
                    board: Array.from({ length: 3 }, () =>
                        Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => ''))
                    ),
                    players: [],
                    isFinished: false,
                    winner: ''
                } as any;
                setGame(fallback);
            }
        })();
    }, [setClientId, setGame]);

    const onCreate = async () => {
        const id = clientId!;
        try {
            const res = await createGame(id);
            if (res && res.state) setGame(res.state);
        } catch (err) {
            // fallback local create
            const fallback = {
                id: 'local-' + Math.floor(Math.random() * 10000),
                createdAt: new Date(),
                board: Array.from({ length: 3 }, () =>
                    Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => ''))
                ),
                players: [],
                isFinished: false,
                winner: ''
            } as any;
            setGame(fallback);
        }
    };

    const onCellClick = useCallback(async (x: number, y: number, z: number) => {
        if (!game) return;
        const cid = clientId!;
        try {
            const res = await makeMove(game.id, cid, x, y, z);
            if (res && res.state) setGame(res.state);
        } catch (err) {
            // best-effort local update when backend isn't reachable
            const newBoard = structuredClone(game.board);
            if (newBoard[z][y][x] === '') {
                // determine next sign by counting
                const flat = newBoard.flat(2);
                const xCount = flat.filter((c: any) => c === 'X').length;
                const oCount = flat.filter((c: any) => c === 'O').length;
                const next = xCount === oCount ? 'X' : 'O';
                newBoard[z][y][x] = next;
                setGame({ ...game, board: newBoard });
            }
        }
    }, [game, clientId, setGame]);

    const onRestart = async () => {
        // Simplest: create a new game and replace
        const id = clientId!;
        try {
            const res = await createGame(id);
            setGame(res.state);
        } catch (err) {
            const fallback = {
                id: 'local-' + Math.floor(Math.random() * 10000),
                createdAt: new Date(),
                board: Array.from({ length: 3 }, () =>
                    Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => ''))
                ),
                players: [],
                isFinished: false,
                winner: ''
            } as any;
            setGame(fallback);
        }
    };

    const onLeave = async () => {
        if (!game) return;
        try {
            await fetch(`/api/game/${game.id}/leave?clientId=${clientId}`, { method: 'POST' });
        } catch (_) {
            // ignore
        }
        setGame(undefined as any);
    };

    return (
        <div className="app">
            <div className="container">
                <div>
                    <h1 style={{ margin: 0 }}>3D Tic Tac Toe</h1>
                    <div style={{ margin: '8px 0' }}>
                        <button onClick={onCreate} className="btn" data-testid="create-game-btn" aria-label="Create Game">Create Game</button>
                        {game && <span data-testid="game-id" style={{ marginLeft: 8 }}>{game.id}</span>}
                    </div>
                    <GameBoard state={game} onCellClick={onCellClick} />
                </div>

                <aside>
                    <div className="panel">
                        <GameStatus state={game} />
                    </div>
                    <PlayerPanel players={game?.players ?? [] as PlayerInfo[]} />
                    <GameMenu onRestart={onRestart} onLeave={onLeave} />
                </aside>
            </div>
        </div>
    );
}
