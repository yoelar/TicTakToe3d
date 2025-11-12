import React from "react";
import GameBoard from "./GameBoard";
import GameStatus from "./GameStatus";
import PlayerPanel from "./PlayerPanel";
import GameMenu from "./GameMenu";
import type { GameState, TicTacToePlayer } from "../../../Shared/types";

interface GameLayoutProps {
    gameId: string;
    gameState: GameState | null;
    assignedPlayer: "X" | "O" | "unassigned";
    players: { player: TicTacToePlayer; connected: boolean }[];
    onMove: (x: number, y: number, z: number) => void;
    onLeave: () => void;
}

export const GameLayout: React.FC<GameLayoutProps> = ({
    gameId,
    gameState,
    assignedPlayer,
    players,
    onMove,
    onLeave,
}) => {
    const handleCellClick = (x: number, y: number, z: number) => {
        onMove(x, y, z);
    };

    return (
        <div className="app">
            <div className="container">
                <div>
                    <h1 style={{ margin: 0 }}>3D Tic Tac Toe</h1>
                    <div style={{ margin: "8px 0" }}>
                        <span data-testid="game-id" style={{ marginRight: 8 }}>
                            Game ID: {gameId}
                        </span>
                        <button
                            className="btn"
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    `${window.location.origin}?join=${gameId}`
                                );
                                alert("Join link copied!");
                            }}
                        >
                            Copy Join Link
                        </button>
                    </div>
                    {gameState && (
                        <GameBoard state={gameState} onCellClick={handleCellClick} />
                    )}
                </div>

                <aside>
                    <div className="panel">
                        <GameStatus state={gameState} />
                    </div>
                    <PlayerPanel players={players ?? []} />
                    <GameMenu onRestart={() => window.location.reload()} onLeave={onLeave} />
                </aside>
            </div>
        </div>
    );
};
