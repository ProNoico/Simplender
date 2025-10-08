import React, { useState, useMemo, useEffect } from 'react';
import { Plus, ShoppingCart, Download } from 'lucide-react';
import Button from '../components/shared/Button';
import { useSales, SalesFilter } from '../hooks/useSales';
import { Sale } from '../types';
import { formatCurrency, formatShortDate } from '../lib/utils';
import Card from '../components/shared/Card';
import { useAppContext } from '../contexts/AppContext';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import Pagination from '../components/shared/Pagination';
import SalesTableSkeleton from '../components/sales/SalesTableSkeleton';
import { exportToCsv } from '../lib/csvExporter';
import toast from 'react-hot-toast';

type PredefinedDateFilter = 'all' | 'today' | 'thisWeek' | 'thisMonth';

const Sales: React.FC = () => {
    const [activeDateFilter, setActiveDateFilter] = useState<PredefinedDateFilter>('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
    const [filters, setFilters] = useState<SalesFilter>({ startDate: null, endDate: null, paymentMethod: 'all' });
    const [currentPage, setCurrentPage] = useState(1);
    
    const { sales, loading, totalPages, fetchAllSales } = useSales(filters, currentPage);
    const { openModal } = useAppContext();

    useEffect(() => {
        const now = new Date();
        let newFilters: SalesFilter = { startDate: null, endDate: null, paymentMethod: paymentMethodFilter };

        if (activeDateFilter === 'today') newFilters = { ...newFilters, startDate: startOfDay(now).toISOString(), endDate: endOfDay(now).toISOString() };
        else if (activeDateFilter === 'thisWeek') newFilters = { ...newFilters, startDate: startOfWeek(now).toISOString(), endDate: endOfWeek(now).toISOString() };
        else if (activeDateFilter === 'thisMonth') newFilters = { ...newFilters, startDate: startOfMonth(now).toISOString(), endDate: endOfMonth(now).toISOString() };
        
        setFilters(newFilters);
        setCurrentPage(1);
    }, [activeDateFilter, paymentMethodFilter]);
    
    const handleExport = async () => {
        toast.loading('Preparando datos para exportar...');
        const allSales = await fetchAllSales();
        toast.dismiss();

        if (allSales.length > 0) {
            const columns = [
                { key: 'created_at', label: 'Fecha' },
                { key: 'product_name', label: 'Producto' },
                { key: 'customer_name', label: 'Cliente' },
                { key: 'quantity', label: 'Cantidad' },
                { key: 'amount', label: 'Monto' },
                { key: 'payment_method', label: 'Método de Pago' }
            ];
            const dataToExport = allSales.map(s => ({
                created_at: formatShortDate(s.created_at),
                product_name: s.product_name || 'N/A',
                customer_name: s.customer?.name || 'Venta sin cliente',
                quantity: s.quantity,
                amount: s.amount,
                payment_method: s.payment_method,
            }));
            exportToCsv('ventas_simplender', columns, dataToExport);
            toast.success('¡Exportación completada!');
        } else {
            toast.error('No hay ventas para exportar en el período seleccionado.');
        }
    };

    const totalFilteredSales = useMemo(() => sales.reduce((acc, sale) => acc + sale.amount, 0), [sales]);

    const translatePaymentMethod = (method: string) => ({ cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia', other: 'Otro' }[method] || method);
    
    const paymentMethodBadgeColors: { [key: string]: string } = {
        cash: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
        card: 'bg-primary-100 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400',
        transfer: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-500/10 dark:text-secondary-400',
        other: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Historial de Ventas</h1>
                <div className="flex gap-2">
                    <Button onClick={handleExport} variant="ghost" className="h-12 w-full md:w-auto">
                        <Download className="-ml-1 mr-2 h-5 w-5" />
                        Exportar
                    </Button>
                    <Button onClick={() => openModal('newSale')} className="h-12 w-full md:w-auto">
                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                        Registrar Venta
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                    <Button variant={activeDateFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setActiveDateFilter('all')}>Todas</Button>
                    <Button variant={activeDateFilter === 'today' ? 'primary' : 'ghost'} onClick={() => setActiveDateFilter('today')}>Hoy</Button>
                    <Button variant={activeDateFilter === 'thisWeek' ? 'primary' : 'ghost'} onClick={() => setActiveDateFilter('thisWeek')}>Esta Semana</Button>
                    <Button variant={activeDateFilter === 'thisMonth' ? 'primary' : 'ghost'} onClick={() => setActiveDateFilter('thisMonth')}>Este Mes</Button>
                </div>
                <div className="w-full md:w-56">
                     <select 
                        value={paymentMethodFilter}
                        onChange={(e) => setPaymentMethodFilter(e.target.value)}
                        className="w-full h-12 px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
                     >
                        <option value="all">Todos los Métodos</option>
                        <option value="cash">Efectivo</option>
                        <option value="card">Tarjeta</option>
                        <option value="transfer">Transferencia</option>
                        <option value="other">Otro</option>
                    </select>
                </div>
            </div>
            
            <Card>
                <div className="overflow-x-auto">
                    {loading ? (
                        <SalesTableSkeleton />
                    ) : sales.length > 0 ? (
                        <table className="w-full text-left">
                           <thead className="bg-neutral-50 dark:bg-neutral-700/50 border-b border-neutral-200 dark:border-neutral-700">
                                <tr>
                                    <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">Producto</th>
                                    <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">Cliente</th>
                                    <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">Fecha</th>
                                    <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">Método de Pago</th>
                                    <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300 text-right">Monto</th>
                                </tr>
                           </thead>
                           <tbody className="dark:text-neutral-300">
                                {sales.map((sale: Sale) => (
                                    <tr 
                                        key={sale.id} 
                                        className="border-b border-neutral-100 dark:border-neutral-700/50"
                                    >
                                        <td className="p-4">{sale.product_name || 'Producto eliminado'}</td>
                                        <td className="p-4 text-neutral-500 dark:text-neutral-400">{sale.customer?.name || 'Venta sin cliente'}</td>
                                        <td className="p-4 text-neutral-500 dark:text-neutral-400">{formatShortDate(sale.created_at)}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${paymentMethodBadgeColors[sale.payment_method] || ''}`}>
                                                {translatePaymentMethod(sale.payment_method)}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-right text-neutral-800 dark:text-neutral-100">{formatCurrency(sale.amount)}</td>
                                    </tr>
                                ))}
                           </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">
                            <ShoppingCart className="w-12 h-12 mx-auto text-neutral-400" />
                            <p className="mt-4 font-semibold">No se encontraron ventas para este período.</p>
                            <p className="text-sm mt-1">Intentá con otro filtro o registrá una nueva venta.</p>
                        </div>
                    )}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                {sales.length > 0 && <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 text-right font-bold text-lg text-neutral-800 dark:text-neutral-200 mt-4">Total del Período (Página): {formatCurrency(totalFilteredSales)}</div>}
            </Card>
        </div>
    );
};

export default Sales;