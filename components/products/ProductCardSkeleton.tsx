import React from 'react';
import Card from '../shared/Card';

const ProductCardSkeleton: React.FC = () => {
    return (
        <Card className="animate-pulse">
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/6"></div>
                </div>
                <div className="h-8 bg-neutral-200 rounded w-1/2"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/3 mt-2"></div>
            </div>
            <div className="bg-neutral-100 px-5 py-3 border-t h-12"></div>
        </Card>
    );
};

export default ProductCardSkeleton;