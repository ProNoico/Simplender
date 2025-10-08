import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Expense, ExpenseCategory } from '../../types';
import { useExpenses } from '../../hooks/useExpenses';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Select from '../shared/Select';
import { format } from 'date-fns';

const expenseCategories: ExpenseCategory[] = ['proveedores', 'servicios', 'marketing', 'impuestos', 'otro'];

const expenseSchema = z.object({
    description: z.string().min(3, { message: 'La descripción debe tener al menos 3 caracteres.' }),
    amount: z.string()
        .min(1, { message: "El monto es requerido." })
        .refine(val => !isNaN(parseFloat(val.replace(',', '.'))), { message: "El monto debe ser un número válido." })
        .transform(val => parseFloat(val.replace(',', '.')))
        .refine(val => val > 0, { message: "El monto debe ser mayor a 0." }),
    category: z.enum(expenseCategories as [string, ...string[]]),
    expense_date: z.string().min(1, { message: 'La fecha es requerida.' }),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
    expenseToEdit?: Expense | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expenseToEdit, onSuccess, onCancel }) => {
    // Usamos el hook con filtros y paginación por defecto, ya que solo necesitamos las funciones de mutación
    const { addExpense, updateExpense } = useExpenses({ startDate: null, endDate: null }, 1);
    
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        mode: 'onBlur',
    });

    useEffect(() => {
        if (expenseToEdit) {
            reset({
                description: expenseToEdit.description,
                amount: String(expenseToEdit.amount),
                category: expenseToEdit.category,
                expense_date: format(new Date(expenseToEdit.expense_date), 'yyyy-MM-dd'),
            });
        } else {
            reset({
                description: '',
                amount: '',
                category: 'otro',
                expense_date: format(new Date(), 'yyyy-MM-dd'),
            });
        }
    }, [expenseToEdit, reset]);

    const onSubmit: SubmitHandler<ExpenseFormData> = async (data) => {
        let result;
        if (expenseToEdit) {
            result = await updateExpense(expenseToEdit.id, data);
        } else {
            result = await addExpense(data);
        }
        if (result && !result.error) {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                label="Descripción del Gasto"
                registration={register('description')}
                error={errors.description?.message}
                placeholder="Ej: Compra de materiales"
            />
            <Input
                label="Monto"
                type="number"
                step="any"
                registration={register('amount')}
                error={errors.amount?.message}
                placeholder="Ej: 15000"
            />
            <Select
                label="Categoría"
                registration={register('category')}
                error={errors.category?.message}
            >
                {expenseCategories.map(cat => (
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
            </Select>
            <Input
                label="Fecha del Gasto"
                type="date"
                registration={register('expense_date')}
                error={errors.expense_date?.message}
            />
            <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : (expenseToEdit ? 'Guardar Cambios' : 'Guardar Gasto')}
                </Button>
            </div>
        </form>
    );
};

export default ExpenseForm;