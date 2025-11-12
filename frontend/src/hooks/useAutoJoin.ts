// frontend/src/hooks/useAutoJoin.ts
import { useEffect } from 'react';

export const useAutoJoin = (
    clientId: string,
    onJoin: (gameId: string, clientId: string) => void,
    searchString: string = window.location.search // Default to actual location
) => {
    useEffect(() => {
        if (!clientId) return;

        const params = new URLSearchParams(searchString);
        const joinGameId = params.get('join');

        if (joinGameId) {
            onJoin(joinGameId, clientId);
        }
    }, [clientId, onJoin, searchString]);
};