import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Download } from 'lucide-react';
import Button from '../components/shared/Button';
import { useProducts, StockFilter } from '../hooks/useProducts';
import ProductCard from '../components/products/ProductCard';
import { useAppContext } from '../contexts/AppContext';
import Pagination from '../components/shared/Pagination';
import { Product } from '../types';
import ProductCardSkeleton from '../components/products/ProductCardSkeleton';
import { useDebounce } from '../hooks/useDebounce';
import { exportToCsv } from '../lib/csvExporter';
import toast from 'react-hot-toast';

const Products: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState<StockFilter>('all');
    const [currentPage, setCurrentPage] = useState(1);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const { products, loading, deleteProduct, totalPages, fetchAllProducts } = useProducts(debouncedSearchTerm, stockFilter, currentPage);
    const { openModal } = useAppContext();
    
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, stockFilter]);

    const handleExport = async () => {
        toast.loading('Preparando datos para exportar...');
        const allProducts = await fetchAllProducts();
        toast.dismiss();

        if (allProducts.length > 0) {
            const columns = [
                { key: 'name', label: 'Nombre' },
                { key: 'price', label: 'Precio' },
                { key: 'cost', label: 'Costo' },
                { key: 'current_stock', label: 'Stock Actual' },
                { key: 'min_stock_alert', label: 'Alerta Stock Mínimo' }
            ];
            const dataToExport = allProducts.map(p => ({
                name: p.name,
                price: p.price,
                cost: p.cost || 0,
                current_stock: p.current_stock,
                min_stock_alert: p.min_stock_alert || 0,
            }));
            exportToCsv('productos_simplender', columns, dataToExport);
            toast.success('¡Exportación completada!');
        } else {
            toast.error('No hay productos para exportar con los filtros actuales.');
        }
    };

    const handleOpenModalForEdit = useCallback((product: Product) => {
        openModal('editProduct', product);
    }, [openModal]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Mis Productos</h1>
                <div className="flex gap-2">
                    <Button onClick={handleExport} variant="ghost" className="h-12 w-full md:w-auto">
                        <Download className="-ml-1 mr-2 h-5 w-5" />
                        Exportar
                    </Button>
                    <Button onClick={() => openModal('newProduct')} className="h-12 w-full md:w-auto">
                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                        Nuevo Producto
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input 
                        type="search" 
                        placeholder="Buscar por nombre..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full h-12 pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200 dark:placeholder-neutral-400"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant={stockFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setStockFilter('all')}>Todos</Button>
                    <Button variant={stockFilter === 'inStock' ? 'primary' : 'ghost'} onClick={() => setStockFilter('inStock')}>Con Stock</Button>
                    <Button variant={stockFilter === 'outOfStock' ? 'primary' : 'ghost'} onClick={() => setStockFilter('outOfStock')}>Sin Stock</Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, index) => <ProductCardSkeleton key={index} />)}
                </div>
            ) : (
                <>
                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} onEdit={handleOpenModalForEdit} onDelete={deleteProduct} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-neutral-800 p-12 rounded-xl shadow-card text-center text-neutral-500 dark:text-neutral-400">
                            <p className="text-lg font-semibold">No se encontraron productos.</p>
                            <p className="mt-2">Intentá ajustar tu búsqueda o filtro.</p>
                        </div>
                    )}
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default Products;