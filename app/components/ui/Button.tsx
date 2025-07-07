// app/components/ui/Button.tsx
"use client";

import React from 'react';

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

  const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:bg-opacity-90 focus:ring-brand-primary',
    secondary: 'bg-brand-background text-brand-text-primary hover:bg-brand-border focus:ring-brand-primary',
    danger: 'bg-brand-accent text-white hover:bg-opacity-90 focus:ring-brand-accent',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-200 focus:ring-brand-primary'
  };

  return (
    <Component
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
      ) : (
        children
      )}
    </Component>
  );
};

export default Button;