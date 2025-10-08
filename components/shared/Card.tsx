import React, { memo } from 'react'; // 1. Importar memo

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

// 2. Envolvemos el componente con React.memo
const Card: React.FC<CardProps> = memo(({ children, className = '', onClick }) => {
    const baseClasses = 'bg-white rounded-xl shadow-card overflow-hidden dark:bg-neutral-800 dark:border dark:border-neutral-700/50';
    const interactiveClasses = onClick ? 'transition-shadow duration-300 hover:shadow-soft cursor-pointer' : '';

    return (
        <div className={`${baseClasses} ${interactiveClasses} ${className}`} onClick={onClick}>
            {children}
        </div>
    );
});

export default Card;