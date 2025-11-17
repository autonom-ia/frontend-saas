import { Theme } from './default';

export const hub2youTheme: Theme = {
  name: 'hub2you',
  logo: '/images/hub2you/logo-retangular.png',      // Logo retangular para login/splash
  logoSquare: '/images/hub2you/logo-quadrada.png',  // Logo quadrado para headers
  favicon: '/images/hub2you/favicon-pequeno.png',
  colors: {
    // Background colors - tons claros
    background: {
      primary: 'bg-gradient-to-br from-blue-50 via-white to-blue-50',
      secondary: 'bg-white',
      card: 'bg-white/80',
      hover: 'hover:bg-blue-50',
    },
    // Text colors - tons escuros
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-700',
      muted: 'text-gray-500',
      accent: 'text-blue-600',
    },
    // Border colors
    border: {
      primary: 'border-gray-200',
      secondary: 'border-gray-300',
      accent: 'border-blue-500',
    },
    // Button colors
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
      ghost: 'text-gray-700 hover:text-gray-900 hover:bg-gray-100',
      outline: 'border-gray-300 text-gray-700 hover:bg-gray-50',
    },
    // Accent colors
    accent: {
      primary: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800',
    },
    // Projects specific colors (adapted for light theme)
    projects: {
      timeline: 'bg-gray-50 border-gray-200',
      timelineHeader: 'border-gray-200',
      timelineRow: 'hover:bg-gray-100',
      form: 'bg-white',
      formBorder: 'border-gray-200',
      input: 'bg-white border-gray-300 text-gray-900',
      panel: 'bg-white',
      panelBorder: 'border-gray-200',
    },
    // Campaigns specific colors (adapted for light theme)
    campaigns: {
      table: 'bg-white border-gray-200',
      tableHeader: 'bg-gray-50',
      tableRow: 'border-gray-100',
      tableRowHover: 'hover:bg-gray-50',
      form: 'bg-white',
      formBorder: 'border-gray-200',
      input: 'bg-white border-gray-300 text-gray-900',
      inputDisabled: 'bg-gray-100 text-gray-500',
      modal: 'bg-white',
      modalBorder: 'border-gray-200',
      importButton: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    },
    // Settings specific colors (adapted for light theme)
    settings: {
      table: 'bg-white border-gray-200',
      tableHeader: 'bg-gray-50',
      tableRow: 'border-gray-100',
      tableRowSelected: 'bg-gray-100',
      tableBorder: 'border-gray-200',
      form: 'bg-white',
      formBorder: 'border-gray-200',
      input: 'bg-white border-gray-300 text-gray-900',
      toast: {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-gray-700',
      },
    },
    // Kanban specific colors (adapted for light theme)
    kanban: {
      column: 'bg-gray-50 border-gray-200',
      columnDragOver: 'bg-blue-50 border-blue-400',
      card: 'bg-white border-gray-200 hover:bg-gray-50',
      cardText: 'text-gray-700',
      cardTextMuted: 'text-gray-500',
      tag: 'bg-blue-100 border-blue-200 text-blue-700',
      tagUnread: 'bg-rose-100 text-rose-700',
      statusBadge: 'bg-gray-100 text-gray-700',
      drawer: 'bg-white border-gray-200',
      drawerMessages: 'bg-gray-50',
      messageOutgoing: 'bg-blue-600 text-white',
      messageIncoming: 'bg-gray-100 text-gray-900',
      input: 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400',
      panel: 'bg-white border-gray-200',
      avatar: 'bg-gray-200 text-gray-700',
    },
  },
  // CSS Variables for light theme
  cssVariables: {
    '--background': '0 0% 100%',
    '--foreground': '222.2 84% 4.9%',
    '--primary': '221.2 83.2% 53.3%',
    '--primary-foreground': '210 40% 98%',
    '--secondary': '210 40% 96.1%',
    '--secondary-foreground': '222.2 47.4% 11.2%',
    '--accent': '210 40% 96.1%',
    '--accent-foreground': '222.2 47.4% 11.2%',
    '--destructive': '0 84.2% 60.2%',
    '--destructive-foreground': '210 40% 98%',
    '--muted': '210 40% 96.1%',
    '--muted-foreground': '215.4 16.3% 46.9%',
    '--card': '0 0% 100%',
    '--card-foreground': '222.2 84% 4.9%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '222.2 84% 4.9%',
    '--border': '214.3 31.8% 91.4%',
    '--input': '214.3 31.8% 91.4%',
    '--ring': '221.2 83.2% 53.3%',
    '--radius': '0.5rem',
  },
};
