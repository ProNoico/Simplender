import { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from '../lib/supabase';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../contexts/AppContext';
import toast from 'react-hot-toast';

type ProductUpdatePayload = Partial<Omit<Product, 'id' | 'user_id' | 'created_at'>>;
export type StockFilter = 'all' | 'inStock' | 'outOfStock';

const ITEMS_PER_PAGE = 8;

export const useProducts = (searchTerm: string = '', stockFilter: StockFilter = 'all', currentPage: number = 1) => {
    const { user } = useAuth();
    const { refreshId, triggerRefresh, openModal } = useAppContext();
    const [products, setProducts] = useState<Product[]>([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [loading, setLoading] = useState(true);

    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

    const fetchProducts = useCallback(async () => {
        if (!user) return;
        
        setLoading(true);
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            let query = supabaseClient
                .from('products')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id);

            if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);
            if (stockFilter === 'inStock') query = query.gt('current_stock', 0);
            else if (stockFilter === 'outOfStock') query = query.eq('current_stock', 0);
            
            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            setProducts(data || []);
            setTotalProducts(count || 0);

        } catch (error: any) {
            toast.error('Error al cargar los productos.');
        } finally {
            setLoading(false);
        }
    }, [user, searchTerm, stockFilter, currentPage, refreshId]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);
    
    // --- NUEVA FUNCIÓN PARA OBTENER TODOS LOS PRODUCTOS ---
    const fetchAllProducts = useCallback(async () => {
        if (!user) return [];

        let query = supabaseClient
            .from('products')
            .select('*')
            .eq('user_id', user.id);

        if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);
        if (stockFilter === 'inStock') query = query.gt('current_stock', 0);
        else if (stockFilter === 'outOfStock') query = query.eq('current_stock', 0);
        
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            toast.error('Error al exportar los datos.');
            return [];
        }
        return data || [];
    }, [user, searchTerm, stockFilter]);
    // ------------------------------------------------------

    const addProduct = async (newProductData: Omit<Product, 'id' | 'user_id' | 'created_at'>) => {
        if (!user) return { error: 'User not found' };

        const { data: canCreate, error: checkError } = await supabaseClient.rpc('check_plan_limits', { p_table_name: 'products' });
        if (checkError || !canCreate) {
            openModal('upgrade');
            return { error: 'Plan limit reached' };
        }
        
        try {
            const { data, error } = await supabaseClient.from('products').insert({ ...newProductData, user_id: user.id }).select().single();
            if (error) throw error;
            triggerRefresh();
            toast.success('¡Producto agregado con éxito!');
            return { data, error: null };
        } catch (error: any) {
            toast.error('No se pudo agregar el producto.');
            return { error };
        }
    };

    const updateProduct = async (productId: string, updates: ProductUpdatePayload) => {
        try {
            const { data, error } = await supabaseClient.from('products').update(updates).eq('id', productId).select().single();
            if (error) throw error;
            triggerRefresh();
            toast.success('¡Producto actualizado!');
            return { data, error: null };
        } catch (error: any) {
            toast.error('No se pudo actualizar el producto.');
            return { error };
        }
    };

    const deleteProduct = async (productId: string) => {
        try {
            const { error } = await supabaseClient.from('products').delete().eq('id', productId);
            if (error) throw error;
            triggerRefresh();
            toast.success('Producto eliminado.');
            return { error: null };
        } catch (error: any) {
            toast.error('No se pudo eliminar el producto.');
            return { error };
        }
    };

    return { products, loading, addProduct, updateProduct, deleteProduct, totalPages, fetchAllProducts };
};