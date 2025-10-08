import React, { memo, useState } from 'react'; // 1. Importar useState
import { Customer } from '../../types';
import Card from '../shared/Card';
import { formatRelativeDate, formatCurrency } from '../../lib/utils';
import { Pencil, Trash2, MessageCircle, Info } from 'lucide-react';
import Button from '../shared/Button';
import { useAppContext } from '../../contexts/AppContext';

interface CustomerCardProps {
    customer: Customer;
    onEdit: (customer: Customer) => void;
    onDelete: (customerId: string) => Promise<{ error: any; } | null>;
}

const CustomerCard: React.FC<CustomerCardProps> = memo(({ customer, onEdit, onDelete }) => {
    const { openModal } = useAppContext();
    // 2. Añadir estado para controlar la visibilidad del tooltip
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    const handleDelete = async () => {
        if (window.confirm(`¿Estás segura de que quieres eliminar a ${customer.name}? Esta acción es irreversible.`)) {
            await onDelete(customer.id);
        }
    };

    const openWhatsAppChat = () => {
        if (customer.phone) {
            const phoneNumber = customer.phone.replace(/\D/g, '');
            const message = `¡Hola ${customer.name}! Te escribo desde Simplender.`;
            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
        } else {
            alert('Este cliente no tiene un número de teléfono registrado.');
        }
    };

    const handleViewPurchases = () => {
        openModal('customerPurchases', customer);
    };

    return (
        <Card className="flex flex-col justify-between">
            <div className="p-6">
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">{customer.name}</h3>
                {customer.phone && <p className="text-neutral-600 dark:text-neutral-300 mt-1">{customer.phone}</p>}
                
                <div 
                    className="mt-4 space-y-2 text-sm text-neutral-500 dark:text-neutral-400 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 -mx-2 px-2 py-1 rounded-lg"
                    onClick={handleViewPurchases}
                    title="Ver historial de compras"
                >
                    {customer.last_purchase_date ? (
                        <div>
                            <p>Última compra: {formatRelativeDate(customer.last_purchase_date)}</p>
                            {customer.last_purchase_product_name && (
                                <p className="text-xs text-neutral-400">
                                    {customer.last_purchase_product_name} - {formatCurrency(customer.last_purchase_amount)}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p>Aún no ha realizado compras.</p>
                    )}
                    <p>Compras totales: {customer.total_purchases}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700/50">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-neutral-700 dark:text-neutral-300">CLV</h4>
                        {/* ----- INICIO DE LA CORRECCIÓN DEFINITIVA ----- */}
                        <div 
                            className="relative"
                            onMouseEnter={() => setIsTooltipVisible(true)}
                            onMouseLeave={() => setIsTooltipVisible(false)}
                        >
                            <Info className="w-4 h-4 text-neutral-400 cursor-pointer" />
                            <div 
                                className={`absolute bottom-full mb-2 w-64 bg-neutral-800 text-white text-xs rounded py-2 px-3 text-center transition-opacity duration-300 z-10 ${isTooltipVisible ? 'opacity-100' : 'opacity-0 invisible'}`}
                            >
                                El "Customer Lifetime Value" representa el ingreso total que un cliente ha generado. Es una métrica clave para medir su valor a largo plazo.
                            </div>
                        </div>
                        {/* ------ FIN DE LA CORRECCIÓN DEFINITIVA ------ */}
                    </div>
                    <p className="text-2xl font-bold text-primary-500">{formatCurrency(customer.clv)}</p>
                </div>
            </div>

            <div className="flex justify-end p-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-700/50 gap-2">
                {customer.phone && (
                    <Button variant="ghost" size="icon" onClick={openWhatsAppChat} aria-label="Enviar mensaje por WhatsApp">
                        <MessageCircle className="w-5 h-5 text-green-600" />
                    </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onEdit(customer)} aria-label="Editar cliente">
                    <Pencil className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDelete} aria-label="Eliminar cliente">
                    <Trash2 className="w-5 h-5 text-red-500" />
                </Button>
            </div>
        </Card>
    );
});

export default CustomerCard;