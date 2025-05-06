// app/password-recovery/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';  // tu cliente de Supabase ya existente

export default function PasswordRecoveryRequest() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `http://localhost:3000/password-recovery/confirm`,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Revisa tu correo para seguir el link de restablecimiento.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-amber-100"
      >
        <h1 className="text-2xl font-bold text-green-800 mb-6">
          Recuperar contraseña
        </h1>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            placeholder="tu@correo.com"
            className="w-full p-2 border border-amber-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar correo'}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm">
          ¿Volver al&nbsp;
          <Link href="/password-recovery/confirm" className="text-green-600 hover:underline">
            inicio de sesión
          </Link>
          ?
        </p>
      </form>
    </div>
  );
}
