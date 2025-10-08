import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../lib/supabase';
import { Customer } from '../../types';
import { formatCurrency, formatShortDate } from '../../lib/utils';
import LoadingSpinner from '../shared/LoadingSpinner';
import { ShoppingCart } from 'lucide-react';

interface CustomerPurchasesModalProps {
    customer: Customer;
}

interface PurchaseHistoryItem {
    id: string;
    created_at: string;
    amount: number;
    product_name: string;
}

const CustomerPurchasesModal: React.FC<CustomerPurchasesModalProps> = ({ customer }) => {
    const [purchases, setPurchases] = useState<PurchaseHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPurchases = async () => {
            setLoading(true);
            const { data, error } = await supabaseClient.rpc('get_sales_by_customer', {
                p_customer_id: customer.id
            });

            if (error) {
                console.error("Error fetching purchase history:", error);
            } else {
                setPurchases(data || []);
            }
            setLoading(false);
        };

        fetchPurchases();
    }, [customer.id]);

    if (loading) {
        return <div className="flex justify-center items-center h-48"><LoadingSpinner /></div>;
    }

    return (
        <div className="max-h-[60vh] overflow-y-auto">
            {purchases.length > 0 ? (
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-white dark:bg-neutral-800">
                        <tr>
                            <th className="p-3 font-semibold text-neutral-600 dark:text-neutral-300">Producto</th>
                            <th className="p-3 font-semibold text-neutral-600 dark:text-neutral-300">Fecha</th>
                            <th className="p-3 font-semibold text-neutral-600 dark:text-neutral-300 text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody className="dark:text-neutral-300">
                        {purchases.map(purchase => (
                            <tr key={purchase.id} className="border-t border-neutral-100 dark:border-neutral-700">
                                <td className="p-3">{purchase.product_name || 'Producto no disponible'}</td>
                                <td className="p-3 text-neutral-500 dark:text-neutral-400">{formatShortDate(purchase.created_at)}</td>
                                <td className="p-3 font-medium text-right">{formatCurrency(purchase.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">
                    <ShoppingCart className="w-12 h-12 mx-auto text-neutral-400" />
                    <p className="mt-4 font-semibold">Este cliente aún no tiene compras registradas.</p>
                </div>
            )}
        </div>
    );
};

export default CustomerPurchasesModal;