// app/api/comments/[productId]/route.ts
import { NextResponse } from 'next/server'
import { rest } from '@/lib/supabaseRest'

export async function GET(
  _req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const comments = await rest(
      `comentarios?producto_id=eq.${params.productId}&order=creado_en.desc`
    )
    return NextResponse.json(comments)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { content, rating } = await req.json()
  try {
    const newComment = await rest('comentarios', {
      method: 'POST',
      headers: { Authorization: auth },
      body: JSON.stringify({
        producto_id: params.productId,
        autor_id: null,          // RLS asigna auth.uid()
        contenido: content,
        puntuacion: rating,
      }),
    })
    return NextResponse.json(newComment, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
