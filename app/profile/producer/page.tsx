'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

export default function ProducerProfilePage() {
  const [productor, setProductor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProductor = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/')
        return
      }

      const { data, error } = await supabase
        .from('productores')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !data) {
        router.push('/')
        return
      }

      setProductor(data)
      setLoading(false)
    }

    fetchProductor()
  }, [router])

  if (loading) {
    return <div className="text-center py-10 text-green-800">Cargando perfil...</div>
}
  return (
    <motion.div
      className="max-w-5xl mx-auto px-6 py-12 space-y-10 bg-white rounded-3xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo y nombre */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-32 h-32 relative rounded-full overflow-hidden border-4 border-amber-400 shadow-md">
          <Image
            src={productor.logo_url || '/default-logo.png'}
            alt="Logo del productor"
            fill
            className="object-cover"
          />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-800">{productor.nombre_productor}</h1>
          <p className="text-lg text-amber-600">{productor.nombre_negocio}</p>
        </div>
      </div>

      {/* Botones de sección */}
      <div className="flex flex-wrap justify-center gap-4 overflow-x-auto no-scrollbar">
        <Link href="/profile/producer/productos">
          <Button
            variant="outline"
            className="text-green-900 font-medium border-green-300 bg-green-50 hover:bg-green-100 transition-all px-6 py-3 rounded-xl shadow-sm whitespace-nowrap"
          >
            Gestión de productos
          </Button>
        </Link>
        <Link href="/profile/producer/medicina">
          <Button
            variant="outline"
            className="text-green-900 font-medium border-green-300 bg-green-50 hover:bg-green-100 transition-all px-6 py-3 rounded-xl shadow-sm whitespace-nowrap"
          >
            Gestión medicinal
          </Button>
        </Link>
        {['Ventas realizadas', 'Notificaciones', 'Configuración'].map((label) => (
          <Button
            key={label}
            variant="outline"
            className="text-green-900 font-medium border-green-300 bg-green-50 hover:bg-green-100 transition-all px-6 py-3 rounded-xl shadow-sm whitespace-nowrap"
          >
            {label}
          </Button>
        ))}
      </div>
    </motion.div>
  )}