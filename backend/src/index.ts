// backend/src/index.ts
import express, { Request, Response } from 'express';
import http from 'http';
import { randomUUID } from 'crypto';
import {
    games,
    createGame,
    joinGame,
    makeMove,
    leaveGame
} from './components/GameStore';

export const app = express();
app.use(express.json());

// ---------- REST API Implementation ----------

// ✅ Create new game
app.post('/api/game', (req: Request, res: Response) => {
    const clientId = (req.query.clientId as string) || randomUUID();
    const result = createGame(clientId);

    if (!result.success) {
        return res.status(400).json({ error: result.error || 'Failed to create game' });
    }

    res.status(200).json(result);
});

// ✅ Join existing game
app.post('/api/game/:id/join', (req: Request, res: Response) => {
    const { id } = req.params;
    const clientId = (req.query.clientId as string) || randomUUID();

    const result = joinGame(id, clientId);
    if (!result.success) {
        const status = result.error?.toLowerCase().includes('not found') ? 404 : 400;
        return res.status(status).json({ error: result.error });
    }

    res.status(200).json(result);
});

// ✅ Make a move
// --- replace your existing /api/game/:id/move handler with this ---
app.post('/api/game/:id/move', (req: Request, res: Response) => {
    const { id } = req.params;
    const { player, x, y, z } = req.body as { player?: string; x?: any; y?: any; z?: any };
    const clientId = req.query.clientId as string | undefined;

    const game = games[id];
    if (!game) {
        console.log(`[MOVE] ${id} - rejected: Game not found`);
        return res.status(404).json({ error: 'Game not found' });
    }

    // Defensive parse of coordinates (should be numbers)
    const xi = Number(x);
    const yi = Number(y);
    const zi = Number(z);

    // Snapshot helpful info
    const playersSnapshot = game.getPlayers().map(p => ({ id: p.id, symbol: p.symbol }));
    const currentTurn = (game as any).currentTurn ?? null; // accessor name depends on class, fallback

    console.log(`[MOVE] ${id} Move request by player=${player} coords=(x=${x},y=${y},z=${z}) parsed=(x=${xi},y=${yi},z=${zi})`);
    console.log(`[MOVE] ${id} Current turn=${currentTurn} Players=${JSON.stringify(playersSnapshot)}`);

    // Find the player object by symbol or by clientId (solo-mode allow)
    // Try to locate player by symbol first (API sends { player: 'X' } etc)
    let foundPlayer = game.getPlayers().find(p => p.symbol === player);
    if (!foundPlayer && clientId) {
        // fallback: find by clientId
        foundPlayer = game.getPlayers().find(p => p.id === clientId);
    }
    // Also in solo-mode allow the single player to act for both symbols
    if (!foundPlayer && (game as any).getPlayers().length === 1) {
        foundPlayer = (game as any).getPlayers()[0];
    }

    if (!foundPlayer) {
        console.log(`[MOVE] ${id} rejected: invalid player (player=${player} clientId=${clientId})`);
        return res.status(400).json({
            error: 'Invalid player or not part of this game',
            debug: { currentTurn, players: playersSnapshot }
        });
    }

    // Make the move — delegate to game object
    const moveResult = game.makeMove(foundPlayer, { x: xi, y: yi, z: zi });

    if (!moveResult.success) {
        console.log(`[MOVE] ${id} rejected: ${moveResult.error}`);
        return res.status(400).json({
            error: moveResult.error,
            debug: {
                currentTurn,
                players: playersSnapshot,
                coords: { x: xi, y: yi, z: zi },
            }
        });
    }

    // success
    const state = game.serialize();
    console.log(`[MOVE] ${id} accepted. Next turn: ${(game as any).currentTurn}`);
    return res.status(200).json({ state });
});

// ✅ Get current game state
app.get('/api/game/:id/state', (req: Request, res: Response) => {
    const { id } = req.params;
    const game = games[id];
    if (!game) return res.status(404).json({ error: 'Game not found' });
    res.status(200).json(game.serialize());
});

// ✅ Leave game
app.post('/api/game/:id/leave', (req: Request, res: Response) => {
    const { id } = req.params;
    const clientId = req.query.clientId as string;
    if (!clientId) return res.status(400).json({ error: 'Missing clientId' });

    const result = leaveGame(id, clientId);
    if (!result.success) return res.status(400).json({ error: result.error });

    res.status(200).json(result);
});

// ---------------------------------------------

export const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
