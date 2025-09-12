"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Função para log no console com identificação visual clara
function debugLog(message: string, data: unknown = undefined) {
  console.log(`%c[FORM DEBUG] ${message}`, 'background: #222; color: #bada55', data !== undefined ? data : '');
}

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [message] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Controla se o formulário foi submetido para mostrar validações
  const [formSubmitted, setFormSubmitted] = useState(false);
  const router = useRouter();

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Efeito para garantir que formSubmitted seja false ao inicializar
  // e ao alternar entre login e registro
  // Efeito principal para resetar formSubmitted quando alternar formulários
  useEffect(() => {
    debugLog(`isRegister mudou para: ${isRegister}`);
    // Resetar validação ao alternar entre formulários
    setFormSubmitted(false);
  }, [isRegister]);
  
  // Efeito para monitorar mudanças em formSubmitted
  useEffect(() => {
    debugLog(`Estado formSubmitted mudou para: ${formSubmitted}`);
  }, [formSubmitted]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ativar validação ao submeter
    debugLog('Login submit - setFormSubmitted(true)');
    setFormSubmitted(true);

    // Não prosseguir se campos obrigatórios estiverem vazios
    if (!email || !password) {
      debugLog('Login - campos obrigatórios vazios', { email: email || '', password: password ? '*******' : '' });
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha no login');
      }

      console.log('Dados recebidos do login:', data);

      // Armazenar dados do usuário e tokens no localStorage
      // O backend não inclui os dados do usuário, apenas tokens de autenticação
      // Vamos armazenar o email usado no login para buscar os dados depois
      localStorage.setItem('userData', JSON.stringify({
        user: { email }, // Armazenando email usado no login
        email: email, // Também armazenando o email em primeiro nível
        // Armazenando tokens separadamente para uso adequado em diferentes APIs
        AccessToken: data.AccessToken, // Para chamar APIs do próprio Cognito
        IdToken: data.IdToken, // Para API Gateway com Cognito Authorizer
        RefreshToken: data.RefreshToken, // Para renovar tokens
        // Mantendo token para compatibilidade, mas usando IdToken como padrão
        token: data.IdToken || data.AccessToken || data.token,
        isAuthenticated: true
      }));
      
      console.log('Tokens armazenados:', {
        IdToken: data.IdToken?.substring(0, 20) + '...' || 'não disponível',
        AccessToken: data.AccessToken?.substring(0, 20) + '...' || 'não disponível'
      });
      
      // Redirecionar para a página de monitoramento
      router.push('/monitoring');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha no login';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ativar validação ao submeter
    debugLog('Register submit - setFormSubmitted(true)');
    setFormSubmitted(true);

    // Não prosseguir se campos obrigatórios estiverem vazios
    if (!email || !password || !confirmPassword || !name || !phone) {
      debugLog('Register - campos obrigatórios vazios', { 
        email: email || '',
        password: password ? '*******' : '', 
        confirmPassword: confirmPassword ? '*******' : '', 
        name: name || '', 
        phone: phone || '' 
      });
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!passwordRegex.test(password)) {
        setError('A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial.');
        return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha no registro');
      }

      router.push(`/confirm-email?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha no registro';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 300 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -300 },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-gray-900">
      <Card className="w-full max-w-md mx-auto overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <Image src="/images/logo.png" alt="Autonom.ia Logo" width={150} height={150} />
          </div>
          <AnimatePresence mode="wait">
            {!isRegister ? (
              <motion.div
                key="login"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={formVariants}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleLogin}>
                  <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold dark:text-white">Login</CardTitle>
                    <CardDescription className="dark:text-gray-400">Digite seu email e senha para acessar sua conta</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="block text-sm font-medium text-foreground dark:text-gray-300">Email</Label>
                      <Input id="email" type="email" placeholder="m@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)}  disabled={isLoading} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                      {formSubmitted && !email && (
                        <p className="text-sm font-medium text-red-500 mt-1">Email é obrigatório</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password" className="block text-sm font-medium text-foreground dark:text-gray-300">Senha</Label>
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}  disabled={isLoading} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                      {formSubmitted && !password && (
                        <p className="text-sm font-medium text-red-500 mt-1">Senha é obrigatória</p>
                      )}
                      <div className="text-right -mt-2">
                          <Button variant="link" asChild className="p-0 h-auto text-xs font-normal text-muted-foreground dark:text-gray-400 hover:dark:text-blue-400">
                              <Link href="/forgot-password">Esqueceu a sua senha?</Link>
                          </Button>
                      </div>
                    </div>
                    {error && <p className="text-sm font-medium text-red-500 text-center">{error}</p>}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white" type="submit" disabled={isLoading}>
                      {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>
                    <div className="text-center">
                        <Button variant="link" onClick={() => { 
                            debugLog('Botão: Mudando para registro');
                            // Primeiro resetar formSubmitted para evitar validações prematuras
                            setFormSubmitted(false);
                            // Depois mudar o modo
                            // Usamos requestAnimationFrame para garantir que o formSubmitted seja resetado
                            // antes de qualquer renderização
                            requestAnimationFrame(() => {
                              setIsRegister(true); 
                              setError(''); 
                              // Limpar todos os campos do formulário
                              setName('');
                              setPhone('');
                              setEmail('');
                              setPassword('');
                              setConfirmPassword('');
                              debugLog('Mudança para registro concluída');
                            });
                        }} className="text-sm font-normal text-muted-foreground dark:text-gray-400 hover:dark:text-blue-400">
                            Não tem uma conta? Cadastre-se
                        </Button>
                    </div>
                  </CardFooter>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={formVariants}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleRegister}>
                  <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold dark:text-white">Cadastro</CardTitle>
                    <CardDescription className="dark:text-gray-400">Crie sua conta para começar</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 pb-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="dark:text-gray-300">Nome</Label>
                      <Input id="name" placeholder="Seu Nome" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                      {formSubmitted && !name && (
                        <p className="text-sm font-medium text-red-500 mt-1">Nome é obrigatório</p>
                      )}
                    </div>
                     <div className="grid gap-2">
                      <Label htmlFor="phone" className="dark:text-gray-300">Telefone</Label>
                      <Input id="phone" placeholder="(99) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isLoading} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                      {formSubmitted && !phone && (
                        <p className="text-sm font-medium text-red-500 mt-1">Telefone é obrigatório</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
                      <Input id="email" type="email" placeholder="m@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)}  disabled={isLoading} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                      {formSubmitted && !email && (
                        <p className="text-sm font-medium text-red-500 mt-1">Email é obrigatório</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password" className="dark:text-gray-300">Senha</Label>
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}  disabled={isLoading} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                      {formSubmitted && !password && (
                        <p className="text-sm font-medium text-red-500 mt-1">Senha é obrigatória</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password" className="dark:text-gray-300">Confirmar Senha</Label>
                      <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                      {formSubmitted && !confirmPassword && (
                        <p className="text-sm font-medium text-red-500 mt-1">Confirmação de senha é obrigatória</p>
                      )}
                      {formSubmitted && confirmPassword && password && confirmPassword !== password && (
                        <p className="text-sm font-medium text-red-500 mt-1">As senhas não coincidem</p>
                      )}
                    </div>
                    {error && <p className="text-sm font-medium text-red-500 text-center">{error}</p>}
                    {message && <p className="text-sm font-medium text-green-500 text-center">{message}</p>}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white" type="submit" disabled={isLoading}>
                      {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                    </Button>
                    <div className="text-center">
                        <Button variant="link" onClick={() => { 
                            debugLog('Botão: Mudando para login');
                            // Primeiro resetar formSubmitted para evitar validações prematuras
                            setFormSubmitted(false);
                            // Depois mudar o modo
                            // Usamos requestAnimationFrame para garantir que o formSubmitted seja resetado
                            // antes de qualquer renderização
                            requestAnimationFrame(() => {
                              setIsRegister(false);
                              setError(''); 
                              // Limpar todos os campos do formulário
                              setName('');
                              setPhone('');
                              setEmail('');
                              setPassword('');
                              setConfirmPassword('');
                              debugLog('Mudança para login concluída');
                            });
                        }} className="text-sm font-normal text-muted-foreground dark:text-gray-400 hover:dark:text-blue-400">
                            Já tem uma conta? Faça login
                        </Button>
                    </div>
                  </CardFooter>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
}
