// frontend/src/tests/hooks/useAutoJoin.test.ts
import { renderHook } from '@testing-library/react';
import { useAutoJoin } from '../../hooks/useAutoJoin';

describe('useAutoJoin', () => {
    const mockOnJoin = jest.fn();

    beforeEach(() => {
        mockOnJoin.mockClear();
    });

    it('should call onJoin when join parameter exists in URL', () => {
        renderHook(() => useAutoJoin('client-1', mockOnJoin, '?join=game-123'));

        expect(mockOnJoin).toHaveBeenCalledWith('game-123', 'client-1');
        expect(mockOnJoin).toHaveBeenCalledTimes(1);
    });

    it('should not call onJoin when no join parameter exists', () => {
        renderHook(() => useAutoJoin('client-1', mockOnJoin, ''));

        expect(mockOnJoin).not.toHaveBeenCalled();
    });

    it('should not call onJoin when clientId is empty', () => {
        renderHook(() => useAutoJoin('', mockOnJoin, '?join=game-123'));

        expect(mockOnJoin).not.toHaveBeenCalled();
    });

    it('should handle URL with multiple parameters', () => {
        renderHook(() => useAutoJoin('client-1', mockOnJoin, '?foo=bar&join=game-456&baz=qux'));

        expect(mockOnJoin).toHaveBeenCalledWith('game-456', 'client-1');
    });

    it('should not call onJoin when join parameter is empty', () => {
        renderHook(() => useAutoJoin('client-1', mockOnJoin, '?join='));

        expect(mockOnJoin).not.toHaveBeenCalled();
    });
});