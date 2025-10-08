import React, { memo } from 'react'; // 1. Importar memo
import LoadingSpinner from './LoadingSpinner';

// ... (interfaz sin cambios)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    className?: string;
}

// 2. Envolvemos el componente con React.memo
const Button: React.FC<ButtonProps> = memo(({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className = '',
    ...props
}) => {
    // ... (lógica del componente sin cambios)
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100';

    const variantStyles = {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
        secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500',
        ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 focus:ring-primary-500 dark:text-neutral-300 dark:hover:bg-neutral-700/50',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
        accent: 'bg-accent-500 text-white hover:bg-amber-500 focus:ring-accent-500',
    };

    const sizeStyles = {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? <LoadingSpinner size="sm" color="text-white" /> : children}
        </button>
    );
});

export default Button;