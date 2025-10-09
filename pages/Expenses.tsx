import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, TrendingDown, Download } from 'lucide-react';
import Button from '../components/shared/Button';
import Card from '../components/shared/Card';
import Pagination from '../components/shared/Pagination';
import { useAppContext } from '../contexts/AppContext';
import { useExpenses, ExpenseFilter } from '../hooks/useExpenses';
import { Expense, ExpenseCategory } from '../types';
import { formatCurrency, formatShortDate } from '../lib/utils';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { exportToCsv } from '../lib/csvExporter';
import toast from 'react-hot-toast';
import ExpensesTableSkeleton from '../components/expenses/ExpensesTableSkeleton';

type PredefinedDateFilter = 'all' | 'today' | 'thisWeek' | 'thisMonth';
const expenseCategories: ExpenseCategory[] = ['proveedores', 'servicios', 'marketing', 'impuestos', 'otro'];

const Expenses: React.FC = () => {
    const [activeDateFilter, setActiveDateFilter] = useState<PredefinedDateFilter>('all');
    const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    
    // --- INICIO DE LA CORRECCIÓN ---
    // Usamos useMemo para crear el objeto de filtros de forma más eficiente y predecible.
    const filters = useMemo(() => {
        const now = new Date();
        let newFilters: ExpenseFilter = { startDate: null, endDate: null, category: categoryFilter };

        if (activeDateFilter === 'today') {
            newFilters = { ...newFilters, startDate: startOfDay(now).toISOString(), endDate: endOfDay(now).toISOString() };
        } else if (activeDateFilter === 'thisWeek') {
            newFilters = { ...newFilters, startDate: startOfWeek(now).toISOString(), endDate: endOfWeek(now).toISOString() };
        } else if (activeDateFilter === 'thisMonth') {
            newFilters = { ...newFilters, startDate: startOfMonth(now).toISOString(), endDate: endOfMonth(now).toISOString() };
        }
        
        return newFilters;
    }, [activeDateFilter, categoryFilter]);
    
    // Este useEffect ahora solo se encarga de resetear la página cuando cambian los filtros.
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);
    // --- FIN DE LA CORRECCIÓN ---
    
    const { expenses, loading, deleteExpense, totalPages, fetchAllExpenses } = useExpenses(filters, currentPage);
    const { openModal } = useAppContext();


    const handleExport = async () => {
        toast.loading('Preparando datos para exportar...');
        const allExpenses = await fetchAllExpenses();
        toast.dismiss();

        if (allExpenses && allExpenses.length > 0) {
            const columns = [
                { key: 'description', label: 'Descripción' },
                { key: 'amount', label: 'Monto' },
                { key: 'category', label: 'Categoría' },
                { key: 'expense_date', label: 'Fecha' }
            ];
            const dataToExport = allExpenses.map(e => ({
                description: e.description,
                amount: e.amount,
                category: e.category,
                expense_date: e.expense_date,
            }));
            exportToCsv('gastos_simplender', columns, dataToExport);
            toast.success('¡Exportación completada!');
        } else {
            toast.error('No hay gastos para exportar en el período seleccionado.');
        }
    };

    const totalFilteredExpenses = useMemo(() => {
        if (!Array.isArray(expenses)) return 0;
        return expenses.reduce((acc, expense) => acc + (expense.amount || 0), 0);
    }, [expenses]);


    const handleEdit = useCallback((expense: Expense) => {
        openModal('editExpense', expense);
    }, [openModal]);

    const handleDelete = useCallback(async (expenseId: string) => {
        if (window.confirm('¿Estás segura de que quieres eliminar este gasto?')) {
            await deleteExpense(expenseId);
        }
    }, [deleteExpense]);

    const categoryBadgeColors: { [key: string]: string } = {
        proveedores: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
        servicios: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
        marketing: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
        impuestos: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
        otro: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Mis Gastos</h1>
                <div className="flex gap-2">
                    <Button onClick={handleExport} variant="ghost" className="h-12 w-full md:w-auto">
                        <Download className="-ml-1 mr-2 h-5 w-5" />
                        Exportar
                    </Button>
                    <Button onClick={() => openModal('newExpense')} className="h-12 w-full md:w-auto">
                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                        Registrar Gasto
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                    <Button variant={activeDateFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setActiveDateFilter('all')}>Todos</Button>
                    <Button variant={activeDateFilter === 'today' ? 'primary' : 'ghost'} onClick={() => setActiveDateFilter('today')}>Hoy</Button>
                    <Button variant={activeDateFilter === 'thisWeek' ? 'primary' : 'ghost'} onClick={() => setActiveDateFilter('thisWeek')}>Esta Semana</Button>
                    <Button variant={activeDateFilter === 'thisMonth' ? 'primary' : 'ghost'} onClick={() => setActiveDateFilter('thisMonth')}>Este Mes</Button>
                </div>
                <div className="w-full md:w-56">
                     <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | 'all')}
                        className="w-full h-12 px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
                     >
                        <option value="all">Todas las Categorías</option>
                        {expenseCategories.map(cat => (
                            <option key={cat} value={cat} className="capitalize">{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    {loading ? (
                        <ExpensesTableSkeleton />
                    ) : expenses && expenses.length > 0 ? (
                        <table className="w-full text-left">
                           <thead className="bg-neutral-50 dark:bg-neutral-700/50 border-b border-neutral-200 dark:border-neutral-700">
                                <tr>
                                    <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">Descripción</th>
                                    <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">Fecha</th>
                                    <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">Categoría</th>
                                    <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300 text-right">Monto</th>
                                    <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300 text-center">Acciones</th>
                                </tr>
                           </thead>
                           <tbody className="dark:text-neutral-300">
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className="border-b border-neutral-100 dark:border-neutral-700/50">
                                        <td className="p-4 font-medium">{expense.description}</td>
                                        <td className="p-4 text-neutral-500 dark:text-neutral-400">{formatShortDate(expense.expense_date)}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${categoryBadgeColors[expense.category] || ''}`}>
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-right text-red-600 dark:text-red-400">{formatCurrency(expense.amount)}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}><Edit className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                           </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">
                            <TrendingDown className="w-12 h-12 mx-auto text-neutral-400" />
                            <p className="mt-4 font-semibold">Aún no has registrado ningún gasto.</p>
                            <p className="text-sm mt-1">Hacé clic en "Registrar Gasto" para empezar.</p>
                        </div>
                    )}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                {expenses && expenses.length > 0 && <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 text-right font-bold text-lg text-red-600 dark:text-red-400 mt-4">Total del Período: {formatCurrency(totalFilteredExpenses)}</div>}
            </Card>
        </div>
    );
};

export default Expenses;