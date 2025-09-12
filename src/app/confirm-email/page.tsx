"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

function ConfirmEmailComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const email = searchParams.get('email');
  const name = searchParams.get('name');
  const phone = searchParams.get('phone');

  useEffect(() => {
    if (!email) {
      setError('Email não encontrado. Por favor, tente o processo de registro novamente.');
    }
  }, [email]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError('');
    setMessage('');

    if (!email || !name || !phone) {
        setError('Informações do usuário ausentes. Por favor, reinicie o processo de cadastro.');
        setIsLoading(false);
        return;
    }

    if (!code || code.length !== 6) {
        setError('Por favor, insira um código de confirmação válido com 6 dígitos.');
        setIsLoading(false);
        return;
    }

    try {
      // Detect domain from current hostname (e.g., empresta.autonomia.site -> 'empresta')
      let detectedDomain = 'autonomia';
      if (typeof window !== 'undefined') {
        const host = window.location.hostname; // e.g. empresta.autonomia.site
        // If host ends with autonomia.site and has a subdomain, use it; otherwise fallback to 'autonomia'
        const parts = host.split('.');
        if (parts.length >= 3 && host.endsWith('autonomia.site')) {
          const sub = parts[0];
          if (sub && sub !== 'www' && sub !== 'portal') {
            detectedDomain = sub;
          } else if (sub === 'portal') {
            // Map 'portal' to main domain
            detectedDomain = 'autonomia';
          }
        }
      }
      // 1. Confirm user in Cognito
      const confirmResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, confirmationCode: code }),
      });

      const confirmData = await confirmResponse.json();

      if (!confirmResponse.ok) {
        throw new Error(confirmData.message || 'Código de confirmação inválido ou expirado.');
      }

      // 2. Register user profile in our database
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_PROFILE_API_URL}/Autonomia/Profile/Register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, email, domain: detectedDomain }),
      });

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
          // TODO: Handle profile creation failure more gracefully. Maybe a retry mechanism?
          throw new Error(profileData.message || 'Falha ao criar o perfil de usuário.');
      }

      setMessage('Email confirmado com sucesso!');
      // Redirecionar imediatamente para o login
      router.push('/login?message=Sua conta foi confirmada com sucesso. Faça o login para continuar.');

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao confirmar email.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-gray-900">
        <Card className="w-full max-w-md mx-auto dark:bg-gray-800 dark:border-gray-700">
            <form onSubmit={handleConfirm}>
                <CardHeader className="space-y-1 text-center">
                    <Image src="/images/logo.png" alt="Autonom.ia Logo" width={150} height={150} className="mx-auto" />
                    <CardTitle className="text-2xl font-bold dark:text-white">Confirme seu Email</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Enviamos um código de 6 dígitos para {email}. Por favor, insira-o abaixo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="code" className="block text-sm font-medium text-foreground dark:text-gray-300">Código de Confirmação</Label>
                        <Input 
                            id="code" 
                            type="text" 
                            placeholder="123456" 
                            required 
                            value={code} 
                            onChange={(e) => setCode(e.target.value)} 
                            disabled={isLoading} 
                            className="dark:bg-gray-700 dark:text-white dark:border-gray-600 text-center tracking-widest text-lg" 
                            maxLength={6}
                        />
                    </div>
                    {error && <p className="text-sm font-medium text-red-500 text-center">{error}</p>}
                    {message && <p className="text-sm font-medium text-green-500 text-center">{message}</p>}
                </CardContent>
                <CardFooter className="flex flex-col gap-4 pt-4">
                    <Button className="w-full dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white" type="submit" disabled={isLoading}>
                        {isLoading ? 'Confirmando...' : 'Confirmar'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    </div>
  );
}

export default function ConfirmEmailPage() {
    return (
        <Suspense fallback={<div className='flex items-center justify-center min-h-screen'>Carregando...</div>}>
            <ConfirmEmailComponent />
        </Suspense>
    );
}
