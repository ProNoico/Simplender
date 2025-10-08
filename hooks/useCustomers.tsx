import { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from '../lib/supabase';
import { Customer } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../contexts/AppContext';
import toast from 'react-hot-toast';

type CustomerUpdatePayload = Partial<Omit<Customer, 'id' | 'user_id' | 'created_at' | 'total_purchases'>>;

const ITEMS_PER_PAGE = 9;

export const useCustomers = (searchTerm: string = '', currentPage: number = 1) => {
    const { user } = useAuth();
    const { refreshId, triggerRefresh } = useAppContext();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [loading, setLoading] = useState(true);

    const totalPages = Math.ceil(totalCustomers / ITEMS_PER_PAGE);

    const fetchCustomers = useCallback(async () => {
        if (!user) return;
        
        setLoading(true);
        try {
            // 1. Llamar a la nueva función RPC para obtener los datos detallados
            const { data, error } = await supabaseClient.rpc('get_customer_details', {
                search_term: searchTerm,
                page_num: currentPage,
                page_size: ITEMS_PER_PAGE
            });

            // 2. Llamar a la segunda función RPC para obtener el conteo total para la paginación
            const { data: countData, error: countError } = await supabaseClient.rpc('get_customer_details_count', {
                search_term: searchTerm
            });

            if (error || countError) throw error || countError;
            
            setCustomers(data || []);
            setTotalCustomers(countData || 0);

        } catch (error: any) {
            console.error("Error fetching customer details:", error);
            toast.error('Error al cargar los clientes.');
        } finally {
            setLoading(false);
        }
    }, [user, searchTerm, currentPage, refreshId]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const fetchAllCustomers = useCallback(async () => {
        if (!user) return [];

        // Actualizamos también la función de exportar para usar la nueva RPC (sin paginación)
        const { data, error } = await supabaseClient.rpc('get_customer_details', {
            search_term: searchTerm,
            page_num: 1,
            page_size: 9999 // Un número grande para traer todos
        });

        if (error) {
            toast.error('Error al exportar los datos.');
            return [];
        }
        return data || [];
    }, [user, searchTerm]);
    
    // Las funciones de agregar, actualizar y eliminar no cambian, operan directamente sobre la tabla
    const addCustomer = async (newCustomerData: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'total_purchases' | 'last_purchase_date'>) => {
        if (!user) return { error: 'User not found' };
        try {
            const { data, error } = await supabaseClient.from('customers').insert({ ...newCustomerData, user_id: user.id }).select().single();
            if (error) throw error;
            triggerRefresh();
            toast.success('¡Cliente agregado con éxito!');
            return { data, error: null };
        } catch (error: any) {
            toast.error('No se pudo agregar el cliente.');
            return { error };
        }
    };
    
    const updateCustomer = async (customerId: string, updates: CustomerUpdatePayload) => {
        try {
            const { data, error } = await supabaseClient.from('customers').update(updates).eq('id', customerId).select().single();
            if (error) throw error;
            triggerRefresh();
            toast.success('¡Cliente actualizado!');
            return { data, error: null };
        } catch (error: any) {
            toast.error('No se pudo actualizar el cliente.');
            return { error };
        }
    };
    
    const deleteCustomer = async (customerId: string) => {
        try {
            const { error } = await supabaseClient.from('customers').delete().eq('id', customerId);
            if (error) throw error;
            triggerRefresh();
            toast.success('Cliente eliminado.');
            return { error: null };
        } catch (error: any) {
            toast.error('No se pudo eliminar el cliente.');
            return { error };
        }
    };

    return { customers, loading, addCustomer, updateCustomer, deleteCustomer, totalPages, fetchAllCustomers };
};