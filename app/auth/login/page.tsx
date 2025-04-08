// app/auth/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars } from "react-icons/fa";
import { User, Mail, Lock } from "lucide-react";
import { supabase } from "@/utils/supabase/client";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const user = signInData.user!;

    // Verificar si es productor
    const { data: productor } = await supabase
      .from("productores")
      .select("correo_confirmado, documento_verificado")
      .eq("id", user.id)
      .single();

    if (productor) {
      if (!productor.correo_confirmado || !productor.documento_verificado) {
        await supabase.auth.signOut();
        setError(
          "Tu cuenta de productor no está verificada. Confirma tu correo y documento."
        );
        setLoading(false);
        return;
      }
      router.push("/profile/producer");
      return;
    }

    // Verificar si es cliente
    const { data: cliente } = await supabase
      .from("clientes")
      .select("id")
      .eq("id", user.id)
      .single();

    if (cliente) {
      router.push("/products");
    } else {
      setError("No tienes un perfil de cliente o productor registrado.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-amber-100"
      >
        <h1 className="text-3xl font-bold text-green-800 mb-6 flex items-center justify-center">
          <User className="mr-2" /> Iniciar Sesión
        </h1>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 text-red-600 bg-red-100 p-2 rounded flex items-center"
            >
              <Lock className="mr-2" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-4 relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
          <input
            type="email"
            placeholder="Correo Electrónico"
            className="w-full pl-10 border border-amber-100 p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6 relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full pl-10 border border-amber-100 p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <FaBars />
            </motion.span>
          ) : (
            "Iniciar Sesión"
          )}
        </button>

        <p className="mt-4 text-center text-green-600">
          ¿No tienes cuenta?{" "}
          <Link
            href="/role-selection"
            className="font-semibold hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </motion.form>
    </main>
  );
};

export default LoginPage;
