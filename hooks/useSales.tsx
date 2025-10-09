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

export interface NewSalePayload {
    p_product_id: string;
    p_quantity: number;
    p_customer_id?: string;
    p_payment_method: 'cash' | 'card' | 'transfer' | 'other';
    p_notes?: string;
}


const ITEMS_PER_PAGE = 10;

export const useSales = (filters: SalesFilter, currentPage: number) => {
    const { user } = useAuth();
    const { refreshId, triggerRefresh, openModal } = useAppContext();
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
                // --- INICIO DE LA CORRECCIÓN ---
                // Se corrige la sintaxis del join para que Supabase la interprete correctamente.
                // La sintaxis correcta es: alias:columna_fk(columnas_a_traer)
                .select(`*, customer:customer_id(name)`, { count: 'exact' })
                // --- FIN DE LA CORRECCIÓN ---
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
             // --- INICIO DE LA CORRECCIÓN ---
            .select(`*, customer:customer_id(name)`)
            // --- FIN DE LA CORRECCIÓN ---
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

    const addSale = async (newSaleData: NewSalePayload) => {
        if (!user) return { error: 'User not found' };

        const { data: canCreate, error: checkError } = await supabaseClient.rpc('check_plan_limits', { p_table_name: 'sales' });
        if (checkError || !canCreate) {
            openModal('upgrade');
            return { error: 'Plan limit reached' };
        }

        try {
            const { error } = await supabaseClient.rpc('handle_new_sale', newSaleData);

            if (error) {
                if (error.message.includes('stock_insufficient')) {
                    toast.error('No hay stock suficiente para esta venta.');
                } else {
                    throw error;
                }
                return { error };
            }

            toast.success('¡Venta registrada con éxito!');
            triggerRefresh();
            return { error: null };

        } catch (error: any) {
            console.error("Error en transacción de venta:", error);
            toast.error('No se pudo registrar la venta. Intenta de nuevo.');
            return { error };
        }
    };

    return { sales, loading, addSale, totalPages, fetchAllSales };
};