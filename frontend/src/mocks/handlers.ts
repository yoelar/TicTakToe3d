// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
    rest.post('/api/restart', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ message: 'Board reset' }));
    }),

    rest.post('/api/move', async (req, res, ctx) => {
        const { x, y, z, player } = await req.json();
        return res(
            ctx.status(200),
            ctx.json({ success: true, nextPlayer: player === 'X' ? 'O' : 'X' })
        );
    }),
];
