"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, Loader2, AlertCircle, List } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { apiService } from "@/lib/api";

type Product = {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  product_type_id?: string | null;
};

type StepSelectProductProps = {
  onNext: (productId: string) => void;
  onCancel?: () => void;
};

export default function StepSelectProduct({ onNext, onCancel }: StepSelectProductProps) {
  const { theme } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiService.getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        setError("Não foi possível carregar os produtos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    setDialogOpen(false);
  };

  const handleContinue = () => {
    if (selectedProductId) {
      onNext(selectedProductId);
    }
  };

  // Get first 4 products for display, ensuring selected product is visible
  const displayedProducts = useMemo(() => {
    if (!selectedProductId) {
      return products.slice(0, 4);
    }
    
    // Check if selected product is in first 4
    const first4 = products.slice(0, 4);
    const isInFirst4 = first4.some(p => p.id === selectedProductId);
    
    if (isInFirst4) {
      return first4;
    }
    
    // Selected product is not in first 4, put it first
    const selectedProduct = products.find(p => p.id === selectedProductId);
    if (selectedProduct) {
      // Remove selected from list and add it first, then take first 4
      const otherProducts = products.filter(p => p.id !== selectedProductId);
      return [selectedProduct, ...otherProducts].slice(0, 4);
    }
    
    return first4;
  }, [products, selectedProductId]);
  
  const hasMoreProducts = products.length > 4;

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className={theme.colors.text.muted}>Carregando produtos...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className={`rounded-lg p-4 flex gap-3 border ${theme.colors.accent.error}`}>
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Erro ao carregar produtos</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
        <div className="flex justify-center">
          <Button
            onClick={() => window.location.reload()}
            className={theme.colors.button.primary}
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className={`text-lg font-semibold mb-2 ${theme.colors.text.primary}`}>Nenhum produto disponível</h3>
        <p className={`text-sm ${theme.colors.text.muted}`}>Não há produtos configurados no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className={`rounded-lg p-4 border ${theme.colors.accent.primary}`}>
        <h2 className={`text-lg font-semibold mb-2 ${theme.colors.text.primary}`}>Bem-vindo à Autonom.ia!</h2>
        <p className={`text-sm ${theme.colors.text.secondary}`}>
          Para começar, selecione o produto que melhor atende às suas necessidades. 
          Você poderá adicionar mais produtos posteriormente nas configurações.
        </p>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedProducts.map((product) => {
          const isSelected = selectedProductId === product.id;

          return (
            <Card
              key={product.id}
              className={`
                relative cursor-pointer transition-all duration-300 hover:scale-105
                ${theme.colors.background.card} ${theme.colors.border.primary}
                ${isSelected 
                  ? "border-blue-500 border-2 shadow-lg shadow-blue-500/20" 
                  : `hover:${theme.colors.background.hover}`
                }
              `}
              onClick={() => handleProductSelect(product.id)}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-1">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              )}

              <CardHeader>
                <CardTitle className={`text-lg ${theme.colors.text.primary}`}>{product.name}</CardTitle>
                <CardDescription className={`line-clamp-3 ${theme.colors.text.muted}`}>
                  {product.description || "Sem descrição disponível"}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Show All Products Button */}
      {hasMoreProducts && (
        <div className="flex justify-center">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className={theme.colors.button.outline}
              >
                <List className="h-4 w-4 mr-2" />
                Ver Todos os Produtos ({products.length})
              </Button>
            </DialogTrigger>
            <DialogContent className={`max-w-4xl max-h-[80vh] overflow-y-auto ${theme.colors.background.card} ${theme.colors.border.primary}`}>
              <DialogHeader>
                <DialogTitle className={theme.colors.text.primary}>Todos os Produtos</DialogTitle>
                <DialogDescription className={theme.colors.text.muted}>
                  Selecione um produto da lista completa
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {products.map((product) => {
                  const isSelected = selectedProductId === product.id;
                  
                  return (
                    <Card
                      key={product.id}
                      className={`
                        relative cursor-pointer transition-all duration-300 hover:scale-105
                        ${theme.colors.background.card} ${theme.colors.border.primary}
                        ${
                          isSelected 
                            ? "border-blue-500 border-2 shadow-lg shadow-blue-500/20" 
                            : `hover:${theme.colors.background.hover}`
                        }
                      `}
                      onClick={() => handleProductSelect(product.id)}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-1">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className={`text-sm ${theme.colors.text.primary}`}>{product.name}</CardTitle>
                        <CardDescription className={`text-xs line-clamp-2 ${theme.colors.text.muted}`}>
                          {product.description || "Sem descrição disponível"}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          onClick={onCancel}
          variant="ghost"
          className={`px-8 py-2 ${theme.colors.button.ghost}`}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedProductId}
          className={`px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed ${theme.colors.button.primary}`}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
