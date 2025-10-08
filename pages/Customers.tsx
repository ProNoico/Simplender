import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Download } from 'lucide-react';
import Button from '../components/shared/Button';
import { useCustomers } from '../hooks/useCustomers';
import CustomerCard from '../components/customers/CustomerCard';
import { useAppContext } from '../contexts/AppContext';
import Pagination from '../components/shared/Pagination';
import { Customer } from '../types';
import CustomerCardSkeleton from '../components/customers/CustomerCardSkeleton';
import { useDebounce } from '../hooks/useDebounce';
import { exportToCsv } from '../lib/csvExporter';
import toast from 'react-hot-toast';

const Customers: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    
    const { customers, loading, deleteCustomer, totalPages, fetchAllCustomers } = useCustomers(debouncedSearchTerm, currentPage);
    const { openModal } = useAppContext();
    
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);

    const handleExport = async () => {
        toast.loading('Preparando datos para exportar...');
        const allCustomers = await fetchAllCustomers();
        toast.dismiss();

        if (allCustomers.length > 0) {
            const columns = [
                { key: 'name', label: 'Nombre' },
                { key: 'phone', label: 'Teléfono' },
                { key: 'email', label: 'Email' },
                { key: 'total_purchases', label: 'Compras Totales' },
                { key: 'last_purchase_date', label: 'Última Compra' }
            ];
            const dataToExport = allCustomers.map(c => ({
                name: c.name,
                phone: c.phone,
                email: c.email || '',
                total_purchases: c.total_purchases,
                last_purchase_date: c.last_purchase_date || '',
            }));
            exportToCsv('clientes_simplender', columns, dataToExport);
            toast.success('¡Exportación completada!');
        } else {
            toast.error('No hay clientes para exportar con los filtros actuales.');
        }
    };

    const handleOpenModalForEdit = useCallback((customer: Customer) => {
        openModal('editCustomer', customer);
    }, [openModal]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Mis Clientes</h1>
                <div className="flex gap-2">
                    <Button onClick={handleExport} variant="ghost" className="h-12 w-full md:w-auto">
                        <Download className="-ml-1 mr-2 h-5 w-5" />
                        Exportar
                    </Button>
                    <Button onClick={() => openModal('newCustomer')} className="h-12 w-full md:w-auto">
                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                        Nuevo Cliente
                    </Button>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input 
                        type="search" 
                        placeholder="Buscar por nombre o teléfono..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full h-12 pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200 dark:placeholder-neutral-400" 
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, index) => <CustomerCardSkeleton key={index} />)}
                </div>
            ) : (
                <>
                    {customers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                            {customers.map(customer => (
                                <CustomerCard key={customer.id} customer={customer} onEdit={handleOpenModalForEdit} onDelete={deleteCustomer} />
                            ))}
                        </div>
                    ) : (
                         <div className="bg-white dark:bg-neutral-800 p-12 rounded-xl shadow-card text-center text-neutral-500 dark:text-neutral-400">
                            <p className="text-lg font-semibold">No se encontraron clientes.</p>
                            <p className="mt-2">Intentá con otro término de búsqueda.</p>
                        </div>
                    )}
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default Customers;