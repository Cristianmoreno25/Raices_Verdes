'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function ProductsPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState('')
  const limit = 12
  const offset = useRef(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loaderRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  const fetchProductos = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre, precio, comunidad_origen, imagen_url')
      .order('creado_en', { ascending: false })
      .range(offset.current, offset.current + limit - 1)

    if (error) {
      setError('Error al cargar productos.')
      setLoading(false)
      return
    }

    if (data.length < limit) {
      setHasMore(false)
    }

    // Evitar productos duplicados
    setProductos((prev) => {
      const all = [...prev, ...data]
      const unique = Array.from(new Map(all.map(p => [p.id, p])).values())
      return unique
    })

    offset.current += limit
    setLoading(false)
  }, [loading, hasMore])

  // Scroll infinito
  useEffect(() => {
    if (!loaderRef.current) return
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) fetchProductos()
    })

    observerRef.current.observe(loaderRef.current)
  }, [fetchProductos])

  useEffect(() => {
    fetchProductos()
  }, [])

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-4xl font-bold text-green-800 mb-8 text-center">
        Productos disponibles
      </h1>

      {productos.length === 0 && !loading && (
        <p className="text-center text-gray-600 text-lg">No hay productos en este momento.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
          <motion.div
            key={producto.id}
            className="bg-white rounded-2xl border border-amber-200 shadow hover:shadow-lg cursor-pointer transition"
            onClick={() => router.push(`/products/${producto.id}`)}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-full h-48 relative overflow-hidden rounded-t-2xl">
            <div className="relative w-full aspect-video bg-white border border-amber-100 rounded-xl shadow-md overflow-hidden">
              <Image
                src={producto.imagen_url}
                alt={producto.nombre}
                fill
                className="object-contain"
              />
            </div>
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold text-green-900 mb-1">{producto.nombre}</h2>
              <p className="text-green-700 font-bold">
                ${Number(producto.precio).toLocaleString('es-CO')}
              </p>
              <p className="text-sm text-gray-600">{producto.comunidad_origen}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {loading && (
        <p className="text-center mt-6 text-green-700 font-semibold">Cargando más productos...</p>
      )}

      <div ref={loaderRef} className="h-8" />
    </motion.div>
  )
}
