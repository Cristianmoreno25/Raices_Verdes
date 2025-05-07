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
  const [userId, setUserId] = useState<string | null>(null)

  const limit = 12
  const offset = useRef(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loaderRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  // Verifica si hay sesión activa
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUserId(session.user.id)
      }
    }
    getSession()
  }, [])

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

     setProductos((prev) => {
      const all = [...prev, ...data]
      const unique = Array.from(new Map(all.map(p => [p.id, p])).values())
      return unique
    })

    offset.current += limit
    setLoading(false)
  }, [loading, hasMore])

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

  const agregarAlCarrito = async (producto: any) => {
    if (!userId) {
      router.push('/auth/login')
      return
    }

    // Verifica si el producto ya está en el carrito
    const { data: existente } = await supabase
      .from('carritos')
      .select('id, cantidad')
      .eq('cliente_id', userId)
      .eq('producto_id', producto.id)
      .single()

    if (existente) {
      // Si el producto ya existe, actualiza la cantidad
      const { error: updateError } = await supabase
        .from('carritos')
        .update({ cantidad: existente.cantidad + 1 })
        .eq('id', existente.id)

      if (updateError) {
        alert('Error al actualizar el carrito.')
      } else {
        alert('Cantidad actualizada en el carrito ✅')
      }
    } else {
      // Si el producto no existe, lo agrega al carrito
      const { error: insertError } = await supabase.from('carritos').insert({
        cliente_id: userId,
        producto_id: producto.id,
        cantidad: 1,
      })

      if (insertError) {
        alert('Error al agregar al carrito.')
      } else {
        alert('Producto agregado al carrito ✅')
      }
    }
  }

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
            className="bg-white rounded-2xl border border-amber-200 shadow hover:shadow-lg transition"
            whileHover={{ scale: 1.02 }}
          >
            <div
              onClick={() => router.push(`/products/${producto.id}`)}
              className="cursor-pointer"
            >
              <div className="relative w-full aspect-video bg-white border border-amber-100 rounded-t-2xl overflow-hidden">
                <Image
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-green-900 mb-1">{producto.nombre}</h2>
                <p className="text-green-700 font-bold">
                  ${Number(producto.precio).toLocaleString('es-CO')}
                </p>
                <p className="text-sm text-gray-600">{producto.comunidad_origen}</p>
              </div>
            </div>
            <div className="p-4 pt-0">
              <button
                onClick={() => agregarAlCarrito(producto)}
                className="mt-2 w-full bg-green-700 text-white py-2 px-4 rounded-xl hover:bg-green-800 transition"
              >
                Agregar al carrito 🛒
              </button>
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
