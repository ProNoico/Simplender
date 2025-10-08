import React from 'react';

const ExpensesTableSkeleton: React.FC = () => {
    const SkeletonRow = () => (
        <div className="p-4 flex border-b border-neutral-100 dark:border-neutral-700/50 items-center">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/6 ml-4"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/6 ml-4"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/6 ml-auto"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/12 ml-4"></div>
        </div>
    );
    
    return (
        <div className="w-full animate-pulse">
            <div className="bg-neutral-50 dark:bg-neutral-700/50 border-b border-neutral-200 dark:border-neutral-700">
                 <div className="p-4 flex">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/6 ml-4"></div>
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/6 ml-4"></div>
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/6 ml-auto"></div>
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/12 ml-4"></div>
                </div>
            </div>
            <div>
                {Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonRow key={index} />
                ))}
            </div>
        </div>
    );
};

export default ExpensesTableSkeleton;