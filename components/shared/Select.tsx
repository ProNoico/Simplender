import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    registration: UseFormRegisterReturn;
    error?: string;
    children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, registration, error, children, ...props }) => {
    return (
        <div>
            <label htmlFor={registration.name} className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                {label}
            </label>
            <select
                {...props}
                {...registration}
                id={registration.name}
                className={`w-full h-12 px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200 ${
                    error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-neutral-300'
                }`}
            >
                {children}
            </select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default Select;