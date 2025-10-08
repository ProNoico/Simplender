import { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from '../lib/supabase';
import { Expense, ExpenseCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../contexts/AppContext';
import toast from 'react-hot-toast';

export interface ExpenseFilter {
    startDate: string | null;
    endDate: string | null;
    category?: ExpenseCategory | 'all';
}

const ITEMS_PER_PAGE = 10;

export const useExpenses = (filters: ExpenseFilter, currentPage: number) => {
    const { user } = useAuth();
    const { refreshId, triggerRefresh } = useAppContext();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [loading, setLoading] = useState(true);

    const totalPages = Math.ceil(totalExpenses / ITEMS_PER_PAGE);

    const fetchExpenses = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            let query = supabaseClient
                .from('expenses')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id);

            if (filters.startDate) query = query.gte('expense_date', filters.startDate);
            if (filters.endDate) query = query.lte('expense_date', filters.endDate);
            if (filters.category && filters.category !== 'all') {
                query = query.eq('category', filters.category);
            }

            const { data, error, count } = await query
                .order('expense_date', { ascending: false })
                .range(from, to);

            if (error) throw error;
            
            setExpenses(data || []);
            setTotalExpenses(count || 0);

        } catch (error: any) {
            console.error("Error fetching expenses:", error);
            toast.error('Error al cargar los gastos.');
        } finally {
            setLoading(false);
        }
    }, [user, filters, currentPage, refreshId]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    // --- NUEVA FUNCIÓN PARA OBTENER TODOS LOS GASTOS ---
    const fetchAllExpenses = useCallback(async () => {
        if (!user) return [];
        
        let query = supabaseClient
            .from('expenses')
            .select('*')
            .eq('user_id', user.id);

        if (filters.startDate) query = query.gte('expense_date', filters.startDate);
        if (filters.endDate) query = query.lte('expense_date', filters.endDate);
        if (filters.category && filters.category !== 'all') {
            query = query.eq('category', filters.category);
        }

        const { data, error } = await query.order('expense_date', { ascending: false });

        if (error) {
            toast.error('Error al exportar los datos.');
            return [];
        }
        return data || [];
    }, [user, filters]);
    // --------------------------------------------------

    const addExpense = async (newExpenseData: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => {
        if (!user) return { error: 'User not found' };
        try {
            const { data, error } = await supabaseClient.from('expenses').insert({ ...newExpenseData, user_id: user.id }).select().single();
            if (error) throw error;
            toast.success('¡Gasto registrado con éxito!');
            triggerRefresh();
            return { data, error: null };
        } catch (error: any) {
            toast.error('No se pudo registrar el gasto.');
            return { error };
        }
    };

    const updateExpense = async (expenseId: string, updates: Partial<Omit<Expense, 'id' | 'user_id' | 'created_at'>>) => {
        try {
            const { data, error } = await supabaseClient.from('expenses').update(updates).eq('id', expenseId).select().single();
            if (error) throw error;
            toast.success('¡Gasto actualizado!');
            triggerRefresh();
            return { data, error: null };
        } catch (error: any) {
            toast.error('No se pudo actualizar el gasto.');
            return { error };
        }
    };
    
    const deleteExpense = async (expenseId: string) => {
        try {
            const { error } = await supabaseClient.from('expenses').delete().eq('id', expenseId);
            if (error) throw error;
            toast.success('Gasto eliminado.');
            triggerRefresh();
            return { error: null };
        } catch (error: any) {
            toast.error('No se pudo eliminar el gasto.');
            return { error };
        }
    };

    return { expenses, loading, addExpense, updateExpense, deleteExpense, totalPages, fetchAllExpenses };
};