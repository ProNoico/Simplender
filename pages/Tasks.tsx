import React, { useState, useMemo } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import Button from '../components/shared/Button';
import { useTasks, DateFilter, CategoryFilter } from '../hooks/useTasks';
import TaskItem from '../components/tasks/TaskItem';
import { useAppContext } from '../contexts/AppContext';
import TaskItemSkeleton from '../components/tasks/TaskItemSkeleton';
import { TaskCategory } from '../types';

const taskCategories: TaskCategory[] = ['ventas', 'marketing', 'admin', 'finanzas', 'otro'];

const Tasks: React.FC = () => {
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

    // Memorizamos el objeto de filtros para no causar re-renders innecesarios en el hook `useTasks`
    const filters = useMemo(() => ({
        date: dateFilter,
        category: categoryFilter,
    }), [dateFilter, categoryFilter]);

    const { pendingTasks, completedTasks, loading, toggleComplete, deleteTask } = useTasks(filters);
    
    const { openModal } = useAppContext();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Mis Tareas</h1>
                <Button onClick={() => openModal('newTask')} className="h-12 w-full md:w-auto"><Plus className="-ml-1 mr-2 h-5 w-5" />Nueva Tarea</Button>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                    <Button variant={dateFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setDateFilter('all')}>Todas</Button>
                    <Button variant={dateFilter === 'today' ? 'primary' : 'ghost'} onClick={() => setDateFilter('today')}>Para Hoy</Button>
                    <Button variant={dateFilter === 'thisWeek' ? 'primary' : 'ghost'} onClick={() => setDateFilter('thisWeek')}>Esta Semana</Button>
                </div>
                <div className="w-full md:w-56">
                     <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                        className="w-full h-12 px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
                     >
                        <option value="all">Todas las Categorías</option>
                        {taskCategories.map(cat => (
                            <option key={cat} value={cat} className="capitalize">{cat}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            {loading ? (
                <div className="space-y-4">
                    <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 animate-pulse"></div>
                    {Array.from({ length: 3 }).map((_, index) => <TaskItemSkeleton key={index} />)}
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">Pendientes</h2>
                        {pendingTasks.length > 0 ? (
                            pendingTasks.map(task => <TaskItem key={task.id} task={task} onToggle={toggleComplete} onDelete={deleteTask} />)
                        ) : (
                            <div className="bg-white dark:bg-neutral-800 p-12 rounded-xl shadow-card text-center text-neutral-500 dark:text-neutral-400"><CheckCircle2 className="w-12 h-12 mx-auto text-green-500" /><p className="mt-4 font-semibold">¡Nada pendiente por aquí!</p><p className="text-sm mt-1">Disfrutá de tu momento o agregá una nueva tarea.</p></div>
                        )}
                    </div>
                     <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">Completadas</h2>
                        {completedTasks.length > 0 ? (
                            completedTasks.map(task => <TaskItem key={task.id} task={task} onToggle={toggleComplete} onDelete={deleteTask} />)
                        ) : (
                             <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-card text-center text-neutral-400 opacity-80"><p>Las tareas que completes aparecerán aquí.</p></div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;