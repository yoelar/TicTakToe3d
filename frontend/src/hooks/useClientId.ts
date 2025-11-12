// frontend/src/hooks/useClientId.ts
import { useEffect, useState } from 'react';

/**
 * Manages client ID in sessionStorage.
 * Single Responsibility: Client identification
 */
export const useClientId = (): string => {
    const [clientId, setClientId] = useState<string>("");

    useEffect(() => {
        let storedId = sessionStorage.getItem("clientId");
        if (!storedId) {
            storedId = crypto.randomUUID();
            sessionStorage.setItem("clientId", storedId);
        }
        setClientId(storedId);
    }, []);

    return clientId;
};