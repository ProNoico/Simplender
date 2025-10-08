import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Customer } from '../../types';
import { useCustomers } from '../../hooks/useCustomers';
import Button from '../shared/Button';
import Input from '../shared/Input';

// 1. Esquema de validación para Clientes con Zod
const customerSchema = z.object({
    name: z.string()
        .min(1, { message: 'El nombre es requerido.' })
        .min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
    phone: z.string()
        .min(1, { message: 'El teléfono es requerido.' })
        .regex(/^[0-9]+$/, { message: 'El teléfono solo debe contener números.' }),
    email: z.string()
        .email({ message: 'El formato del email no es válido.' })
        .optional()
        .or(z.literal('')), // Permite que el campo esté vacío
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
    customerToEdit?: Customer | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customerToEdit, onSuccess, onCancel }) => {
    const { addCustomer, updateCustomer } = useCustomers('');

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        mode: 'onBlur',
    });

    useEffect(() => {
        if (customerToEdit) {
            reset({
                name: customerToEdit.name,
                phone: customerToEdit.phone,
                email: customerToEdit.email || '',
            });
        } else {
            reset({ name: '', phone: '', email: '' });
        }
    }, [customerToEdit, reset]);

    const onSubmit: SubmitHandler<CustomerFormData> = async (data) => {
        let result;
        if (customerToEdit) {
            result = await updateCustomer(customerToEdit.id, data);
        } else {
            result = await addCustomer(data);
        }

        if (result && !result.error) {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                label="Nombre"
                registration={register('name')}
                error={errors.name?.message}
                placeholder="Ej: Nombre Apellido"
            />
            <Input
                label="Teléfono"
                type="tel"
                registration={register('phone')}
                error={errors.phone?.message}
                placeholder="Ej: 1122334455"
            />
            <Input
                label="Email (Opcional)"
                type="email"
                registration={register('email')}
                error={errors.email?.message}
                placeholder="ejemplo@correo.com"
            />
            <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : (customerToEdit ? 'Guardar Cambios' : 'Guardar Cliente')}
                </Button>
            </div>
        </form>
    );
};

export default CustomerForm;