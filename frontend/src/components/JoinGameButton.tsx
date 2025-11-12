import React, { useState } from "react";

interface JoinGameButtonProps {
    onJoin: (gameId: string, clientId: string) => void;
}

export const JoinGameButton: React.FC<JoinGameButtonProps> = ({ onJoin }) => {
    const [joinId, setJoinId] = useState("");

    const handleJoin = () => {
        if (!joinId) return;
        const clientId = sessionStorage.getItem("clientId") || crypto.randomUUID();
        sessionStorage.setItem("clientId", clientId);
        onJoin(joinId, clientId);
    };

    return (
        <div style={{ display: "inline-block" }}>
            <input
                type="text"
                placeholder="Enter Game ID"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                style={{ marginRight: "0.5rem" }}
            />
            <button onClick={handleJoin} className="btn">
                Join Game
            </button>
        </div>
    );
};
