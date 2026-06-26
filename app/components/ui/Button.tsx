// app/components/ui/Button.tsx
"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';

// Определяем базовые пропсы для кнопки
type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
  className?: string;
};

// Определяем тип для полиморфного компонента
type PolymorphicButtonProps<C extends React.ElementType> = {
  as?: C;
} & ButtonProps & Omit<React.ComponentPropsWithoutRef<C>, keyof ButtonProps>;


const Button = <C extends React.ElementType = 'button'>({
  as,
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  ...props
}: PolymorphicButtonProps<C>) => {
  const Component = as || 'button';

  const baseClasses = `
    relative inline-flex items-center justify-center
    font-bold btn-spring
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100
    active:scale-95 hover:-translate-y-0.5 active:translate-y-0
  `;

  const variantClasses = {
    primary: `
      bg-brand-primary text-white 
      hover:bg-brand-primary-hover hover:shadow-lg hover:shadow-brand-primary/30
      focus:ring-brand-primary
    `,
    secondary: `
      bg-white text-gray-700 border border-gray-200
      hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 hover:shadow-md
      focus:ring-gray-200
    `,
    danger: `
      bg-red-50 text-red-600 border border-red-100
      hover:bg-red-100 hover:border-red-200 hover:text-red-700 hover:shadow-md hover:shadow-red-500/10
      focus:ring-red-500
    `,
    ghost: `
      bg-transparent text-gray-500 
      hover:bg-gray-100 hover:text-gray-900
      focus:ring-gray-200 shadow-none hover:shadow-none hover:translate-y-0
    `
  };

  // Если className не содержит классов для паддингов и скругления, добавляем дефолтные
  const defaultPadding = className.includes('p-') || className.includes('px-') ? '' : 'px-5 py-2.5';
  const defaultRounded = className.includes('rounded-') ? '' : 'rounded-xl';

  return (
    <Component
      className={`${baseClasses} ${variantClasses[variant]} ${defaultPadding} ${defaultRounded} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin" size={20} />
        </span>
      )}
      
      <span className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
    </Component>
  );
};

export default Button;