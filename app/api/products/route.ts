import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';  // importa tu cliente aquí

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const comunidad = searchParams.get('comunidad');
  const precioMin = searchParams.get('precioMin');
  const precioMax = searchParams.get('precioMax');
  const from      = Number(searchParams.get('from') ?? '0');
  const to        = Number(searchParams.get('to') ?? '11');

  let builder = supabase
    .from('productos')
    .select('*')
    .range(from, to);

  if (comunidad) builder = builder.eq('comunidad_origen', comunidad);
  if (precioMin) builder = builder.gte('precio', Number(precioMin));
  if (precioMax) builder = builder.lte('precio', Number(precioMax));

  const { data, error } = await builder;

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}