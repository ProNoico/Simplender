import React, { useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTasks } from '../../hooks/useTasks';
import type { TaskCategory } from '../../types';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Select from '../shared/Select';

const taskCategories: TaskCategory[] = ['ventas', 'marketing', 'admin', 'finanzas', 'otro'];

const taskSchema = z.object({
    title: z.string()
        .min(1, { message: 'El título es requerido.' })
        .min(3, { message: 'El título debe tener al menos 3 caracteres.' }),
    category: z.enum(taskCategories as [string, ...string[]]),
    dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSuccess, onCancel }) => {
    const filters = useMemo(() => ({ date: 'all', category: 'all' } as const), []);
    const { addTask } = useTasks(filters);
    
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        mode: 'onBlur',
        defaultValues: {
            category: 'otro',
        }
    });

    const onSubmit: SubmitHandler<TaskFormData> = async (data) => {
        const result = await addTask({
            title: data.title,
            category: data.category,
            due_date: data.dueDate || undefined,
        });

        if (result && !result.error) {
            onSuccess();
        }
    };

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