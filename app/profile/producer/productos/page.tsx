'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Pencil, Trash2, PlusCircle } from 'lucide-react'
import Link from 'next/link'

export default function ProductosPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProductos = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/')
        return
      }

      // Verificar si es un productor registrado
      const { data: productor, error: productorError } = await supabase
        .from('productores')
        .select('id')
        .eq('id', user.id)
        .single()

      if (productorError || !productor) {
        router.push('/')
        return
      }

      // Cargar productos del productor
      const { data: productosData, error: productosError } = await supabase
        .from('productos')
        .select('*')
        .eq('productor_id', user.id)
        .order('creado_en', { ascending: false })

      if (productosError) {
        console.error('Error al obtener productos:', productosError)
      } else {
        setProductos(productosData)
      }

      setLoading(false)
    }

    fetchProductos()
  }, [router])

  const eliminarProducto = async (id: number) => {
    const confirmar = confirm('¿Estás seguro de que quieres eliminar este producto?')

    if (!confirmar) return

    const { error } = await supabase.from('productos').delete().eq('id', id)

    if (error) {
      alert('Error al eliminar el producto.')
      console.error(error)
    } else {
      setProductos((prev) => prev.filter((p) => p.id !== id))
    }
  }

  if (loading) {
    return <div className="text-center py-10 text-green-800">Cargando productos...</div>
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-800">Mis productos</h1>
        <Link href="/profile/producer/productos/nuevo">
          <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
            <PlusCircle size={18} />
            Añadir producto
          </Button>
        </Link>
      </div>

      {productos.length === 0 ? (
        <p className="text-amber-600">No has registrado productos aún.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="bg-white rounded-2xl border border-amber-300 shadow-md p-4 space-y-2"
            >
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src={producto.imagen_url || '/placeholder.png'}
                  alt={producto.nombre}
                  fill
                  className="object-cover"
                />
              </div>
              <h2 className="text-xl font-semibold text-green-800">{producto.nombre}</h2>
              <p className="text-sm text-gray-700">{producto.descripcion}</p>
              <p className="text-green-600 font-medium">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(producto.precio)}
              </p>
              <p className="text-sm text-amber-700">Comunidad: {producto.comunidad_origen}</p>

              <div className="flex justify-end gap-2 mt-2">
                <Link href={`/profile/producer/productos/editar/${producto.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-600 text-green-700 hover:bg-green-50"
                  >
                    <Pencil size={16} />
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-600 text-red-700 hover:bg-red-50"
                  onClick={() => eliminarProducto(producto.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
