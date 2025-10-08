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

            // Simplificamos la consulta: ya no necesitamos el JOIN a `products`
            let query = supabaseClient
                .from('sales')
                .select(`*, customer:customers(name)`, { count: 'exact' })
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
            .select(`*, customer:customers(name)`)
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

    const addSale = async (newSaleData: Omit<Sale, 'id' | 'user_id' | 'created_at'>) => {
        if (!user) return { error: 'User not found' };

        const { data: canCreate, error: checkError } = await supabaseClient.rpc('check_plan_limits', { p_table_name: 'sales' });
        if (checkError || !canCreate) {
            openModal('upgrade');
            return { error: 'Plan limit reached' };
        }

        try {
            const { data: productData, error: productError } = await supabaseClient.from('products').select('current_stock').eq('id', newSaleData.product_id).single();
            if (productError || !productData) throw new Error('Producto no encontrado.');
            const newStock = productData.current_stock - newSaleData.quantity;
            if (newStock < 0) {
                toast.error('No hay stock suficiente para esta venta.');
                return { error: 'Stock insuficiente' };
            }
            // El `newSaleData` ahora incluye el `product_name` gracias al formulario
            await supabaseClient.from('sales').insert({ ...newSaleData, user_id: user.id });
            await supabaseClient.from('products').update({ current_stock: newStock }).eq('id', newSaleData.product_id);
            if (newSaleData.customer_id) {
                await supabaseClient.rpc('increment_customer_purchases', { p_customer_id: newSaleData.customer_id });
            }
            toast.success('¡Venta registrada con éxito!');
            triggerRefresh();
            return { error: null };
        } catch (error: any) {
            toast.error('No se pudo registrar la venta.');
            return { error };
        }
    };

    return { sales, loading, addSale, totalPages, fetchAllSales };
};