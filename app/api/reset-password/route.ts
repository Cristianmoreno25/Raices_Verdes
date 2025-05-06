// app/api/reset-password/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';  // <— aquí cambias la ruta

export async function POST(req: Request) {
  const { email } = await req.json();

  // usa el mismo cliente que usas en el navegador
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `'http://localhost:3000/password-recovery/confirm'`,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: 'Correo de recuperación enviado' });
}
