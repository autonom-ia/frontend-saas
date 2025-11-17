export const defaultTheme = {
  name: 'autonomia',
  logo: '/images/logo.png',
  logoSquare: '/images/logo.png',
  favicon: '/favicon.ico',
  colors: {
    // Background colors
    background: {
      primary: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
      secondary: 'bg-gray-800',
      card: 'bg-gray-800/60',
      hover: 'hover:bg-gray-700',
    },
    // Text colors
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      muted: 'text-gray-400',
      accent: 'text-blue-500',
    },
    // Border colors
    border: {
      primary: 'border-gray-700',
      secondary: 'border-gray-600',
      accent: 'border-blue-500',
    },
    // Button colors
    button: {
      primary: 'bg-blue-600 hover:bg-blue-500 text-white',
      secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
      ghost: 'text-gray-300 hover:text-white hover:bg-gray-700',
      outline: 'border-gray-600 text-gray-300 hover:bg-gray-700',
    },
    // Accent colors
    accent: {
      primary: 'bg-blue-900/30 border-blue-700/50 text-blue-200',
      success: 'bg-green-900/30 border-green-700/50 text-green-200',
      warning: 'bg-yellow-900/30 border-yellow-700/50 text-yellow-200',
      error: 'bg-red-900/30 border-red-700/50 text-red-200',
    },
    // Projects specific colors
    projects: {
      timeline: 'bg-neutral-900/40 border-neutral-800/60',
      timelineHeader: 'border-neutral-800/60',
      timelineRow: 'hover:bg-neutral-800/30',
      form: 'bg-gray-800',
      formBorder: 'border-gray-700',
      input: 'bg-gray-900 border-gray-700 text-gray-100',
      panel: 'bg-gray-800',
      panelBorder: 'border-gray-700',
    },
    // Campaigns specific colors
    campaigns: {
      table: 'bg-gray-800 border-gray-700',
      tableHeader: 'bg-gray-700',
      tableRow: 'border-gray-700',
      tableRowHover: 'hover:bg-gray-700',
      form: 'bg-gray-800',
      formBorder: 'border-gray-700',
      input: 'bg-gray-900 border-gray-700 text-gray-100',
      inputDisabled: 'bg-gray-900 text-gray-300',
      modal: 'bg-gray-800',
      modalBorder: 'border-gray-700',
      importButton: 'bg-gray-700 hover:bg-gray-600 text-white',
    },
    // Settings specific colors
    settings: {
      table: 'bg-gray-800 border-gray-700',
      tableHeader: 'bg-gray-700',
      tableRow: 'border-gray-700',
      tableRowSelected: 'bg-gray-700',
      tableBorder: 'border-gray-700',
      form: 'bg-gray-800',
      formBorder: 'border-gray-700',
      input: 'bg-gray-900 border-gray-700 text-gray-100',
      toast: {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-gray-700',
      },
    },
    // Kanban specific colors
    kanban: {
      column: 'bg-neutral-900/40 border-neutral-800/60',
      columnDragOver: 'bg-blue-900/20 border-blue-500',
      card: 'bg-neutral-900/60 border-neutral-800/60 hover:bg-neutral-900/80',
      cardText: 'text-neutral-300',
      cardTextMuted: 'text-neutral-400',
      tag: 'bg-blue-900/30 border-blue-900/40 text-blue-300',
      tagUnread: 'bg-rose-900/40 text-rose-300',
      statusBadge: 'bg-neutral-800 text-neutral-300',
      drawer: 'bg-neutral-900 border-neutral-800',
      drawerMessages: 'bg-neutral-950',
      messageOutgoing: 'bg-blue-600 text-white',
      messageIncoming: 'bg-neutral-800 text-neutral-100',
      input: 'bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500',
      panel: 'bg-[#111827]/95 border-gray-700',
      avatar: 'bg-gray-700 text-white',
    },
  },
  // CSS Variables for more complex styling
  cssVariables: {
    '--background': '222.2 84% 4.9%',
    '--foreground': '210 40% 98%',
    '--primary': '217.2 91.2% 59.8%',
    '--primary-foreground': '222.2 47.4% 11.2%',
    '--secondary': '217.2 32.6% 17.5%',
    '--secondary-foreground': '210 40% 98%',
    '--accent': '217.2 32.6% 17.5%',
    '--accent-foreground': '210 40% 98%',
    '--destructive': '0 62.8% 30.6%',
    '--destructive-foreground': '210 40% 98%',
    '--muted': '217.2 32.6% 17.5%',
    '--muted-foreground': '215 20.2% 65.1%',
    '--card': '222.2 84% 4.9%',
    '--card-foreground': '210 40% 98%',
    '--popover': '222.2 84% 4.9%',
    '--popover-foreground': '210 40% 98%',
    '--border': '217.2 32.6% 17.5%',
    '--input': '217.2 32.6% 17.5%',
    '--ring': '224.3 76.3% 48%',
    '--radius': '0.5rem',
  },
};

export type Theme = typeof defaultTheme;

// Helper to get Kanban colors with theme fallback
export function getKanbanColors(theme: Theme) {
  return theme.colors.kanban || defaultTheme.colors.kanban;
}
