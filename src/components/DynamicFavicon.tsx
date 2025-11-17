"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useEffect } from "react";

/**
 * Componente que atualiza o favicon dinamicamente baseado no tema atual
 */
export function DynamicFavicon() {
  const { theme } = useTheme();

  useEffect(() => {
    // Atualizar favicon
    const updateFavicon = () => {
      // Remover favicons existentes
      const existingIcons = document.querySelectorAll("link[rel*='icon']");
      existingIcons.forEach(icon => icon.remove());

      // Adicionar novo favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = theme.favicon;
      document.head.appendChild(link);

      // Adicionar apple-touch-icon se disponível
      if (theme.logoSquare) {
        const appleIcon = document.createElement('link');
        appleIcon.rel = 'apple-touch-icon';
        appleIcon.href = theme.logoSquare;
        document.head.appendChild(appleIcon);
      }
    };

    updateFavicon();
  }, [theme]);

  return null; // Este componente não renderiza nada visível
}
