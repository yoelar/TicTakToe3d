import {
    CreateGameResponse,
    CreateGameSuccess,
    JoinGameResponse,
    JoinGameSuccess,
    LeaveGameResponse,
    LeaveGameSuccess,
    MoveResponse,
    MoveSuccess,
    Failure
} from "tictactoe3d-shared";

export function expectCreateSuccess(r: CreateGameResponse): CreateGameSuccess {
    if (!r.success) {
        throw new Error(`createGame() failed: ${(r as Failure).error}`);
    }
    return r;
}

export function expectJoinSuccess(r: JoinGameResponse): JoinGameSuccess {
    if (!r.success) {
        throw new Error(`joinGame() failed: ${(r as Failure).error}`);
    }
    return r;
}

export function expectLeaveSuccess(r: LeaveGameResponse): LeaveGameSuccess {
    if (!r.success) {
        throw new Error(`leaveGame() failed: ${(r as Failure).error}`);
    }
    return r;
}

export function expectMoveSuccess(r: MoveResponse): MoveSuccess {
    if (!r.success) {
        throw new Error(`makeMove() failed: ${(r as Failure).error}`);
    }
    return r;
}
