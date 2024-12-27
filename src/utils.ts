import { useContext } from 'react';

export function useContextOrThrow<T>(context: React.Context<T | null>, errorMessage: string): T {
    const value = useContext(context);
    if (!value) {
        throw new Error(errorMessage);
    }
    return value;
}
