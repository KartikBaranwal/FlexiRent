import React, { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-2">
        {label && (
          <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full px-5 py-4 rounded-2xl border-2 transition-all duration-300 outline-none font-medium text-slate-900 bg-white",
              icon ? "pl-12" : "pl-5",
              error 
                ? "border-rose-100 bg-rose-50/30 focus:border-rose-500 focus:ring-4 focus:ring-rose-50" 
                : "border-slate-100 focus:border-slate-900 focus:ring-4 focus:ring-slate-50 hover:border-slate-200",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-rose-500 mt-1 font-bold flex items-center gap-1.5 ml-1 animate-in fade-in slide-in-from-top-1">
            <span className="w-1 h-1 bg-rose-500 rounded-full" /> {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
