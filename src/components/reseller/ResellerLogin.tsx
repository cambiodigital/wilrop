'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigationStore } from '@/store/useNavigationStore';
import { BrandWordmark } from '@/components/brand/BrandWordmark';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function ResellerLogin() {
  const { loginReseller } = useNavigationStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Completa correo y contraseña');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[ResellerLogin] Attempting login for:', email);

      const response = await fetch('/api/reseller/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('[ResellerLogin] Response status:', response.status);

      const data = await response.json().catch(() => ({}));
      console.log('[ResellerLogin] Response body:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Credenciales inválidas');
      }

      loginReseller(data.reseller?.name || 'Socio');
      router.push('/reseller');
      toast.success(`Bienvenido, ${data.reseller?.name || 'Socio'}`);
    } catch (error) {
      console.error('[ResellerLogin] Login failed:', error);
      const message = error instanceof Error ? error.message : 'No se pudo iniciar sesión';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 relative overflow-hidden text-card-foreground">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-xl border-amber-200/50 backdrop-blur-sm bg-card/90 text-card-foreground">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex justify-center">
              <BrandWordmark className="justify-center" />
            </CardTitle>
            <CardDescription className="text-amber-700 font-semibold text-sm">
              Panel de Socios / Revendedores
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electronico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="socio@wilrop.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-amber-200 focus-visible:border-amber-400 focus-visible:ring-amber-400/30"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contrasena</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="........"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-amber-200 focus-visible:border-amber-400 focus-visible:ring-amber-400/30"
                    required
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700 text-center">
                  En producción usa credenciales configuradas. En desarrollo puede existir una cuenta demo.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold h-11 shadow-lg shadow-amber-500/25 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  'Iniciar Sesion'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border">
              <button
                onClick={() => router.push('/')}
                className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-amber-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al Portal
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-center text-sm text-muted-foreground mb-2">
                ¿Aún no eres revendedor?
              </p>
              <Button
                variant="outline"
                className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                onClick={() => router.push('/reseller/register')}
              >
                Solicitar registro
              </Button>
            </div>
          </CardContent>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          2025 WILROP Colombia Travel. Todos los derechos reservados.
        </motion.p>
      </motion.div>
    </div>
  );
}
