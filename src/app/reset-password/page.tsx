'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from 'next/image';
import Link from 'next/link';

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [searchParams]);

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('A nova senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um carácter especial.');
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/reset-password`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível redefinir a senha.');
      }

      setMessage('Senha redefinida com sucesso! A ser redirecionado para o login...');
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao redefinir senha.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-gray-900 p-4">
      <Card className="w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleResetPassword}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Image src="/images/logo.png" alt="Autonom.ia Logo" width={120} height={32} />
            </div>
            <CardTitle className="text-2xl dark:text-white">Redefinir Senha</CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              Insira o código de verificação e a sua nova senha.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="code" className="block text-sm font-medium text-foreground dark:text-gray-300">Código de Verificação</Label>
              <Input id="code" type="text" placeholder="123456" required value={code} onChange={(e) => setCode(e.target.value)} disabled={isLoading} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password" className="block text-sm font-medium text-foreground dark:text-gray-300">Nova Senha</Label>
              <Input id="new-password" type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isLoading} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password" className="block text-sm font-medium text-foreground dark:text-gray-300">Confirmar Nova Senha</Label>
              <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            </div>
            {error && <p className="text-sm font-medium text-red-500 text-center">{error}</p>}
            {message && <p className="text-sm font-medium text-green-500 text-center">{message}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-4">
            <Button className="w-full dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white" type="submit" disabled={isLoading}>
              {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-200">Carregando…</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
