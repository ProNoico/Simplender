import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    registration?: UseFormRegisterReturn;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, registration, error, ...props }) => {
    const id = registration ? registration.name : props.id || props.name;

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                {label}
            </label>
            <input
                {...props}
                {...(registration || {})}
                id={id}
                className={`w-full h-12 px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:text-neutral-200 ${
                    error 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-neutral-300 dark:border-neutral-600'
                }`}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default Input;