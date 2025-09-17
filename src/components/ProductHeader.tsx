"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Pencil, Settings } from "lucide-react";
import Image from "next/image";

export type ProductHeaderProps = {
  products: Array<{ id: string; name: string }>;
  productsLoading: boolean;
  selectedProductId: string | "";
  isAdmin?: boolean;
  userName?: string;
  userPhotoUrl?: string;
  userInitials?: string;
  onChangeProduct: (productId: string) => void;
  onCreateProduct: () => void;
  onEditProduct: () => void;
  onOpenProductSettings: () => void;
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
    onChangeProduct,
    onCreateProduct,
    onEditProduct,
    onOpenProductSettings,
  } = props;

  return (
    <header className={`fixed top-0 left-0 right-0 z-[60] flex items-center h-16 bg-gray-800 text-white px-4 transition-all duration-400 ease-out opacity-100 translate-y-0`}>
      {/* Logo */}
      <div className="px-2 flex items-center">
        <Image src="/images/logo.png" alt="Autonom.ia Logo" width={28} height={28} />
      </div>
      {/* Seletor de produtos */}
      <div className="flex-1 px-2">
        <div className="max-w-xl flex items-center gap-2">
          <label htmlFor="products-select" className="sr-only">Produtos</label>
          <select
            id="products-select"
            className="select-clean w-full"
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
          {isAdmin && (
            <Button
              type="button"
              variant="secondary"
              className="bg-blue-600 hover:bg-blue-500 text-white"
              onClick={onCreateProduct}
              title="Incluir produto"
            >
              <Plus className="h-4 w-4 mr-1" /> Incluir
            </Button>
          )}
          {isAdmin && (
            <>
              <Button
                type="button"
                variant="secondary"
                className="bg-gray-700 hover:bg-gray-600 text-white"
                onClick={onEditProduct}
                disabled={!selectedProductId}
                title="Editar produto selecionado"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="bg-gray-700 hover:bg-gray-600 text-white"
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

      <div className="flex items-center gap-2 cursor-pointer">
        <span className="text-sm">{userName || 'Usuário'}</span>
        <Avatar>
          {userPhotoUrl ? (
            <AvatarImage src={userPhotoUrl} alt={userName || 'Avatar'} />
          ) : null}
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
