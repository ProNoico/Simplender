import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Select from '../shared/Select';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';
import { supabaseClient } from '../../lib/supabase';
import { Product, Customer } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useAppContext } from '../../contexts/AppContext';

// --- PASO 1: CREAMOS UN NUEVO SCHEMA CON VALIDACIÓN CONDICIONAL ---
const saleSchema = z.discriminatedUnion('saleType', [
    // Schema para Venta de Producto
    z.object({
        saleType: z.literal('product'),
        productId: z.string().min(1, { message: 'Debes seleccionar un producto.' }),
        quantity: z.string()
            .min(1, { message: 'La cantidad es requerida.' })
            .transform(val => parseInt(val, 10))
            .refine(val => val > 0, { message: 'La cantidad debe ser mayor a 0.' }),
    }),
    // Schema para Venta de Servicio/Libre
    z.object({
        saleType: z.literal('service'),
        description: z.string().min(3, { message: 'La descripción es requerida (mín. 3 caracteres).' }),
        amount: z.string()
            .min(1, { message: "El monto es requerido." })
            .transform(val => parseFloat(val.replace(',', '.')))
            .refine(val => val > 0, { message: "El monto debe ser mayor a 0." }),
    }),
]).and(z.object({
    // Campos comunes a ambos tipos de venta
    customerId: z.string().optional(),
    paymentMethod: z.enum(['cash', 'card', 'transfer', 'other']),
    notes: z.string().optional(),
}));

type SaleFormData = z.infer<typeof saleSchema>;

interface SaleFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ onSuccess, onCancel }) => {
    const { user } = useAuth();
    const { triggerRefresh, openModal } = useAppContext();
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { register, handleSubmit, watch, formState: { errors, isSubmitting }, control } = useForm<SaleFormData>({
        resolver: zodResolver(saleSchema),
        mode: 'onBlur',
        defaultValues: {
            saleType: 'product', // Tipo de venta por defecto
            quantity: '1',
            paymentMethod: 'cash',
        },
    });

    const saleType = watch('saleType');

    useEffect(() => {
        const fetchFormData = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const { data: productsData, error: productsError } = await supabaseClient
                    .from('products').select('*').eq('user_id', user.id).eq('is_active', true).order('name', { ascending: true });
                if (productsError) throw productsError;
                setAllProducts(productsData || []);

                const { data: customersData, error: customersError } = await supabaseClient
                    .from('customers').select('*').eq('user_id', user.id).order('name', { ascending: true });
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

    const watchedProductId = watch('productId');
    const watchedQuantity = watch('quantity');
    const totalAmountPreview = React.useMemo(() => {
        if (saleType === 'product') {
            const product = allProducts.find(p => p.id === watchedProductId);
            const quantity = parseInt(String(watchedQuantity), 10);
            if (product && quantity > 0) return product.price * quantity;
        }
        return 0;
    }, [watchedProductId, watchedQuantity, allProducts, saleType]);


    const onSubmit: SubmitHandler<SaleFormData> = async (data) => {
        if (!user) {
            toast.error('Debes iniciar sesión para registrar una venta.');
            return;
        }
        
        // Verificamos el límite del plan antes de continuar
        const { data: canCreate, error: checkError } = await supabaseClient.rpc('check_plan_limits', { p_table_name: 'sales' });
        if (checkError || !canCreate) {
            openModal('upgrade');
            return;
        }

        try {
            if (data.saleType === 'product') {
                // --- Lógica para Venta de Producto ---
                const product = allProducts.find(p => p.id === data.productId);
                if (!product) throw new Error("Producto no encontrado");
                if (data.quantity > product.current_stock) {
                    toast.error(`Stock insuficiente. Solo quedan ${product.current_stock} unidades.`);
                    return;
                }
                const { error } = await supabaseClient.rpc('handle_new_sale', {
                    p_product_id: data.productId,
                    p_quantity: data.quantity,
                    p_customer_id: data.customerId || undefined,
                    p_payment_method: data.paymentMethod,
                    p_notes: data.notes || undefined,
                });
                if (error) throw error;

            } else {
                // --- Lógica para Venta de Servicio/Libre ---
                const { error } = await supabaseClient.from('sales').insert({
                    user_id: user.id,
                    product_id: null, // Importante: el ID del producto es nulo
                    customer_id: data.customerId || null,
                    quantity: 1, // La cantidad es 1 por defecto
                    amount: data.amount,
                    payment_method: data.paymentMethod,
                    notes: data.notes,
                    product_name: data.description, // Usamos product_name para la descripción
                });
                if (error) throw error;
            }

            toast.success('¡Venta registrada con éxito!');
            triggerRefresh();
            onSuccess();

        } catch (error: any) {
            console.error("Error al registrar la venta:", error);
            toast.error('No se pudo registrar la venta. Intenta de nuevo.');
        }
    };

    if (isLoading) {
        return <div className="text-center p-8">Cargando...</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* --- PASO 2: SELECTOR DE TIPO DE VENTA --- */}
            <div>
                <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">Tipo de Venta</label>
                <div className="flex items-center gap-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 p-1">
                    <input {...register('saleType')} type="radio" value="product" id="product" className="sr-only peer/product" />
                    <label htmlFor="product" className="flex-1 text-center py-2 px-4 rounded-md cursor-pointer peer-checked/product:bg-white peer-checked/product:shadow peer-checked/product:text-primary-600 font-semibold transition-all dark:peer-checked/product:bg-neutral-800">
                        Por Producto
                    </label>
                    <input {...register('saleType')} type="radio" value="service" id="service" className="sr-only peer/service" />
                    <label htmlFor="service" className="flex-1 text-center py-2 px-4 rounded-md cursor-pointer peer-checked/service:bg-white peer-checked/service:shadow peer-checked/service:text-primary-600 font-semibold transition-all dark:peer-checked/service:bg-neutral-800">
                        Servicio / Venta Libre
                    </label>
                </div>
            </div>

            {/* --- PASO 3: CAMPOS CONDICIONALES --- */}
            {saleType === 'product' ? (
                <>
                    <Select label="Producto" registration={register('productId')} error={errors.productId?.message}>
                        <option value="">Selecciona un producto...</option>
                        {allProducts.map(p => (<option key={p.id} value={p.id}>{p.name} (Stock: {p.current_stock})</option>))}
                    </Select>
                    <Input label="Cantidad" type="number" min="1" registration={register('quantity')} error={errors.quantity?.message} />
                </>
            ) : (
                <>
                    <Input label="Descripción" registration={register('description')} error={errors.description?.message} placeholder="Ej: Taller de Bordado" />
                    <Input label="Monto Total" type="number" step="any" registration={register('amount')} error={errors.amount?.message} placeholder="Ej: 15000" />
                </>
            )}

            <Select label="Cliente (Opcional)" registration={register('customerId')} error={errors.customerId?.message}>
                <option value="">Venta sin cliente</option>
                {allCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>

            <Select label="Método de Pago" registration={register('paymentMethod')} error={errors.paymentMethod?.message}>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
                <option value="other">Otro</option>
            </Select>
            
            {saleType === 'product' && totalAmountPreview > 0 && (
                 <div className="pt-4 text-right">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Monto Total (Aproximado)</p>
                    <p className="text-2xl font-bold text-primary-500">{formatCurrency(totalAmountPreview)}</p>
                </div>
            )}
            
            <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting || isLoading}>{isSubmitting ? 'Guardando...' : 'Guardar Venta'}</Button>
            </div>
        </form>
    );
};

export default SaleForm;