'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from 'next/image';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/forgot-password`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível enviar o e-mail de recuperação.');
      }

      setMessage('Se o e-mail estiver registado, receberá um código de verificação em breve.');

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar email de recuperação.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-gray-900 p-4">
      <Card className="w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleForgotPassword}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Image src="/images/logo.png" alt="Autonom.ia Logo" width={120} height={32} />
            </div>
            <CardTitle className="text-2xl dark:text-white">Recuperar Senha</CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              Insira o seu e-mail para receber um código de recuperação.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="block text-sm font-medium text-foreground dark:text-gray-300">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@exemplo.com" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={isLoading} 
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            {error && <p className="text-sm font-medium text-red-500 text-center">{error}</p>}
            {message && <p className="text-sm font-medium text-green-500 text-center">{message}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-4">
            <Button className="w-full dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white" type="submit" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar E-mail de Recuperação'}
            </Button>
            <Button variant="link" asChild className="p-0 h-auto font-normal text-muted-foreground dark:text-gray-400 hover:dark:text-blue-400">
                <Link href="/login">
                    Voltar para o Login
                </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
