// app/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-brand-text-secondary">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={`w-full px-4 py-2 rounded-lg border border-brand-border bg-brand-background focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-shadow ${icon ? 'pl-10' : ''} ${className}`}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
