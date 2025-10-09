import React, { useState, useEffect, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Product } from '../../types';
import { useProducts } from '../../hooks/useProducts';
import Button from '../shared/Button';
import Input from '../shared/Input';
import { Info } from 'lucide-react';
import { roundArgentinianPrice, formatCurrency } from '../../lib/utils';

const productSchema = z.object({
    name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
    price: z.string()
        .min(1, { message: "El precio es requerido." })
        .refine(val => !isNaN(parseFloat(val.replace(',', '.'))), { message: "El precio debe ser un número válido." })
        .transform(val => parseFloat(val.replace(',', '.')))
        .refine(val => val > 0, { message: "El precio debe ser mayor a 0." }),
    current_stock: z.string()
        .min(1, { message: "El stock es requerido." })
        .refine(val => /^\d+$/.test(val), { message: "El stock debe ser un número entero." })
        .transform(val => parseInt(val, 10))
        .refine(val => val >= 0, { message: "El stock no puede ser negativo." }),
    cost: z.string()
        .optional()
        .refine(val => val === '' || val === undefined || !isNaN(parseFloat(val.replace(',', '.'))), { message: "El costo debe ser un número válido." })
        .transform(val => (val === '' || val === undefined ? undefined : parseFloat(val.replace(',', '.'))))
        .refine(val => val === undefined || val > 0, { message: "El costo debe ser mayor a 0." }),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
    productToEdit?: Product | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ productToEdit, onSuccess, onCancel }) => {
    const { addProduct, updateProduct } = useProducts();
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        mode: 'onBlur',
    });

    const [gainPercentage, setGainPercentage] = useState('100');
    const [shouldRound, setShouldRound] = useState(true);
    const watchedCost = watch('cost');

    useEffect(() => {
        if (productToEdit) {
            reset({
                name: productToEdit.name,
                price: String(productToEdit.price),
                current_stock: String(productToEdit.current_stock),
                cost: productToEdit.cost ? String(productToEdit.cost) : '',
            });
        } else {
            reset({ name: '', price: '', current_stock: '', cost: '' });
        }
    }, [productToEdit, reset]);

    const suggestedPrice = useMemo(() => {
        const cost = typeof watchedCost === 'number' ? watchedCost : parseFloat(String(watchedCost));
        const gain = parseFloat(gainPercentage);
        if (!cost || isNaN(cost) || cost <= 0 || isNaN(gain)) return 0;
        const calculatedPrice = cost * (1 + (gain / 100));
        return shouldRound ? roundArgentinianPrice(calculatedPrice) : calculatedPrice;
    }, [watchedCost, gainPercentage, shouldRound]);

    const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
        let result;
        const payload = { name: data.name, price: data.price, cost: data.cost, current_stock: data.current_stock };
        if (productToEdit) {
            result = await updateProduct(productToEdit.id, payload);
        } else {
            result = await addProduct({ ...payload, initial_stock: data.current_stock });
        }
        if (result && !result.error) onSuccess();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Nombre del Producto" registration={register('name')} error={errors.name?.message} />
            
            <div className="p-4 bg-neutral-50 rounded-lg space-y-3 dark:bg-neutral-700/50">
                <h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Calculadora de Precio</h4>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Costo" type="number" step="any" registration={register('cost')} error={errors.cost?.message} placeholder="Ej: 1000" />
                    <Input label="Ganancia (%)" type="number" value={gainPercentage} onChange={e => setGainPercentage(e.target.value)} placeholder="Ej: 100" name="gain" id="gain" />
                </div>
                <div className="bg-primary-50 dark:bg-primary-500/10 p-3 rounded-lg text-center">
                    <p className="text-sm text-primary-700 dark:text-primary-300">Precio Sugerido</p>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{formatCurrency(suggestedPrice)}</p>
                    {suggestedPrice > 0 && (
                        <Button type="button" size="sm" variant="ghost" className="mt-2" onClick={() => setValue('price', String(suggestedPrice), { shouldValidate: true })}>
                            Usar este precio
                        </Button>
                    )}
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                    <label htmlFor="rounding-toggle" className="text-sm text-neutral-600 dark:text-neutral-400">Redondear precio</label>
                    <input 
                        type="checkbox" 
                        id="rounding-toggle" 
                        checked={shouldRound} 
                        onChange={() => setShouldRound(!shouldRound)} 
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer dark:bg-neutral-600 dark:border-neutral-500 dark:accent-primary-500"
                    />
                    <div className="relative group">
                        <Info className="w-4 h-4 text-neutral-400 cursor-pointer" />
                        <div className="absolute bottom-full mb-2 w-48 bg-neutral-800 text-white text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Redondea el precio al múltiplo de 50 más cercano.
                        </div>
                    </div>
                </div>
            </div>
            
            <Input label="Precio de Venta (Final)" type="number" step="any" registration={register('price')} error={errors.price?.message} />
            <Input label="Stock Actual" type="number" registration={register('current_stock')} error={errors.current_stock?.message} />
            
            <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : (productToEdit ? 'Guardar Cambios' : 'Guardar Producto')}</Button>
            </div>
        </form>
    );
};

export default ProductForm;