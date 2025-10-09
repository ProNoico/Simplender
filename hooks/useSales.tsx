import { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from '../lib/supabase';
import { Sale } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../contexts/AppContext';
import toast from 'react-hot-toast';

export interface SalesFilter {
    startDate: string | null;
    endDate: string | null;
    paymentMethod?: string | 'all';
}

const ITEMS_PER_PAGE = 10;

// EL HOOK AHORA SOLO SE ENCARGA DE LEER DATOS
export const useSales = (filters: SalesFilter, currentPage: number) => {
    const { user } = useAuth();
    const { refreshId } = useAppContext();
    const [sales, setSales] = useState<Sale[]>([]);
    const [totalSales, setTotalSales] = useState(0);
    const [loading, setLoading] = useState(true);

    const totalPages = Math.ceil(totalSales / ITEMS_PER_PAGE);

    const fetchSales = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            let query = supabaseClient
                .from('sales')
                .select(`*, customer:customer_id(name)`, { count: 'exact' })
                .eq('user_id', user.id);

            if (filters.startDate) query = query.gte('created_at', filters.startDate);
            if (filters.endDate) query = query.lte('created_at', filters.endDate);

            if (filters.paymentMethod && filters.paymentMethod !== 'all') {
                query = query.eq('payment_method', filters.paymentMethod);
            }

            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;
            
            setSales(data || []);
            setTotalSales(count || 0);

        } catch (error: any) {
            console.error("Error detallado al cargar las ventas:", error);
            toast.error('Error al cargar las ventas.');
        } finally {
            setLoading(false);
        }
    }, [user, filters, currentPage, refreshId]);

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    const fetchAllSales = useCallback(async () => {
        if (!user) return [];
        let query = supabaseClient
            .from('sales')
            .select(`*, customer:customer_id(name)`)
            .eq('user_id', user.id);

        if (filters.startDate) query = query.gte('created_at', filters.startDate);
        if (filters.endDate) query = query.lte('created_at', filters.endDate);
        if (filters.paymentMethod && filters.paymentMethod !== 'all') {
            query = query.eq('payment_method', filters.paymentMethod);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) {
            toast.error('Error al exportar los datos.');
            return [];
        }
        return data || [];
    }, [user, filters]);

    // Ya no se devuelve `addSale` desde aquí
    return { sales, loading, totalPages, fetchAllSales };
};