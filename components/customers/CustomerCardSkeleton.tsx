import React from 'react';
import Card from '../shared/Card';

const CustomerCardSkeleton: React.FC = () => {
    return (
        <Card className="animate-pulse">
            <div className="p-5">
                <div className="h-6 bg-neutral-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                <div className="mt-4 space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                </div>
            </div>
            <div className="bg-neutral-100 px-5 py-3 border-t h-12"></div>
        </Card>
    );
};

export default CustomerCardSkeleton;