import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { sosApi } from '../api/sos';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { setJwt, setCachedCuits } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await sosApi.login(email, password);
      
      // Ajuste heuristico para la respuesta de login
      const token = response?.jwt || response?.token || response?.access_token;
      
      if (token) {
        setJwt(token);
        if (response.cuits && Array.isArray(response.cuits)) {
           setCachedCuits(response.cuits);
        }
      } else {
        setError('No se recibió el token de autenticación del servidor');
      }
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-bg-app px-4 font-sans">
      <div className="w-full max-w-md rounded-[12px] bg-white p-[30px] shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-border-main">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-main mb-4">
            <LogIn className="h-8 w-8 text-primary-main" />
          </div>
          <h2 className="text-[24px] font-bold text-primary-main">
            SOS Contador
          </h2>
          <p className="mt-2 text-[13px] text-text-muted">
            Iniciá sesión para acceder a tu estudio
          </p>
        </div>
        
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-[6px] bg-red-50 p-4 text-[13px] text-red-700 border border-red-200">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-text-muted tracking-[0.5px] mb-1" htmlFor="email">
                Correo Electrónico / Usuario
              </label>
              <input
                id="email"
                type="text"
                required
                className="mt-1 block w-full rounded-[6px] border border-border-main px-3 py-2 text-text-main placeholder-text-muted focus:border-primary-main focus:outline-none text-[13px]"
                placeholder="ejemplo@estudio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-text-muted tracking-[0.5px] mb-1" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 block w-full rounded-[6px] border border-border-main px-3 py-2 text-text-main placeholder-text-muted focus:border-primary-main focus:outline-none text-[13px]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-[6px] bg-primary-main px-4 py-2 font-bold text-white hover:bg-opacity-90 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-[14px]"
            >
              {isLoading ? 'Autenticando...' : 'Ingresar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
