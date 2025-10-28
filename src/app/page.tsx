"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const hasRedirected = useRef(false);
  
  useEffect(() => {
    // Guard contra múltiplas execuções
    if (hasRedirected.current) {
      return;
    }
    
    hasRedirected.current = true;
    
    // Verificar token e decidir destino
    try {
      const raw = localStorage.getItem('userData') || sessionStorage.getItem('userData');
      const parsed = raw ? JSON.parse(raw) : null;
      const hasToken = !!(parsed?.IdToken || parsed?.AccessToken || parsed?.token);
      
      if (hasToken) {
        router.push('/monitoring');
      } else {
        router.push('/login');
      }
    } catch (e) {
      router.push('/login');
    }
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-gray-900">
      <div className="text-sm text-gray-400">Redirecionando...</div>
    </div>
  );
}
