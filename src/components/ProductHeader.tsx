"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Pencil, Settings, LogOut, User, Rocket } from "lucide-react";
import Image from "next/image";

export type ProductHeaderProps = {
  products: Array<{ id: string; name: string }>;
  productsLoading: boolean;
  selectedProductId: string | "";
  isAdmin?: boolean;
  userName?: string;
  userPhotoUrl?: string;
  userInitials?: string;
  showProductActions?: boolean;
  showOnboardingButton?: boolean;
  onChangeProduct: (productId: string) => void;
  onCreateProduct: () => void;
  onEditProduct: () => void;
  onOpenProductSettings: () => void;
  onLogout?: () => void;
  onStartOnboarding?: () => void;
};

export default function ProductHeader(props: ProductHeaderProps) {
  const {
    products,
    productsLoading,
    selectedProductId,
    isAdmin,
    userName,
    userPhotoUrl,
    userInitials,
    showProductActions = false,
    showOnboardingButton = false,
    onChangeProduct,
    onCreateProduct,
    onEditProduct,
    onOpenProductSettings,
    onLogout,
    onStartOnboarding,
  } = props;
  
  const { theme } = useTheme();

  return (
    <header className={`fixed top-0 left-0 right-0 z-[60] flex items-center h-16 ${theme.colors.background.secondary} ${theme.colors.border.primary} border-b px-4 transition-all duration-400 ease-out opacity-100 translate-y-0`}>
      {/* Logo */}
      <div className="px-2 flex items-center">
        <Image 
          src={theme.logoSquare} 
          alt="Logo" 
          width={42} 
          height={42} 
          priority 
          fetchPriority="high" 
          sizes="42px"
          onError={(e) => {
            e.currentTarget.src = '/images/logo.png';
          }}
        />
      </div>
      {/* Seletor de produtos */}
      <div className="flex-1 px-2">
        <div className="max-w-xl flex items-center gap-2">
          <label htmlFor="products-select" className="sr-only">Produtos</label>
          <select
            id="products-select"
            className={`w-full rounded-md px-3 py-2 text-sm border ${theme.colors.background.secondary} ${theme.colors.text.primary} ${theme.colors.border.secondary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
            disabled={productsLoading}
            value={selectedProductId || ''}
            onChange={(e) => onChangeProduct(e.target.value)}
          >
            <option value="" disabled>
              {productsLoading ? 'Carregando produtos...' : 'Selecione um produto'}
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {isAdmin && showProductActions && (
            <Button
              type="button"
              variant="secondary"
              className={theme.colors.button.primary}
              onClick={onCreateProduct}
              title="Incluir produto"
            >
              <Plus className="h-4 w-4 mr-1" /> Incluir
            </Button>
          )}
          {isAdmin && showProductActions && (
            <>
              <Button
                type="button"
                variant="secondary"
                className={theme.colors.button.secondary}
                onClick={onEditProduct}
                disabled={!selectedProductId}
                title="Editar produto selecionado"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className={theme.colors.button.secondary}
                onClick={onOpenProductSettings}
                disabled={!selectedProductId}
                title="Settings do produto (parâmetros)"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Temporary Onboarding Button */}
      {showOnboardingButton && onStartOnboarding && (
        <Button
          type="button"
          variant="secondary"
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white mr-4"
          onClick={onStartOnboarding}
          title="Iniciar configuração Evolution"
        >
          <Rocket className="h-4 w-4 mr-2" />
          Configurar Evolution
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <span className={`text-sm ${theme.colors.text.primary}`}>{userName || 'Usuário'}</span>
            <Avatar>
              {userPhotoUrl ? (
                <AvatarImage src={userPhotoUrl} alt={userName || 'Avatar'} />
              ) : null}
              <AvatarFallback className={theme.colors.text.primary}>{userInitials}</AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 z-[70]">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <User className="mr-2 h-4 w-4" />
            <span>{userName || 'Usuário'}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
