
import { formatDistanceToNow, format as formatFn } from 'date-fns';
import { es } from 'date-fns/locale';

// Format currency to Argentine Peso
export const formatCurrency = (amount?: number): string => {
    if (amount === undefined || amount === null) return '$0';
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
    }).format(amount);
};

// Format date relative to now (e.g., "hace 2 días")
export const formatRelativeDate = (date: string | Date): string => {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
    } catch (error) {
        return 'Fecha inválida';
    }
};

// Format date to a short format (e.g., "15 Sep 2025")
export const formatShortDate = (date: string | Date): string => {
     try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return formatFn(dateObj, 'dd MMM yyyy', { locale: es });
    } catch (error) {
        return 'Fecha inválida';
    }
};


// Calculate profit margin
export const calculateMargin = (cost?: number, price?: number): number => {
    if (!cost || !price || price === 0) return 0;
    return parseFloat((((price - cost) / price) * 100).toFixed(1));
};

// Check if a date is overdue
export const isOverdue = (date: string | Date): boolean => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Compare dates only
        return new Date(date) < today;
    } catch (error) {
        return false;
    }
};

// Classify stock level
type StockStatus = { label: string; color: 'red' | 'yellow' | 'green' };
export const getStockStatus = (current: number, minimum: number): StockStatus => {
    if (current === 0) return { label: 'Sin stock', color: 'red' };
    if (current > 0 && current <= minimum) return { label: 'Stock bajo', color: 'yellow' };
    return { label: 'Stock OK', color: 'green' };
};

// Nueva función para redondear precios a la usanza argentina
export const roundArgentinianPrice = (price: number): number => {
    if (price <= 0) return 0;
    // Redondea al múltiplo de 50 más cercano
    const rounded = Math.round(price / 50) * 50;
    return rounded;
};