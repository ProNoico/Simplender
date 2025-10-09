import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { TaskCategory } from '../../types';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Select from '../shared/Select';
import { supabaseClient } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useAppContext } from '../../contexts/AppContext';
import toast from 'react-hot-toast';

const taskCategories: TaskCategory[] = ['ventas', 'marketing', 'admin', 'finanzas', 'otro'];

const taskSchema = z.object({
    title: z.string()
        .min(1, { message: 'El título es requerido.' })
        .min(3, { message: 'El título debe tener al menos 3 caracteres.' }),
    category: z.enum(taskCategories as [string, ...string[]]),
    dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;
type TaskPayload = Omit<z.infer<typeof taskSchema>, 'dueDate'> & { due_date?: string };

interface TaskFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSuccess, onCancel }) => {
    const { user } = useAuth();
    const { triggerRefresh } = useAppContext();
    
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        mode: 'onBlur',
        defaultValues: { category: 'otro' }
    });
    
    // --- INICIO DE LA CORRECCIÓN ---
    // La lógica de `addTask` ahora vive aquí y usa el cliente de Supabase directamente.
    const onSubmit: SubmitHandler<TaskFormData> = async (data) => {
        if (!user) {
            toast.error("Debes iniciar sesión para agregar una tarea.");
            return;
        }

        const taskPayload: TaskPayload = {
            title: data.title,
            category: data.category,
            due_date: data.dueDate || undefined,
        };

        try {
            const { error } = await supabaseClient
                .from('tasks')
                .insert({ ...taskPayload, user_id: user.id });

            if (error) throw error;

            toast.success('¡Tarea agregada!');
            triggerRefresh();
            onSuccess();
        } catch (error: any) {
            console.error("Error adding task:", error);
            toast.error('No se pudo agregar la tarea.');
        }
    };
    // --- FIN DE LA CORRECCIÓN ---

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                label="Título"
                registration={register('title')}
                error={errors.title?.message}
                placeholder="Ej: Preparar pedido para Lucía"
            />
            <Select
                label="Categoría"
                registration={register('category')}
                error={errors.category?.message}
            >
                {taskCategories.map(cat => (
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
            </Select>
            <Input
                label="Fecha Límite (Opcional)"
                type="date"
                registration={register('dueDate')}
                error={errors.dueDate?.message}
            />
            <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Guardar Tarea'}
                </Button>
            </div>
        </form>
    );
};

export default TaskForm;