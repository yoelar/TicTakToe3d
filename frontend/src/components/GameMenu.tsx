import React from 'react';
import '../styles/components.css';

export default function GameMenu({ onRestart, onLeave }: { onRestart: () => void; onLeave: () => void }) {
    return (
        <div className="menu">
            <button onClick={onRestart} className="btn">Restart</button>
            <button onClick={onLeave} className="btn btn-ghost">Leave</button>
        </div>
    );
}
