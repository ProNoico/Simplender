import React, { memo } from 'react'; // 1. Importar memo
import { Product } from '../../types';
import Card from '../shared/Card';
import { formatCurrency, getStockStatus } from '../../lib/utils';
import { Edit, Trash2 } from 'lucide-react';
import Button from '../shared/Button';

interface ProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
}

// 2. Envolvemos el componente con React.memo
const ProductCard: React.FC<ProductCardProps> = memo(({ product, onEdit, onDelete }) => {
    const stockStatus = getStockStatus(product.current_stock, product.min_stock_alert || 0);

    const statusColors = {
        red: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
        yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
        green: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    };

    const handleDelete = () => {
        if (window.confirm(`¿Estás segura de que quieres eliminar "${product.name}"? Esta acción no se puede deshacer.`)) {
            onDelete(product.id);
        }
    };

    return (
        <Card>
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-200 mb-2">{product.name}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[stockStatus.color]}`}>
                        {stockStatus.label}
                    </span>
                </div>
                <p className="text-2xl font-bold text-primary-500">{formatCurrency(product.price)}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Stock: {product.current_stock} unidades</p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-700/30 px-5 py-3 border-t dark:border-neutral-700/50 flex items-center justify-end gap-2">
                 <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </Card>
    );
});

export default ProductCard;