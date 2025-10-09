import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSales, NewSalePayload } from '../../hooks/useSales';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Select from '../shared/Select';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';
import { supabaseClient } from '../../lib/supabase';
import { Product, Customer } from '../../types';
import { useAuth } from '../../contexts/AuthContext';


// Esquema de validación para el formulario
const saleSchema = z.object({
    productId: z.string().min(1, { message: 'Debes seleccionar un producto.' }),
    customerId: z.string().optional(),
    quantity: z.string()
        .min(1, { message: 'La cantidad es requerida.' })
        .transform(val => parseInt(val, 10))
        .refine(val => val > 0, { message: 'La cantidad debe ser mayor a 0.' }),
    paymentMethod: z.enum(['cash', 'card', 'transfer', 'other']),
    notes: z.string().optional(),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SaleFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ onSuccess, onCancel }) => {
    const { addSale } = useSales({ startDate: null, endDate: null }, 1);
    const { user } = useAuth();
    
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFormData = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const { data: productsData, error: productsError } = await supabaseClient
                    .from('products')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('is_active', true)
                    .order('name', { ascending: true });

                if (productsError) throw productsError;
                setAllProducts(productsData || []);

                const { data: customersData, error: customersError } = await supabaseClient
                    .from('customers')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('name', { ascending: true });
                
                if (customersError) throw customersError;
                setAllCustomers(customersData || []);

            } catch (error) {
                toast.error("No se pudieron cargar los datos del formulario.");
                console.error("Error fetching form data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFormData();
    }, [user]);

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SaleFormData>({
        resolver: zodResolver(saleSchema),
        mode: 'onBlur',
        defaultValues: {
            quantity: '1',
            paymentMethod: 'cash',
        },
    });

    const watchedProductId = watch('productId');
    const watchedQuantity = watch('quantity');

    const totalAmountPreview = React.useMemo(() => {
        const product = allProducts.find(p => p.id === watchedProductId);
        const quantity = parseInt(String(watchedQuantity), 10);
        if (product && quantity > 0) {
            return product.price * quantity;
        }
        return 0;
    }, [watchedProductId, watchedQuantity, allProducts]);

    const onSubmit: SubmitHandler<SaleFormData> = async (data) => {
        const product = allProducts.find(p => p.id === data.productId);
        if (!product) {
            toast.error("Producto no encontrado. Por favor, recarga la página.");
            return;
        }
        
        if (data.quantity > product.current_stock) {
            toast.error(`Stock insuficiente. Solo quedan ${product.current_stock} unidades.`);
            return;
        }

        const salePayload: NewSalePayload = {
            p_product_id: data.productId,
            p_quantity: data.quantity,
            p_customer_id: data.customerId || undefined,
            p_payment_method: data.paymentMethod,
            p_notes: data.notes || undefined,
        };

        const result = await addSale(salePayload);

        if (result && !result.error) {
            onSuccess();
        }
    };

    if (isLoading) {
        return <div className="text-center p-8">Cargando datos del formulario...</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Select
                label="Producto"
                registration={register('productId')}
                error={errors.productId?.message}
            >
                <option value="">Selecciona un producto...</option>
                {allProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.current_stock})</option>
                ))}
            </Select>

            <Select
                label="Cliente (Opcional)"
                registration={register('customerId')}
                error={errors.customerId?.message}
            >
                <option value="">Venta sin cliente</option>
                {allCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>

            <Input
                label="Cantidad"
                type="number"
                min="1"
                registration={register('quantity')}
                error={errors.quantity?.message}
            />

            <Select
                label="Método de Pago"
                registration={register('paymentMethod')}
                error={errors.paymentMethod?.message}
            >
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
                <option value="other">Otro</option>
            </Select>

            <div className="pt-4 text-right">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Monto Total (Aproximado)</p>
                <p className="text-2xl font-bold text-primary-500">{formatCurrency(totalAmountPreview)}</p>
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Guardar Venta'}
                </Button>
            </div>
        </form>
    );
};

export default SaleForm;