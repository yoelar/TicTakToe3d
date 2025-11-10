// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
    http.post('/api/restart', () => {
        return HttpResponse.json({ message: 'Board reset' });
    }),

    http.post('/api/move', async ({ request }) => {
        const body = await request.json();
        // Handle your move logic here
        return HttpResponse.json({ success: true, board: [] });
    }),

    // Add other handlers as needed
];