// frontend/src/components/GameInitializer.tsx
import React from 'react';
import { JoinGameButton } from './JoinGameButton';

interface GameInitializerProps {
    onCreateGame: () => void;
    onJoinGame: (gameId: string) => void;
    error: string | null;
}

/**
 * Initial screen for creating or joining games.
 * Single Responsibility: Game initialization UI
 */
export const GameInitializer: React.FC<GameInitializerProps> = ({
    onCreateGame,
    onJoinGame,
    error
}) => {
    return (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <h1>3D Tic Tac Toe</h1>

            {error && (
                <div style={{ color: 'red', margin: '1rem 0' }}>
                    {error}
                </div>
            )}

            <button
                data-testid="create-game-btn"
                className="btn"
                onClick={onCreateGame}
                style={{ marginRight: "1rem" }}
            >
                Create Game
            </button>

            <JoinGameButton onJoin={(gameId) => onJoinGame(gameId)} />
        </div>
    );
};