import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rect' }) => {
  const baseStyles = 'animate-pulse bg-slate-200';
  
  const variants = {
    rect: 'rounded-2xl',
    circle: 'rounded-full',
    text: 'rounded h-4 w-full',
  };

  return <div className={cn(baseStyles, variants[variant], className)} />;
};

export const ProductSkeleton = () => (
  <div className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm">
    <Skeleton className="w-full aspect-square mb-6" />
    <div className="px-2 space-y-3">
      <Skeleton variant="text" className="w-3/4 h-6" />
      <Skeleton variant="text" className="w-1/2" />
      <div className="pt-4 flex items-center justify-between">
        <Skeleton variant="text" className="w-20 h-8" />
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
    </div>
  </div>
);
