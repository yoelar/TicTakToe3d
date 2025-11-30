import { GameStateDTO, GameState } from 'tictactoe3d-shared';

export function toDTO(state: GameState): GameStateDTO {
    return {
        board: state.board,
        currentPlayer: state.currentPlayer ?? '',
        winner: state.winner ?? '',
        isFinished: state.isFinished ?? false,
    };
}
