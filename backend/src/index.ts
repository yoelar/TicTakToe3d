import express, { Request, Response } from 'express';
import http from 'http';

export const app = express();
app.use(express.json());

// -------- REST API Skeleton --------

// Create new game
app.post('/api/game', (req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented yet' });
});

// Join existing game
app.post('/api/game/:id/join', (req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented yet' });
});

// Make a move
app.post('/api/game/:id/move', (req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented yet' });
});

// Get game state
app.get('/api/game/:id/state', (req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented yet' });
});

// Leave game
app.post('/api/game/:id/leave', (req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented yet' });
});

// ------------------------------------

export const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
