"use client";

import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';

/**
 * Componente de exemplo mostrando como usar o tema
 * Pode ser usado como referência para implementar em outros componentes
 */
export default function ThemeExample() {
  const { theme, subdomain } = useTheme();

  return (
    <div className={`min-h-screen ${theme.colors.background.primary} p-8`}>
      {/* Logo dinâmico */}
      <div className="flex justify-center mb-8">
        <Image 
          src={theme.logo} 
          alt="Logo" 
          width={150} 
          height={150}
          onError={(e) => {
            // Fallback para logo padrão se não encontrar
            e.currentTarget.src = '/images/logo.png';
          }}
        />
      </div>

      {/* Informações do tema */}
      <div className={`max-w-2xl mx-auto p-6 rounded-lg border ${theme.colors.background.card} ${theme.colors.border.primary}`}>
        <h1 className={`text-2xl font-bold mb-4 ${theme.colors.text.primary}`}>
          Tema Ativo: {theme.name}
        </h1>
        <p className={`mb-2 ${theme.colors.text.secondary}`}>
          Subdomínio detectado: {subdomain || 'Nenhum (usando tema padrão)'}
        </p>

        {/* Exemplos de cores */}
        <div className="space-y-4 mt-6">
          <h2 className={`text-lg font-semibold ${theme.colors.text.primary}`}>
            Exemplos de Componentes:
          </h2>

          {/* Botões */}
          <div className="flex gap-4 flex-wrap">
            <button className={`px-4 py-2 rounded ${theme.colors.button.primary}`}>
              Botão Primário
            </button>
            <button className={`px-4 py-2 rounded ${theme.colors.button.secondary}`}>
              Botão Secundário
            </button>
            <button className={`px-4 py-2 rounded ${theme.colors.button.ghost}`}>
              Botão Ghost
            </button>
            <button className={`px-4 py-2 rounded border ${theme.colors.button.outline}`}>
              Botão Outline
            </button>
          </div>

          {/* Cards de Alerta */}
          <div className="space-y-2">
            <div className={`p-4 rounded-lg border ${theme.colors.accent.primary}`}>
              <p className="font-semibold">Info</p>
              <p className="text-sm">Este é um card informativo</p>
            </div>
            <div className={`p-4 rounded-lg border ${theme.colors.accent.success}`}>
              <p className="font-semibold">Sucesso</p>
              <p className="text-sm">Operação realizada com sucesso</p>
            </div>
            <div className={`p-4 rounded-lg border ${theme.colors.accent.warning}`}>
              <p className="font-semibold">Atenção</p>
              <p className="text-sm">Fique atento a esta informação</p>
            </div>
            <div className={`p-4 rounded-lg border ${theme.colors.accent.error}`}>
              <p className="font-semibold">Erro</p>
              <p className="text-sm">Ocorreu um erro na operação</p>
            </div>
          </div>

          {/* Tipografia */}
          <div className="space-y-2">
            <p className={theme.colors.text.primary}>
              Texto Primário - Lorem ipsum dolor sit amet
            </p>
            <p className={theme.colors.text.secondary}>
              Texto Secundário - Consectetur adipiscing elit
            </p>
            <p className={theme.colors.text.muted}>
              Texto Suavizado - Sed do eiusmod tempor incididunt
            </p>
            <p className={theme.colors.text.accent}>
              Texto Accent - Ut labore et dolore magna aliqua
            </p>
          </div>
        </div>
      </div>

      {/* Código de exemplo */}
      <div className={`max-w-2xl mx-auto mt-8 p-6 rounded-lg ${theme.colors.background.secondary}`}>
        <h2 className={`text-lg font-semibold mb-4 ${theme.colors.text.primary}`}>
          Como usar em seus componentes:
        </h2>
        <pre className={`p-4 rounded overflow-x-auto ${theme.colors.background.card} ${theme.colors.text.secondary}`}>
{`import { useTheme } from '@/contexts/ThemeContext';

export default function MyComponent() {
  const { theme, subdomain } = useTheme();

  return (
    <div className={theme.colors.background.primary}>
      <h1 className={theme.colors.text.primary}>
        Título
      </h1>
      <button className={theme.colors.button.primary}>
        Clique aqui
      </button>
    </div>
  );
}`}
        </pre>
      </div>
    </div>
  );
}
