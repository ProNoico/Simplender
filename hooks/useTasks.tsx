import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabaseClient } from '../lib/supabase';
import { Task, TaskCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../contexts/AppContext';
import toast from 'react-hot-toast';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

type TaskPayload = Omit<Task, 'id' | 'user_id' | 'created_at' | 'is_completed'>;

export type DateFilter = 'all' | 'today' | 'thisWeek';
export type CategoryFilter = TaskCategory | 'all';

export interface TaskFilters {
    date: DateFilter;
    category: CategoryFilter;
}

export const useTasks = (filters: TaskFilters) => {
    const { user } = useAuth();
    const { refreshId, triggerRefresh } = useAppContext();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = useCallback(async () => {
        if (!user) return;
        
        setLoading(true);
        try {
            let query = supabaseClient
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (filters.category !== 'all') {
                query = query.eq('category', filters.category);
            }

            const now = new Date();
            if (filters.date === 'today') {
                // CORRECCIÓN: Aplicar filtro de fecha solo a tareas que tienen una fecha
                query = query.not('due_date', 'is', null)
                               .gte('due_date', startOfDay(now).toISOString())
                               .lte('due_date', endOfDay(now).toISOString());
            } else if (filters.date === 'thisWeek') {
                // CORRECCIÓN: Aplicar filtro de fecha solo a tareas que tienen una fecha
                query = query.not('due_date', 'is', null)
                               .gte('due_date', startOfWeek(now).toISOString())
                               .lte('due_date', endOfWeek(now).toISOString());
            }

            const { data, error } = await query;

            if (error) throw error;
            setTasks(data || []);
        } catch (error: any) {
            // MEJORA: Mostrar el error real en la consola para futura depuración
            console.error("Error fetching tasks:", error);
            toast.error('Error al cargar las tareas.');
        } finally {
            setLoading(false);
        }
    }, [user, filters, refreshId]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const addTask = async (newTaskData: TaskPayload) => {
        if (!user) return { error: 'User not found' };
        try {
            const { data, error } = await supabaseClient.from('tasks').insert({ ...newTaskData, user_id: user.id }).select().single();
            if (error) throw error;
            
            toast.success('¡Tarea agregada!');
            triggerRefresh();
            return { data, error: null };
        } catch (error: any) {
            toast.error('No se pudo agregar la tarea.');
            return { error };
        }
    };

    const toggleComplete = async (taskId: string, isCompleted: boolean) => {
        try {
            const { data, error } = await supabaseClient.from('tasks').update({ is_completed: !isCompleted }).eq('id', taskId).select().single();
            if (error) throw error;
            
            toast.success(data.is_completed ? '¡Bien hecho! Tarea completada.' : 'Tarea marcada como pendiente.');
            triggerRefresh();
            return { data, error: null };
        } catch (error: any) {
            toast.error('No se pudo actualizar la tarea.');
            return { error };
        }
    };
    
    const deleteTask = async (taskId: string) => {
        try {
            const { error } = await supabaseClient.from('tasks').delete().eq('id', taskId);
            if (error) throw error;

            toast.success('Tarea eliminada.');
            triggerRefresh();
            return { error: null };
        } catch (error: any) {
            toast.error('No se pudo eliminar la tarea.');
            return { error };
        }
    };

    const pendingTasks = useMemo(() => tasks.filter(t => !t.is_completed).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [tasks]);
    const completedTasks = useMemo(() => tasks.filter(t => t.is_completed).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [tasks]);

    return {
        pendingTasks,
        completedTasks,
        loading,
        addTask,
        toggleComplete,
        deleteTask,
    };
};