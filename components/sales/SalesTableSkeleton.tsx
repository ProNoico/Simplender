import React from 'react';

const SalesTableSkeleton: React.FC = () => {
    return (
        <div className="w-full animate-pulse">
            <div className="bg-neutral-50 border-b border-neutral-200">
                <div className="p-4 flex">
                    <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/4 ml-4"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/4 ml-4"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/4 ml-4"></div>
                </div>
            </div>
            <div>
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="p-4 flex border-b border-neutral-100">
                        <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                        <div className="h-4 bg-neutral-200 rounded w-1/4 ml-4"></div>
                        <div className="h-4 bg-neutral-200 rounded w-1/4 ml-4"></div>
                        <div className="h-4 bg-neutral-200 rounded w-1/4 ml-4"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SalesTableSkeleton;