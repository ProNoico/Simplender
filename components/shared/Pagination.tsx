import React, { memo } from 'react'; // 1. Importar memo
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

// 2. Envolvemos el componente con React.memo
const Pagination: React.FC<PaginationProps> = memo(({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Página anterior"
            >
                <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <span className="text-sm text-neutral-600">
                Página {currentPage} de {totalPages}
            </span>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Página siguiente"
            >
                <ChevronRight className="w-5 h-5" />
            </Button>
        </div>
    );
});

export default Pagination;