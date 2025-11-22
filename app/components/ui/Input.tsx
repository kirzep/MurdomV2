// app/components/ui/Input.tsx
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  actionIcon?: React.ReactNode;
  onActionClick?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, actionIcon, onActionClick, ...props }, ref) => {
    return (
      <div className="relative group">
        {/* Иконка слева */}
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-brand-primary transition-colors duration-200">
            {icon}
          </div>
        )}

        {/* Само поле */}
        <input
          type={type}
          className={`
            w-full h-12 bg-white border-2 border-transparent rounded-xl 
            text-gray-900 placeholder-gray-400 font-medium transition-all duration-200
            
            /* Дефолтное состояние: легкая тень и фон */
            shadow-sm bg-gray-50/50 hover:bg-white hover:shadow-md
            
            /* Фокус: яркая рамка и тень */
            focus:outline-none focus:bg-white focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/10 focus:shadow-lg
            
            /* Отступы для иконок */
            ${icon ? 'pl-11' : 'px-4'} 
            ${actionIcon ? 'pr-12' : 'pr-4'} 
            
            /* Дополнительные классы */
            ${className}
          `}
          ref={ref}
          {...props}
        />

        {/* Иконка-действие справа (например, глазик пароля) */}
        {actionIcon && (
          <button
            type="button"
            onClick={onActionClick}
            className="
                absolute inset-y-0 right-0 flex items-center px-4 
                text-gray-400 hover:text-brand-primary 
                transition-colors duration-200 cursor-pointer
                active:scale-95
            "
          >
            {actionIcon}
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;