'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { PostgrestError } from '@supabase/supabase-js'

type Productor = {
  id: string
  nombre_productor: string
  correo: string
  documento_url: string | null
  documento_verificado: boolean
}

export default function AdminDashboard() {
  const router = useRouter()
  const [productores, setProductores] = useState<Productor[]>([])
  const [loading, setLoading] = useState(true)

  // 1) Verificar admin al montar
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const meta = data.session?.user.user_metadata as any
      if (!meta?.is_admin) {
        router.push('/')  // no es admin → fuera
      } else {
        fetchProductores()
      }
    })
  }, [])

  // 2) Traer todos los productores
  const fetchProductores = async () => {
    const { data, error }: { data: Productor[] | null; error: PostgrestError | null } =
      await supabase
        .from('productores')
        .select('id, nombre_productor, correo, documento_url, documento_verificado')
  
    if (error) console.error(error)
    else setProductores(data ?? [])
  
    setLoading(false)
  }

  // 3) Verificar documento
  const verifyDoc = async (id: string) => {
    await supabase
      .from('productores')
      .update({ documento_verificado: true })
      .eq('id', id)
    fetchProductores()
  }

  if (loading) return <p>Cargando...</p>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Panel Admin: Verificar Documentos</h1>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-amber-200">
            <th className="p-2">Productor</th>
            <th className="p-2">Correo</th>
            <th className="p-2">Documento</th>
            <th className="p-2">Verificado</th>
            <th className="p-2">Acción</th>
          </tr>
        </thead>
        <tbody>
          {productores.map(p => (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.nombre_productor}</td>
              <td className="p-2">{p.correo}</td>
              <td className="p-2">
                {p.documento_url
                  ? <a href={p.documento_url} target="_blank" className="text-blue-600">Ver PDF</a>
                  : '—'}
              </td>
              <td className="p-2">
                {p.documento_verificado ? '✅' : '❌'}
              </td>
              <td className="p-2">
                {!p.documento_verificado && (
                  <button
                    onClick={() => verifyDoc(p.id)}
                    className="bg-green-600 text-white px-4 py-1 rounded"
                  >
                    Verificar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}