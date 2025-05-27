// app/admin/layout.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      // 1. Obtener la sesión actual
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // 2. Si no hay sesión, redirigir al login
      if (!session) {
        router.replace('/login')
        return
      }

      // 3. Comprobar si el usuario está en la tabla `admins`
      const { data: admins, error } = await supabase
        .from('admins')
        .select('id')
        .eq('id', session.user.id)

      // 4. Si ocurre un error o no es admin, redirigir a home
      if (error || !admins?.length) {
        router.replace('/')
        return
      }

      // 5. Es admin: dejamos renderizar el contenido
      setLoading(false)
    }

    checkAdmin()
  }, [router])

  // Mientras validamos, mostramos algo mínimo
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Cargando sección de administración…</p>
      </div>
    )
  }

  // Aquí puedes envolver `children` con tu navbar/admin sidebar
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Ejemplo de Navbar/AdminHeader */}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-xl font-semibold">Panel de Administración</h1>
      </header>

      <main className="p-6">
        {children}
      </main>
    </div>
  )
}
