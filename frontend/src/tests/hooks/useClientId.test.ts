// frontend/src/tests/hooks/useClientId.test.ts
import { renderHook } from '@testing-library/react';
import { useClientId } from '../../hooks/useClientId';

describe('useClientId', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('should generate a new client ID if none exists', () => {
        const { result } = renderHook(() => useClientId());

        expect(result.current).toBeTruthy();
        expect(sessionStorage.getItem('clientId')).toBe(result.current);
    });

    it('should reuse existing client ID from sessionStorage', () => {
        const existingId = 'existing-client-id';
        sessionStorage.setItem('clientId', existingId);

        const { result } = renderHook(() => useClientId());

        expect(result.current).toBe(existingId);
    });
});