import { useState, useCallback } from 'react';

/**
 * Custom hook to prevent duplicate form submissions and spam clicks.
 * @param {number} cooldownMs - Cooldown time in milliseconds before the action is allowed again.
 */
export const useRateLimit = (cooldownMs = 3000) => {
    const [isRateLimited, setIsRateLimited] = useState(false);

    const executeWithLimit = useCallback(async (callback) => {
        if (isRateLimited) {
            console.warn(`[Anti-Spam] Action blocked. Wait ${cooldownMs/1000}s.`);
            return false;
        }

        setIsRateLimited(true);
        try {
            await callback();
        } finally {
            setTimeout(() => {
                setIsRateLimited(false);
            }, cooldownMs);
        }
        return true;
    }, [isRateLimited, cooldownMs]);

    return { isRateLimited, executeWithLimit };
};
