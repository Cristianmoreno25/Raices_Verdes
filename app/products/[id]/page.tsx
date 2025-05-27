// app/products/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [producto, setProducto] = useState<any>(null)
  const [comentarios, setComentarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducto = async () => {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          productor:productores (
            id,
            nombre_productor,
            logo_url,
            descripcion_comunidad
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error(error)
      } else {
        setProducto(data)
      }
    }

    const fetchComentarios = async () => {
      const { data, error } = await supabase
        .from('comentarios')
        .select('*')
        .eq('producto_id', id)
        .order('creado_en', { ascending: false })

      if (error) {
        console.error(error)
      } else {
        setComentarios(data)
      }
    }

    fetchProducto()
    fetchComentarios()
    setLoading(false)
  }, [id])

  if (loading || !producto) {
    return <p className="text-center text-green-700 py-10">Cargando producto...</p>
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Imagen principal */}
      <div className="relative w-full aspect-video bg-white border border-amber-100 rounded-xl shadow-md overflow-hidden">
        <Image
          src={producto.imagen_url}
          alt={producto.nombre}
          fill
          className="object-contain"
        />
      </div>

      {/* Información principal */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-green-900">{producto.nombre}</h1>
        <p className="text-amber-700 text-xl font-semibold">${producto.precio}</p>
        <p className="text-green-800">{producto.descripcion}</p>
        <p className="text-green-800">
          <strong>Stock disponible:</strong> {producto.stock}
        </p>
        {producto.historia && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700">Historia del producto</h3>
            <p className="text-green-900 mt-2">{producto.historia}</p>
          </div>
        )}
      </div>

      {/* Productor */}
      {producto.productor && (
        <div className="border-t pt-6 mt-6">
          <h2 className="text-xl font-bold text-green-900 mb-4">Productor</h2>
          <Link href={`/productor/${producto.productor.id}`} className="flex items-center gap-4 hover:opacity-80 transition">
            <Image
              src={producto.productor.logo_url}
              alt="Logo del productor"
              width={64}
              height={64}
              className="rounded-full border"
            />
            <div>
              <p className="text-green-800 font-semibold">{producto.productor.nombre_productor}</p>
              <p className="text-sm text-green-700">{producto.productor.descripcion_comunidad}</p>
            </div>
          </Link>
        </div>
      )}

      {/* Comentarios */}
      <div className="border-t pt-6 mt-6">
        <h2 className="text-xl font-bold text-green-900 mb-4">Comentarios</h2>
        {comentarios.length === 0 ? (
          <p className="text-green-700 italic">Este producto aún no tiene comentarios.</p>
        ) : (
          <div className="space-y-4">
            {comentarios.map((comentario) => (
              <div key={comentario.id} className="p-4 bg-white border rounded-lg shadow-sm">
                <p className="text-green-900">{comentario.contenido}</p>
                {comentario.puntuacion && (
                  <p className="text-amber-600 text-sm">Puntuación: {comentario.puntuacion} / 5</p>
                )}
                <p className="text-xs text-green-600 mt-1">
                  {new Date(comentario.creado_en).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
