import { useState, useEffect } from 'react';

// Este hook toma un valor y un tiempo de retraso (delay).
// Solo actualizará el valor devuelto después de que el `value` no haya cambiado durante el `delay`.
// La coma después de <T,> resuelve la ambigüedad en archivos .tsx
export const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Se crea un temporizador que actualizará el valor "debounced" después del delay.
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Si el `value` cambia (el usuario sigue escribiendo),
        // se limpia el temporizador anterior y se crea uno nuevo.
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Solo se re-ejecuta si el valor o el delay cambian

    return debouncedValue;
};