import { createGame, joinGame, leaveGame, makeMove } from '../../components/GameStore';
import {
    expectCreateSuccess,
    expectJoinSuccess,
    expectLeaveSuccess,
    expectMoveSuccess
} from '../helpers/assertions';

describe('GameStore Leave/Rejoin Scenarios', () => {

    it('1️⃣ solo → second joins → continue playing', () => {
        const g = expectCreateSuccess(createGame('A'));
        const j = expectJoinSuccess(joinGame(g.gameId, 'B'));

        expect(j.player).toBe('O');

        expectMoveSuccess(makeMove(g.gameId, 'A', { x: 0, y: 0, z: 0 }));
        expectMoveSuccess(makeMove(g.gameId, 'B', { x: 1, y: 0, z: 0 }));
    });

    it('2️⃣ player2 leaves → player1 continues solo', () => {
        const g = expectCreateSuccess(createGame('A'));
        expectJoinSuccess(joinGame(g.gameId, 'B'));
        expectLeaveSuccess(leaveGame(g.gameId, 'B'));

        expectMoveSuccess(makeMove(g.gameId, 'A', { x: 0, y: 0, z: 0 }));
        expectMoveSuccess(makeMove(g.gameId, 'A', { x: 1, y: 1, z: 1 }));
    });

    it('3️⃣ player1 leaves → player2 continues solo', () => {
        const g = expectCreateSuccess(createGame('A'));
        expectJoinSuccess(joinGame(g.gameId, 'B'));
        expectLeaveSuccess(leaveGame(g.gameId, 'A'));

        expectMoveSuccess(makeMove(g.gameId, 'B', { x: 0, y: 0, z: 0 }));
        expectMoveSuccess(makeMove(g.gameId, 'B', { x: 1, y: 1, z: 1 }));
    });

    it('4️⃣ player leaves → new joins → game continues', () => {
        const g = expectCreateSuccess(createGame('A'));
        expectJoinSuccess(joinGame(g.gameId, 'B'));
        expectLeaveSuccess(leaveGame(g.gameId, 'A'));

        const r = expectJoinSuccess(joinGame(g.gameId, 'C'));

        expectMoveSuccess(makeMove(g.gameId, 'C', { x: 0, y: 0, z: 0 }));
        expectMoveSuccess(makeMove(g.gameId, 'B', { x: 1, y: 0, z: 0 }));
    });

    it('5️⃣ both players leave → others can join', () => {
        const g = expectCreateSuccess(createGame('A'));
        expectJoinSuccess(joinGame(g.gameId, 'B'));
        expectLeaveSuccess(leaveGame(g.gameId, 'A'));
        expectLeaveSuccess(leaveGame(g.gameId, 'B'));

        expectJoinSuccess(joinGame(g.gameId, 'C'));
        expectJoinSuccess(joinGame(g.gameId, 'D'));
    });

});
