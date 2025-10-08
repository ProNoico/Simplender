import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Target, Package, Users, ShoppingCart, Award, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabaseClient } from '../lib/supabase';
import { DashboardStats } from '../types';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Card from '../components/shared/Card';
import { formatCurrency, formatShortDate } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import toast from 'react-hot-toast';
import { useAppContext } from '../contexts/AppContext';
import Confetti from 'react-confetti';
import { generateReport } from '../lib/reportGenerator';

type DateRange = { days: number; label: string };
const dateRanges: DateRange[] = [
    { days: 7, label: '7 Días' },
    { days: 15, label: '15 Días' },
    { days: 30, label: '30 Días' },
    { days: 90, label: '3 Meses' },
    { days: 180, label: '6 Meses' },
    { days: 365, label: '1 Año' },
];

const StatsCard: React.FC<{ icon: React.ElementType; title: string; value: string; detail?: string; color: string; onClick?: () => void }> = ({ icon: Icon, title, value, detail, color, onClick }) => (
    <Card className="p-6" onClick={onClick}>
        <div className="flex items-start justify-between">
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
                <p className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">{value}</p>
                {detail && <p className="text-xs text-neutral-400 dark:text-neutral-500">{detail}</p>}
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </Card>
);

const formatYAxis = (tickItem: number) => {
    if (tickItem >= 1000000) return `$${(tickItem / 1000000).toFixed(1)}M`;
    if (tickItem >= 1000) return `$${Math.round(tickItem / 1000)}k`;
    return `$${tickItem}`;
};

const SalesChart: React.FC<{ data: { date: string, total: number }[] }> = ({ data }) => (
    <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#737373' }} stroke="#737373" />
            <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12, fill: '#737373' }} stroke="#737373" />
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '0.5rem' }} labelStyle={{ fontWeight: 'bold' }} formatter={(value) => [formatCurrency(value as number), 'Ventas']} />
            <Legend wrapperStyle={{ fontSize: "14px" }} />
            <Line type="monotone" dataKey="total" name="Ventas" stroke="#ec4899" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
        </LineChart>
    </ResponsiveContainer>
);

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { openModal, refreshId } = useAppContext();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState<DateRange>(dateRanges[0]);
    const [isGoalModalOpen, setGoalModalOpen] = useState(false);
    const [newGoal, setNewGoal] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    const fetchStats = useCallback(async (days: number) => {
        setLoading(true);
        const { data, error } = await supabaseClient.rpc('dashboard_stats', { p_days_ago: days });

        if (error) {
            toast.error('No se pudieron cargar las estadísticas.');
            console.error("Error fetching stats:", error);
        } else {
            if (data) {
                if (!data.last_5_sales) data.last_5_sales = [];
                if (stats && days === 30 && stats.monthly_sales < stats.monthly_goal && data.monthly_sales >= data.monthly_goal && data.monthly_goal > 0) {
                    setShowConfetti(true);
                }
                
                setStats(data);
                setNewGoal(data.monthly_goal?.toString() || '');
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchStats(selectedRange.days);
    }, [selectedRange, refreshId, fetchStats]);

    const handleUpdateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        const goalAmount = parseFloat(newGoal);
        if (isNaN(goalAmount) || goalAmount < 0) {
            toast.error('Por favor, ingresa un monto válido.');
            return;
        }
        const { error } = await supabaseClient.rpc('update_monthly_goal', { p_new_goal: goalAmount });
        if (error) {
            toast.error('No se pudo actualizar la meta.');
        } else {
            toast.success('¡Meta actualizada!');
            setStats(prev => prev ? { ...prev, monthly_goal: goalAmount } : null);
            setGoalModalOpen(false);
        }
    };
    
    const handleDownloadReport = () => {
         if (stats && user) {
            generateReport(
                stats,
                user.user_metadata.full_name || 'Emprendedora',
                user.user_metadata.business_name || 'Tu Negocio',
                selectedRange.label 
            );
        } else {
            toast.error("Los datos aún no están listos para generar el reporte.");
        }
    };

    if (loading && !stats) {
        return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
    }
    if (!stats) {
        return <div className="text-center text-neutral-500">No se pudieron cargar las estadísticas.</div>;
    }
    
    const goalProgress = stats.monthly_goal > 0 ? (stats.monthly_sales / stats.monthly_goal) * 100 : 0;
    const goalReached = goalProgress >= 100;

    return (
        <div className="space-y-8">
            {showConfetti && <Confetti recycle={false} onConfettiComplete={() => setShowConfetti(false)} />}
            
            <div className="flex flex-col md:flex-row justify-between items-start">
                <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Hola, {user?.user_metadata.full_name?.split(' ')[0]}! 👋</h1>
                <Button variant="ghost" onClick={handleDownloadReport}>
                    <Download className="w-5 h-5 mr-2" />
                    Descargar Reporte
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard icon={DollarSign} title={`Ventas (${selectedRange.label})`} value={formatCurrency(stats.monthly_sales)} color="bg-primary-500" />
                
                <Card className="p-6 cursor-pointer hover:shadow-soft transition-shadow" onClick={() => setGoalModalOpen(true)}>
                     <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{goalReached ? "¡Meta Superada!" : "Meta del Mes"}</p>
                            <p className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">{formatCurrency(stats.monthly_goal)}</p>
                        </div>
                        <div className={`p-3 rounded-full ${goalReached ? 'bg-accent-500' : 'bg-secondary-500'}`}>{goalReached ? <Award className="w-6 h-6 text-white" /> : <Target className="w-6 h-6 text-white" />}</div>
                    </div>
                    <div className="mt-4">
                        <div className="w-full bg-neutral-200 rounded-full h-2.5 dark:bg-neutral-700"><div className={`h-2.5 rounded-full ${goalReached ? 'bg-accent-500' : 'bg-secondary-500'}`} style={{ width: `${Math.min(goalProgress, 100)}%` }}></div></div>
                        <p className="text-xs text-neutral-400 mt-1 text-right">{goalProgress.toFixed(0)}% alcanzado</p>
                    </div>
                </Card>
                <StatsCard icon={Package} title="Producto Más Vendido" value={stats.most_sold_product?.name || 'N/A'} detail={`${stats.most_sold_product?.quantity || 0} unidades`} color="bg-green-500" />
                <StatsCard icon={Users} title="Clientes Activos" value={stats.active_customers.toString()} detail={`En ${selectedRange.label}`} color="bg-yellow-500" />
            </div>
            
             <Card className="p-6 col-span-1 md:col-span-2 lg:col-span-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-200 mb-2 md:mb-0">Ventas ({selectedRange.label})</h3>
                    <div className="flex items-center gap-2 flex-wrap">{dateRanges.map(range => (<Button key={range.days} variant="ghost" size="sm" onClick={() => setSelectedRange(range)} className={selectedRange.days === range.days ? 'bg-primary-100 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400' : ''}>{range.label}</Button>))}</div>
                </div>
                {/* CORRECCIÓN: Usamos `sales_over_time` para el gráfico */}
                {loading ? <div className="h-80 flex justify-center items-center"><LoadingSpinner/></div> : <SalesChart data={stats.sales_over_time || []} />}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6 lg:col-span-1">
                    <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-200 mb-4">Acciones Rápidas</h3>
                    <div className="space-y-3">
                        <Button variant="primary" className="w-full h-12" onClick={() => openModal('newSale')}>Registrar Venta Rápida</Button>
                        <Button variant="secondary" className="w-full h-12" onClick={() => openModal('newProduct')}>Agregar Producto</Button>
                        <Button variant="accent" className="w-full h-12" onClick={() => openModal('newTask')}>Crear Tarea</Button>
                    </div>
                </Card>
                <Card className="p-6 lg:col-span-2">
                    <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-200 mb-4">Últimas 5 Ventas</h3>
                    <div className="flow-root">
                        {stats.last_5_sales.length > 0 ? (
                            <ul role="list" className="-my-4 divide-y divide-neutral-200 dark:divide-neutral-700">
                                {stats.last_5_sales.map((sale: any) => (
                                    <li key={sale.id} className="flex items-center py-4 space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                <ShoppingCart className="w-5 h-5 text-primary-500"/>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{sale.product_name}</p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{sale.customer_name || 'Venta sin cliente'} &middot; {formatShortDate(sale.created_at)}</p>
                                        </div>
                                        <div className="inline-flex items-center text-base font-semibold text-neutral-900 dark:text-neutral-100">{formatCurrency(sale.amount)}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center text-neutral-500 py-8"><p>Aún no has registrado ninguna venta.</p></div>
                        )}
                    </div>
                </Card>
            </div>

            <Modal isOpen={isGoalModalOpen} onClose={() => setGoalModalOpen(false)} title="Actualizar Meta del Mes">
                <form onSubmit={handleUpdateGoal}>
                    <label htmlFor="monthlyGoal" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Ingresá tu nueva meta de ventas:</label>
                    <input id="monthlyGoal" type="number" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} className="w-full h-12 px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:text-neutral-200 mt-1" placeholder="Ej: 250000" />
                    <div className="pt-6 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setGoalModalOpen(false)}>Cancelar</Button>
                        <Button type="submit">Guardar Meta</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Dashboard;