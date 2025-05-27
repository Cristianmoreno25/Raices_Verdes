// app/productor/[id]/page.tsx
'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'
import { FaEnvelope, FaLeaf } from 'react-icons/fa'
import { Spinner } from '@/components/ui/spinner'

type Productor = {
  id: string
  nombre_productor: string
  nombre_negocio: string
  ubicacion: string
  correo: string
  descripcion: string | null
  cultura_id: string
  documento_url: string | null
  documento_verificado: boolean
}

type Producto = {
  id: string
  nombre: string
  precio: number
  imagen_url: string | null
  productor_id: string
}

type Cultura = {
  id: string
  nombre: string
  descripcion: string
}

export default function PerfilProductorPage() {
  const router = useRouter()
  const pathname = usePathname()

  const [productorId, setProductorId] = useState<string | null>(null)
  const [productor, setProductor] = useState<Productor | null>(null)
  const [productos, setProductos] = useState<Producto[]>([])
  const [cultura, setCultura] = useState<Cultura | null>(null)
  const [promedioRating, setPromedioRating] = useState<number | null>(null)
  const [totalValoraciones, setTotalValoraciones] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)

  // 1. Extraer el ID de la URL: /productor/[id]
  useEffect(() => {
    const segmentos = pathname.split('/')
    const id = segmentos[segmentos.length - 1]
    setProductorId(id)
  }, [pathname])

  // 2. Función para cargar datos
  const fetchData = async () => {
    if (!productorId) return
    setLoading(true)

    // 2.1. Traer datos del productor
    const { data: prodData, error: prodError } = await supabase
      .from('productores')
      .select('*')
      .eq('id', productorId)
      .single()

    if (prodError || !prodData) {
      console.error('Error al obtener productor:', prodError)
      router.push('/products')
      return
    }
    setProductor(prodData)

    // 2.2. Traer datos de la cultura
    if (prodData.cultura_id) {
      const { data: cultData, error: cultError } = await supabase
        .from('culturas')
        .select('*')
        .eq('id', prodData.cultura_id)
        .single()

      if (!cultError && cultData) {
        setCultura(cultData)
      }
    }

    // 2.3. Traer productos de este productor
    const { data: prods, error: prodsError } = await supabase
      .from('productos')
      .select('*')
      .eq('productor_id', productorId)

    if (!prodsError && prods) {
      const arr: Producto[] = prods.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        imagen_url: p.imagen_url ?? null,
        productor_id: p.productor_id,
      }))
      setProductos(arr)
    }

    // 2.4. Calcular promedio y total de valoraciones
    const { data: valData, error: valError } = await supabase
      .from('valoraciones')
      .select('rating')
      .eq('productor_id', productorId)

    if (!valError && valData) {
      const total = valData.length
      setTotalValoraciones(total)
      if (total > 0) {
        const suma = valData.reduce((acc, cur) => acc + cur.rating, 0)
        setPromedioRating(suma / total)
      } else {
        setPromedioRating(0)
      }
    }

    setLoading(false)
  }

  // 3. Suscripciones en tiempo real (opcional)
  useEffect(() => {
    if (!productorId) return

    // Suscripción a cambios en "productores"
    const prodSub = supabase
      .channel(`realtime-productor-${productorId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'productores',
          filter: `id=eq.${productorId}`,
        },
        () => {
          fetchData()
        }
      )
      .subscribe()

    // Suscripción a cambios en "productos"
    const prodsSub = supabase
      .channel(`realtime-productos-${productorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'productos',
          filter: `productor_id=eq.${productorId}`,
        },
        () => {
          fetchData()
        }
      )
      .subscribe()

    // Suscripción a cambios en "valoraciones"
    const valSub = supabase
      .channel(`realtime-valoraciones-${productorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'valoraciones',
          filter: `productor_id=eq.${productorId}`,
        },
        () => {
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(prodSub)
      supabase.removeChannel(prodsSub)
      supabase.removeChannel(valSub)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productorId])

  // 4. Carga inicial de datos
  useEffect(() => {
    if (productorId) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productorId])

  // 5. Mostrar Spinner mientras carga
  if (loading || !productor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    )
  }

  // 6. Render del perfil
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Encabezado: Nombre del negocio y estado de verificación */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {productor.nombre_negocio}
        </h1>
        {productor.documento_verificado ? (
          <span className="flex items-center text-green-600">
            <FaLeaf className="mr-1" /> Verificado
          </span>
        ) : (
          <span className="flex items-center text-red-600">
            <FaLeaf className="mr-1" /> Pendiente
          </span>
        )}
      </div>

      {/* Información del productor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Información</h2>
          <p>
            <strong>Nombre del productor:</strong>{' '}
            {productor.nombre_productor}
          </p>
          <p>
            <strong>Ubicación:</strong> {productor.ubicacion}
          </p>
          <p className="flex items-center">
            <FaEnvelope className="mr-2" />
            <a
              href={`mailto:${productor.correo}`}
              className="text-blue-600 hover:underline"
            >
              {productor.correo}
            </a>
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Descripción</h2>
          <p className="text-gray-700">
            {productor.descripcion ??
              'El productor no ha agregado una descripción.'}
          </p>
        </div>
      </div>

      {/* Sección de Cultura */}
      {cultura && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            Cultura: {cultura.nombre}
          </h2>
          <p className="mb-4 text-gray-600 line-clamp-3">
            {cultura.descripcion}
          </p>
          <Link
            href={`/cultura/${cultura.id}`}
            className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Ver detalles de la cultura
          </Link>
        </div>
      )}

      {/* Sección de Valoraciones */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Valoraciones
        </h2>
        {totalValoraciones > 0 && promedioRating !== null ? (
          <p>
            <span className="text-yellow-500 font-bold">
              ★ {promedioRating.toFixed(1)}
            </span>{' '}
            de {totalValoraciones} valoraciones
          </p>
        ) : (
          <p>Aún no tiene valoraciones.</p>
        )}
      </div>

      {/* Lista de Productos del productor */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Productos de {productor.nombre_negocio}
        </h2>
        {productos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                {p.imagen_url ? (
                  <img
                    src={p.imagen_url}
                    alt={p.nombre}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Sin imagen</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">
                    {p.nombre}
                  </h3>
                  <p className="text-green-600 font-bold">
                    ${p.precio.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p>Este productor no tiene productos publicados.</p>
        )}
      </div>
    </div>
  )
}
