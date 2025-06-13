// app/components/ui/Input.tsx
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  actionIcon?: React.ReactNode; // Новый пропс для иконки-действия справа
  onActionClick?: () => void;   // Функция для клика по этой иконке
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, actionIcon, onActionClick, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-brand-text-secondary">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={`w-full h-12 px-4 py-2 rounded-lg border border-brand-border bg-brand-background focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-shadow ${icon ? 'pl-10' : ''} ${actionIcon ? 'pr-12' : ''}`}
          ref={ref}
          {...props}
        />
        {actionIcon && (
          <button
            type="button" // Важно, чтобы кнопка не отправляла форму
            onClick={onActionClick}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-brand-text-secondary hover:text-brand-primary transition-colors"
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
