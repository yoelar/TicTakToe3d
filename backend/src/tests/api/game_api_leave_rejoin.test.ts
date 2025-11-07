import supertest from 'supertest';
import { app, server } from '../../index';

const request = supertest(app);

describe('3D TicTacToe REST API — Leave / Rejoin Scenarios', () => {
    const clientA = 'clientA';
    const clientB = 'clientB';
    const clientC = 'clientC';
    const clientD = 'clientD';
    let gameId: string;

    beforeAll(async () => {
        const res = await request.post('/api/game').query({ clientId: clientA }).expect(200);
        gameId = res.body.gameId;
    });

    afterAll(done => {
        if (server.listening) server.close(done);
        else done();
    });

    it('1️⃣ One player starts solo, second joins, both continue playing', async () => {
        const joinRes = await request.post(`/api/game/${gameId}/join`).query({ clientId: clientB }).expect(200);
        expect(joinRes.body.player).toBe('O');

        await request.post(`/api/game/${gameId}/move`).send({ player: 'X', x: 0, y: 0, z: 0 }).expect(200);
        await request.post(`/api/game/${gameId}/move`).send({ player: 'O', x: 1, y: 0, z: 0 }).expect(200);
    });

    it('2️⃣ Player2 leaves, Player1 continues solo', async () => {
        const leaveRes = await request.post(`/api/game/${gameId}/leave`).query({ clientId: clientB }).expect(200);
        expect(leaveRes.body.remaining.length).toBe(1);

        // Player A (X) now plays solo again
        await request.post(`/api/game/${gameId}/move`).send({ player: 'X', x: 2, y: 2, z: 0 }).expect(200);
        await request.post(`/api/game/${gameId}/move`).send({ player: 'O', x: 0, y: 1, z: 1 }).expect(200);
    });

    it('3️⃣ Player1 leaves, Player2 (rejoins as solo) continues', async () => {
        // First ensure Player B rejoins before Player A leaves
        await request.post(`/api/game/${gameId}/join`).query({ clientId: clientB }).expect(200);

        // Player A leaves
        const leaveA = await request.post(`/api/game/${gameId}/leave`).query({ clientId: clientA }).expect(200);
        expect(leaveA.body.remaining.some((p: any) => p.id === clientB)).toBe(true);

        // Player B can continue solo
        await request.post(`/api/game/${gameId}/move`).send({ player: 'O', x: 1, y: 1, z: 1 }).expect(200);
        await request.post(`/api/game/${gameId}/move`).send({ player: 'X', x: 2, y: 1, z: 1 }).expect(200);
    });

    it('4️⃣ One leaves, third joins, game continues normally', async () => {
        // Ensure Player B still exists, then Player C joins
        await request.post(`/api/game/${gameId}/join`).query({ clientId: clientC }).expect(200);

        // Should now have two players again (B and C)
        await request.post(`/api/game/${gameId}/move`).send({ player: 'O', x: 0, y: 2, z: 0 }).expect(200);
        await request.post(`/api/game/${gameId}/move`).send({ player: 'X', x: 1, y: 2, z: 0 }).expect(200);
    });

    it('5️⃣ Both players leave, others can still join and continue', async () => {
        await request.post(`/api/game/${gameId}/leave`).query({ clientId: clientB }).expect(200);
        await request.post(`/api/game/${gameId}/leave`).query({ clientId: clientC }).expect(200);

        // Now new players (A and D) should be able to join again
        const joinA = await request.post(`/api/game/${gameId}/join`).query({ clientId: clientA }).expect(200);
        const joinD = await request.post(`/api/game/${gameId}/join`).query({ clientId: clientD }).expect(200);

        expect(joinA.body.player).toBe('X');
        expect(joinD.body.player).toBe('O');

        // Continue gameplay normally
        await request.post(`/api/game/${gameId}/move`).send({ player: 'X', x: 0, y: 0, z: 1 }).expect(200);
        await request.post(`/api/game/${gameId}/move`).send({ player: 'O', x: 2, y: 2, z: 2 }).expect(200);
    });
});
