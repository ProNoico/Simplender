import React from 'react';
import Card from '../shared/Card';

const TaskItemSkeleton: React.FC = () => {
    return (
        <Card className="p-4 flex items-center gap-4 animate-pulse">
            <div className="h-6 w-6 bg-neutral-200 rounded"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
            </div>
            <div className="h-5 w-5 bg-neutral-200 rounded-full"></div>
        </Card>
    );
};

export default TaskItemSkeleton;