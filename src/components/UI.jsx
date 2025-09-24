import React from 'react';
import { cn } from '../lib/utils';

export const Button = ({ className, variant = 'primary', ...props }) => {
  const variants = {
    primary: 'bg-black text-white hover:bg-zinc-800',
    secondary: 'bg-white text-black border border-zinc-200 hover:bg-zinc-50',
    ghost: 'hover:bg-zinc-100 text-zinc-600',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100'
  };
  return (
    <button 
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )} 
      {...props} 
    />
  );
};

export const Input = ({ className, ...props }) => (
  <input 
    className={cn(
      'w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all',
      className
    )} 
    {...props} 
  />
);
