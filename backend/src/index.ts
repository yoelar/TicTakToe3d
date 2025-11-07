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
app.post('/api/game/:id/move', (req: Request, res: Response) => {
    const { id } = req.params;
    const { player, x, y, z } = req.body;
    const game = games[id];

    if (!game) return res.status(404).json({ error: 'Game not found' });

    // Try to locate by sign (for API simplicity)
    const matched = game.getPlayers().find(p => p.symbol === player);
    const playerId = matched?.id;

    if (!playerId && !game.getPlayers().length)
        return res.status(400).json({ error: 'No players in this game' });

    const moveResult = makeMove(id, playerId || game.getPlayers()[0].id, { x, y, z });

    if (!moveResult.success)
        return res.status(400).json({ error: moveResult.error });

    return res.status(200).json({ state: moveResult.state });
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
