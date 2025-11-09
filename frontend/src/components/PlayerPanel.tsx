import React from 'react';
import '../styles/components.css';
import type { PlayerInfo } from '../types/game';

export default function PlayerPanel({ players }: { players: PlayerInfo[] }) {
    return (
        <div className="panel">
            <h4>Players</h4>
            <ul className="players">
                {players.map(p => (
                    <li key={p.id}>
                        <span className="pill">{p.symbol}</span>
                        <span className="player-id">{p.id}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
