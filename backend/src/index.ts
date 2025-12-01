// backend/src/index.ts
import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors'; // <-- add this
import { randomUUID } from 'crypto';
import {
    games,
    createGame,
    joinGame,
    makeMove,
    leaveGame
} from './components/GameStore';
import { getLogger } from './logger';

const log = getLogger('API');

export const app = express();
app.use(express.json());

// ---------- ADD CORS ----------
// Allow requests from your frontend
app.use(cors()); // defaults to allowing all origins

// ---------- REST API Implementation ----------

// ✅ Create new game
app.post('/api/game', (req: Request, res: Response) => {
    const clientId = (req.query.clientId as string) || randomUUID();
    const result = createGame(clientId);

    if (!result.success) {
        log.warn({ clientId, error: result.error }, 'Failed to create game');
        return res.status(400).json({ error: result.error || 'Failed to create game' });
    }

    log.info({ gameId: result.gameId, clientId }, `Game created: ${JSON.stringify(result)}`);
    res.status(200).json(result);
});

// ✅ Join existing game
app.post('/api/game/:id/join', (req: Request, res: Response) => {
    const { id } = req.params;
    const clientId = (req.query.clientId as string) || randomUUID();

    const result = joinGame(id, clientId);
    if (!result.success) {
        const status = result.error?.toLowerCase().includes('not found') ? 404 : 400;
        log.warn({ gameId: id, clientId, error: result.error }, 'Join failed');
        return res.status(status).json({ error: result.error });
    }

    log.info({ gameId: id, clientId }, 'Player joined game');
    res.status(200).json(result);
});

// ✅ Make a move
app.post('/api/game/:id/move', (req: Request, res: Response) => {
    const { id } = req.params;
    const { player, x, y, z } = req.body as { player?: string; x?: any; y?: any; z?: any };
    const clientId = req.query.clientId as string | undefined;

    const game = games[id];
    if (!game) {
        log.error({ gameId: id }, 'Move rejected: Game not found');
        return res.status(404).json({ error: 'Game not found' });
    }

    const xi = Number(x);
    const yi = Number(y);
    const zi = Number(z);

    const playersSnapshot = game.getPlayers().map(p => ({ id: p.id, symbol: p.symbol }));
    const currentTurn = (game as any).currentTurn ?? null;

    log.debug({
        gameId: id,
        player,
        coords: { x, y, z },
        parsed: { x: xi, y: yi, z: zi },
        currentTurn,
        players: playersSnapshot
    }, 'Move request received');

    let foundPlayer = game.getPlayers().find(p => p.symbol === player);
    if (!foundPlayer && clientId) {
        foundPlayer = game.getPlayers().find(p => p.id === clientId);
    }
    if (!foundPlayer && (game as any).getPlayers().length === 1) {
        foundPlayer = (game as any).getPlayers()[0];
    }

    if (!foundPlayer) {
        log.warn({ gameId: id, player, clientId }, 'Move rejected: invalid player');
        return res.status(400).json({
            error: 'Invalid player or not part of this game',
            debug: { currentTurn, players: playersSnapshot }
        });
    }

    const moveResult = game.makeMove(foundPlayer, { x: xi, y: yi, z: zi });

    if (!moveResult.success) {
        log.warn({
            gameId: id,
            player: foundPlayer.id,
            coords: { x: xi, y: yi, z: zi },
            error: moveResult.error
        }, 'Move rejected');
        return res.status(400).json({
            error: moveResult.error,
            debug: { currentTurn, players: playersSnapshot, coords: { x: xi, y: yi, z: zi } }
        });
    }

    const state = game.serialize();
    log.info({ gameId: id, nextTurn: (game as any).currentTurn }, 'Move accepted');
    if (moveResult.state.isFinished) { log.info({ gameId: id, winner: moveResult.state.winner }, `Game finished. Winner is ${moveResult.state.winner}`); }
    return res.status(200).json({ state });
});

// ✅ Get current game state
app.get('/api/game/:id/state', (req: Request, res: Response) => {
    const { id } = req.params;
    const game = games[id];
    if (!game) {
        log.warn({ gameId: id }, 'Get state: Game not found');
        return res.status(404).json({ error: 'Game not found' });
    }
    log.debug({ gameId: id }, 'Returning game state');
    res.status(200).json(game.serialize());
});

// ✅ Leave game
app.post('/api/game/:id/leave', (req: Request, res: Response) => {
    const { id } = req.params;
    const clientId = req.query.clientId as string;
    if (!clientId) {
        log.warn({ gameId: id }, 'Leave failed: Missing clientId');
        return res.status(400).json({ error: 'Missing clientId' });
    }

    const result = leaveGame(id, clientId);
    if (!result.success) {
        log.warn({ gameId: id, clientId, error: result.error }, 'Leave failed');
        return res.status(400).json({ error: result.error });
    }

    log.info({ gameId: id, clientId }, 'Player left game');
    res.status(200).json(result);
});

// ---------------------------------------------

export const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
if (require.main === module) {
    server.listen(PORT, () => {
        log.info(`Server running on port ${PORT}`);
    });
}
