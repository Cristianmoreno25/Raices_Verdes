//app/admin/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { LogOut, CheckCircle, XCircle, FileText } from 'lucide-react'

export default function AdminPage() {
  const [productores, setProductores] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchProductores = async () => {
      const { data, error } = await supabase.from('productores').select('*')
      if (error) {
        console.error(error)
        return
      }

      const documentosConURL = await Promise.all(
        data.map(async (prod) => {
          let documento_signed_url = null

          if (prod.documento_url && typeof prod.documento_url === 'string') {
            const { data: signedUrlData, error: signedUrlError } = await supabase
              .storage
              .from('documentos')
              .createSignedUrl(prod.documento_url.trim(), 60 * 5)

            if (signedUrlError) {
              console.error(`Error creando signed URL para ${prod.documento_url}:`, signedUrlError.message)
            } else {
              documento_signed_url = signedUrlData?.signedUrl
            }
          }

          return { ...prod, documento_signed_url }
        })
      )

      setProductores(documentosConURL)
    }

    fetchProductores()
  }, [])

  const handleVerificar = async (id: string) => {
    const { error } = await supabase
      .from('productores')
      .update({ documento_verificado: true })
      .eq('id', id)

    if (error) {
      console.error('Error al verificar documento:', error.message)
    } else {
      setProductores((prev) =>
        prev.map((prod) =>
          prod.id === id ? { ...prod, documento_verificado: true } : prod
        )
      )
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/products')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Panel de Administración</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>

      {/* Lista de productores */}
      <div className="grid gap-6">
        {productores.map((prod) => (
          <motion.div
            key={prod.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow-md rounded-xl p-5 border border-gray-200"
          >
            <div className="mb-2 text-lg">
              <span className="font-semibold">👤 Productor:</span> {prod.nombre_productor}
            </div>
            <div className="mb-2">
              <span className="font-semibold">🏪 Negocio:</span> {prod.nombre_negocio}
            </div>
            <div className="mb-2">
              <span className="font-semibold">📍 Ubicación:</span> {prod.ubicacion}
            </div>
            <div className="mb-2">
              <span className="font-semibold">📧 Correo:</span> {prod.correo}
            </div>
            <div className="mb-2 flex items-center gap-2">
              <span className="font-semibold">📄 Documento verificado:</span>
              {prod.documento_verificado ? (
                <span className="text-green-600 font-bold flex items-center gap-1">
                  <CheckCircle size={18} /> Sí
                </span>
              ) : (
                <span className="text-red-600 font-bold flex items-center gap-1">
                  <XCircle size={18} /> No
                </span>
              )}
            </div>

            {prod.documento_signed_url ? (
              <a
                href={prod.documento_signed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:underline mt-2"
              >
                <FileText size={18} />
                Ver documento PDF
              </a>
            ) : (
              <p className="text-sm text-gray-500 italic mt-2">Documento no disponible</p>
            )}

            {!prod.documento_verificado && (
              <button
                onClick={() => handleVerificar(prod.id)}
                className="mt-4 inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition"
              >
                Verificar documento
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
