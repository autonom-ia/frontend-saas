"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    // Guard contra múltiplas execuções
    if (hasChecked.current) {
      return;
    }
    
    hasChecked.current = true;
    
    const checkAuth = () => {
      try {
        // Leitura síncrona imediata do storage
        const raw = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        const parsed = raw ? JSON.parse(raw) : null;
        const hasToken = !!(parsed?.IdToken || parsed?.AccessToken || parsed?.token);

        if (!hasToken) {
          // Sem token - redireciona para root que vai para login
          router.push('/');
          return;
        }

        // Token encontrado - autoriza renderização
        setIsAuthenticated(true);
        setIsChecking(false);
      } catch (error) {
        console.error('[AuthGuard] erro ao verificar autenticação:', error);
        router.push('/');
      }
    };

    // Executa imediatamente, sem delays
    checkAuth();
  }, [router]);

  // Loader enquanto verifica
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background dark:bg-gray-900">
        <div className="text-sm text-gray-400">Verificando autenticação...</div>
      </div>
    );
  }

  // Renderiza conteúdo protegido apenas se autenticado
  return isAuthenticated ? <>{children}</> : null;
}
