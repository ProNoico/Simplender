import React, { memo } from 'react'; // 1. Importar memo
import { Task } from '../../types';
import { formatShortDate, isOverdue } from '../../lib/utils';
import { Trash2 } from 'lucide-react';
import Card from '../shared/Card';

interface TaskItemProps {
    task: Task;
    onToggle: (taskId: string, isCompleted: boolean) => void;
    onDelete: (taskId: string) => void;
}

// 2. Envolvemos el componente con React.memo
const TaskItem: React.FC<TaskItemProps> = memo(({ task, onToggle, onDelete }) => {
    // ... (lógica del componente sin cambios)
    const categoryColors: { [key: string]: string } = {
        ventas: 'bg-primary-100 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400',
        marketing: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-500/10 dark:text-secondary-400',
        admin: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
        finanzas: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
        otro: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
    };

    const overdue = !task.is_completed && task.due_date && isOverdue(task.due_date);

    return (
        <Card className={`p-4 flex items-center gap-4 transition-opacity ${task.is_completed ? 'opacity-60' : ''} ${overdue ? 'border-l-4 border-red-500' : ''}`}>
            <input 
                type="checkbox" 
                checked={task.is_completed}
                onChange={() => onToggle(task.id, task.is_completed)}
                className="h-6 w-6 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer dark:bg-neutral-600 dark:border-neutral-500"
            />
            <div className="flex-1">
                <p className={`font-medium ${task.is_completed ? 'line-through text-neutral-500 dark:text-neutral-500' : 'text-neutral-800 dark:text-neutral-200'}`}>
                    {task.title}
                </p>
                <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {task.due_date && <span>{formatShortDate(task.due_date)}</span>}
                    {task.category && (
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${categoryColors[task.category]}`}>
                            {task.category}
                        </span>
                    )}
                </div>
            </div>
            <button onClick={() => onDelete(task.id)} className="text-neutral-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-5 h-5" />
            </button>
        </Card>
    );
});

export default TaskItem;