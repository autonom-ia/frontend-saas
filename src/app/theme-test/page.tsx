"use client";

import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';

/**
 * Página de teste do sistema de temas
 * Acesse /theme-test para visualizar
 */
export default function ThemeTestPage() {
  const { theme, subdomain } = useTheme();

  return (
    <div className={`min-h-screen ${theme.colors.background.primary} p-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Image 
              src={theme.logoSquare} 
              alt="Logo" 
              width={60} 
              height={60}
              onError={(e) => {
                e.currentTarget.src = '/images/logo.png';
              }}
            />
            <div>
              <h1 className={`text-3xl font-bold ${theme.colors.text.primary}`}>
                Sistema de Temas
              </h1>
              <p className={theme.colors.text.secondary}>
                Tema ativo: <strong>{theme.name}</strong> • Subdomínio: <strong>{subdomain || 'Nenhum'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Grid de Exemplos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tipografia */}
          <div className={`p-6 rounded-lg border ${theme.colors.background.card} ${theme.colors.border.primary}`}>
            <h2 className={`text-xl font-semibold mb-4 ${theme.colors.text.primary}`}>
              Tipografia
            </h2>
            <div className="space-y-3">
              <p className={`text-lg ${theme.colors.text.primary}`}>
                Texto Primário - Usado para títulos e conteúdo principal
              </p>
              <p className={`text-base ${theme.colors.text.secondary}`}>
                Texto Secundário - Usado para descrições e subtítulos
              </p>
              <p className={`text-sm ${theme.colors.text.muted}`}>
                Texto Suavizado - Usado para informações complementares
              </p>
              <p className={`text-sm font-semibold ${theme.colors.text.accent}`}>
                Texto Accent - Usado para destaques e links
              </p>
            </div>
          </div>

          {/* Botões */}
          <div className={`p-6 rounded-lg border ${theme.colors.background.card} ${theme.colors.border.primary}`}>
            <h2 className={`text-xl font-semibold mb-4 ${theme.colors.text.primary}`}>
              Botões
            </h2>
            <div className="space-y-3">
              <button className={`w-full px-4 py-2 rounded-md ${theme.colors.button.primary}`}>
                Botão Primário
              </button>
              <button className={`w-full px-4 py-2 rounded-md ${theme.colors.button.secondary}`}>
                Botão Secundário
              </button>
              <button className={`w-full px-4 py-2 rounded-md ${theme.colors.button.ghost}`}>
                Botão Ghost
              </button>
              <button className={`w-full px-4 py-2 rounded-md border ${theme.colors.button.outline}`}>
                Botão Outline
              </button>
            </div>
          </div>

          {/* Cards de Alerta */}
          <div className={`p-6 rounded-lg border ${theme.colors.background.card} ${theme.colors.border.primary}`}>
            <h2 className={`text-xl font-semibold mb-4 ${theme.colors.text.primary}`}>
              Cards de Alerta
            </h2>
            <div className="space-y-3">
              <div className={`p-4 rounded-lg border ${theme.colors.accent.primary}`}>
                <p className="font-semibold">Informação</p>
                <p className="text-sm mt-1">Este é um card informativo com detalhes importantes</p>
              </div>
              <div className={`p-4 rounded-lg border ${theme.colors.accent.success}`}>
                <p className="font-semibold">Sucesso</p>
                <p className="text-sm mt-1">Operação realizada com sucesso!</p>
              </div>
              <div className={`p-4 rounded-lg border ${theme.colors.accent.warning}`}>
                <p className="font-semibold">Atenção</p>
                <p className="text-sm mt-1">Preste atenção nesta informação importante</p>
              </div>
              <div className={`p-4 rounded-lg border ${theme.colors.accent.error}`}>
                <p className="font-semibold">Erro</p>
                <p className="text-sm mt-1">Ocorreu um erro ao processar sua solicitação</p>
              </div>
            </div>
          </div>

          {/* Backgrounds */}
          <div className={`p-6 rounded-lg border ${theme.colors.background.card} ${theme.colors.border.primary}`}>
            <h2 className={`text-xl font-semibold mb-4 ${theme.colors.text.primary}`}>
              Backgrounds
            </h2>
            <div className="space-y-3">
              <div className={`p-4 rounded-lg ${theme.colors.background.primary}`}>
                <p className={theme.colors.text.primary}>Background Primário</p>
              </div>
              <div className={`p-4 rounded-lg ${theme.colors.background.secondary}`}>
                <p className={theme.colors.text.primary}>Background Secundário</p>
              </div>
              <div className={`p-4 rounded-lg ${theme.colors.background.card}`}>
                <p className={theme.colors.text.primary}>Background Card</p>
              </div>
              <div className={`p-4 rounded-lg ${theme.colors.background.secondary} ${theme.colors.background.hover} cursor-pointer`}>
                <p className={theme.colors.text.primary}>Hover Effect (passe o mouse)</p>
              </div>
            </div>
          </div>

          {/* Borders */}
          <div className={`p-6 rounded-lg border ${theme.colors.background.card} ${theme.colors.border.primary}`}>
            <h2 className={`text-xl font-semibold mb-4 ${theme.colors.text.primary}`}>
              Bordas
            </h2>
            <div className="space-y-3">
              <div className={`p-4 rounded-lg border-2 ${theme.colors.border.primary} ${theme.colors.background.secondary}`}>
                <p className={theme.colors.text.primary}>Borda Primária</p>
              </div>
              <div className={`p-4 rounded-lg border-2 ${theme.colors.border.secondary} ${theme.colors.background.secondary}`}>
                <p className={theme.colors.text.primary}>Borda Secundária</p>
              </div>
              <div className={`p-4 rounded-lg border-2 ${theme.colors.border.accent} ${theme.colors.background.secondary}`}>
                <p className={theme.colors.text.primary}>Borda Accent</p>
              </div>
            </div>
          </div>

          {/* Informações Técnicas */}
          <div className={`p-6 rounded-lg border ${theme.colors.background.card} ${theme.colors.border.primary}`}>
            <h2 className={`text-xl font-semibold mb-4 ${theme.colors.text.primary}`}>
              Informações Técnicas
            </h2>
            <div className={`space-y-2 text-sm ${theme.colors.text.secondary}`}>
              <p><strong className={theme.colors.text.primary}>Tema:</strong> {theme.name}</p>
              <p><strong className={theme.colors.text.primary}>Subdomínio:</strong> {subdomain || 'Nenhum (tema padrão)'}</p>
              <p><strong className={theme.colors.text.primary}>Logo:</strong> {theme.logo}</p>
              <p><strong className={theme.colors.text.primary}>Hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Código de Exemplo */}
        <div className={`mt-8 p-6 rounded-lg border ${theme.colors.background.card} ${theme.colors.border.primary}`}>
          <h2 className={`text-xl font-semibold mb-4 ${theme.colors.text.primary}`}>
            Como Usar em Seus Componentes
          </h2>
          <pre className={`p-4 rounded-lg overflow-x-auto ${theme.colors.background.secondary} ${theme.colors.text.secondary} text-xs`}>
{`import { useTheme } from '@/contexts/ThemeContext';

export default function MyComponent() {
  const { theme, subdomain } = useTheme();

  return (
    <div className={theme.colors.background.primary}>
      <h1 className={theme.colors.text.primary}>
        Olá, ${subdomain || 'visitante'}!
      </h1>
      <button className={theme.colors.button.primary}>
        Clique Aqui
      </button>
    </div>
  );
}`}
          </pre>
        </div>

        {/* Links */}
        <div className={`mt-8 p-6 rounded-lg border text-center ${theme.colors.background.card} ${theme.colors.border.primary}`}>
          <p className={`mb-4 ${theme.colors.text.secondary}`}>
            Para mais informações, consulte a documentação
          </p>
          <a 
            href="/THEMING_SYSTEM.md" 
            target="_blank"
            className={`inline-block px-6 py-2 rounded-md ${theme.colors.button.primary}`}
          >
            Ver Documentação Completa
          </a>
        </div>
      </div>
    </div>
  );
}
