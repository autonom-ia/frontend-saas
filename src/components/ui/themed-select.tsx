"use client";

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

/**
 * Select com tema dinâmico aplicado
 * Substitui a classe select-clean com suporte a temas claro/escuro
 */
export function ThemedSelect({ children, className = '', ...props }: ThemedSelectProps) {
  const { theme } = useTheme();

  return (
    <select
      className={`rounded-md px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.colors.background.secondary} ${theme.colors.text.primary} ${theme.colors.border.secondary} ${className}`}
      style={{
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '16px 16px',
        paddingRight: '2.5rem'
      }}
      {...props}
    >
      {children}
    </select>
  );
}
