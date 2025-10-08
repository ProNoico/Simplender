import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSales } from '../../hooks/useSales';
import { useProducts } from '../../hooks/useProducts';
import { useCustomers } from '../../hooks/useCustomers';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Select from '../shared/Select';
import { formatCurrency } from '../../lib/utils';

const saleSchema = z.object({
    productId: z.string().min(1, { message: 'Debes seleccionar un producto.' }),
    customerId: z.string().optional(),
    quantity: z.string()
        .min(1, { message: 'La cantidad es requerida.' })
        .transform(val => parseInt(val, 10))
        .refine(val => val > 0, { message: 'La cantidad debe ser mayor a 0.' }),
    paymentMethod: z.string().min(1, { message: 'Selecciona un método de pago.' }),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SaleFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ onSuccess, onCancel }) => {
    const { addSale } = useSales({ startDate: null, endDate: null }, 1);
    const { products } = useProducts();
    const { customers } = useCustomers();
    
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SaleFormData>({
        resolver: zodResolver(saleSchema),
        mode: 'onBlur',
    });

    const watchedProductId = watch('productId');
    const watchedQuantity = watch('quantity');
    const totalAmount = React.useMemo(() => {
        const product = products.find(p => p.id === watchedProductId);
        const quantity = parseInt(String(watchedQuantity), 10);
        if (product && quantity > 0) {
            return product.price * quantity;
        }
        return 0;
    }, [watchedProductId, watchedQuantity, products]);

    const onSubmit: SubmitHandler<SaleFormData> = async (data) => {
        const product = products.find(p => p.id === data.productId);
        if (!product) {
            alert("Producto no encontrado.");
            return;
        }

        if (data.quantity > product.current_stock) {
            alert(`Stock insuficiente. Solo quedan ${product.current_stock} unidades de "${product.name}".`);
            return;
        }

        const result = await addSale({
            product_id: data.productId,
            // --- AÑADIMOS EL NOMBRE DEL PRODUCTO AL GUARDAR ---
            product_name: product.name, 
            // ------------------------------------------------
            customer_id: data.customerId || undefined,
            quantity: data.quantity,
            amount: totalAmount,
            payment_method: data.paymentMethod as any,
        });

        if (result && !result.error) {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Select
                label="Producto"
                registration={register('productId')}
                error={errors.productId?.message}
            >
                <option value="" disabled>Selecciona un producto...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.current_stock})</option>)}
            </Select>
            
            <Select
                label="Cliente (Opcional)"
                registration={register('customerId')}
                error={errors.customerId?.message}
            >
                <option value="">Venta sin cliente</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>

            <Input
                label="Cantidad"
                type="number"
                min="1"
                registration={register('quantity')}
                error={errors.quantity?.message}
                defaultValue="1"
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
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Monto Total</p>
                <p className="text-2xl font-bold text-primary-500">{formatCurrency(totalAmount)}</p>
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