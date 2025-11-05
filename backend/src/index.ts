import express, { Request, Response } from 'express';
import http from 'http';
import { randomUUID } from 'crypto';
import { games, playersByGame, createGame, joinGame, makeMove } from './components/GameStore';


export const app = express();
app.use(express.json());

// ---------- REST API Implementation ----------

// ✅ Create new game
app.post('/api/game', (req: Request, res: Response) => {
    const clientId = (req.query.clientId as string) || randomUUID();
    const result = createGame(clientId);

    // If result contains "success" and it's false → treat as failure
    if ('success' in result && !result.success) {
        return res.status(400).json({ error: (result as any).error || 'Failed to create game' });
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
    const clientId = req.query.clientId as string | undefined;

    const game = games[id];
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const players = playersByGame[id];
    if (!players || players.length === 0)
        return res.status(400).json({ error: 'No players in this game' });

    let foundPlayer = players.find(p => p.sign === player);

    // 🧩 In solo mode, there is only one clientId, so we reuse it for both X and O turns.
    if (!foundPlayer && game.isSoloMode()) {
        foundPlayer = players[0];
    }

    if (!foundPlayer)
        return res.status(400).json({ error: 'Invalid playerId or sign' });

    const moveResult = game.makeMove(foundPlayer, { x, y, z });

    if (!moveResult.success)
        return res.status(400).json({ error: moveResult.error });

    return res.status(200).json({ state: game.serialize() });
});

// ✅ Get current game state
app.get('/api/game/:id/state', (req: Request, res: Response) => {
    const { id } = req.params;
    const game = games[id];
    if (!game) return res.status(404).json({ error: 'Game not found' });

    res.json(game.serialize());
});

// ✅ Leave game (optional for now)
app.post('/api/game/:id/leave', (req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented yet' });
});

// ---------------------------------------------

export const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
