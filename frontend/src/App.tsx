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

        // create a solo game automatically for demo
        (async () => {
            const res = await createGame(id);
            // res.state is returned by our backend store convention
            setGame(res.state);
        })();
    }, [setClientId, setGame]);

    const onCellClick = useCallback(async (x: number, y: number, z: number) => {
        if (!game) return;
        const cid = clientId!;
        const res = await makeMove(game.id, cid, x, y, z);
        if (res && res.state) setGame(res.state);
    }, [game, clientId, setGame]);

    const onRestart = async () => {
        // Simplest: create a new game and replace
        const id = clientId!;
        const res = await createGame(id);
        setGame(res.state);
    };

    const onLeave = async () => {
        if (!game) return;
        await fetch(`/api/game/${game.id}/leave?clientId=${clientId}`, { method: 'POST' });
        // fetch new empty state
        setGame(undefined as any);
    };

    return (
        <div className="app">
            <div className="container">
                <div>
                    <h1 style={{ margin: 0 }}>3D Tic Tac Toe</h1>
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
