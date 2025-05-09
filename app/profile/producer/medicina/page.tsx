'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function ProducerMedicinaList() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/')

      const { data, error } = await supabase
        .from('articulos_medicinales')
        .select('*')
        .eq('productor_id', user.id)
        .order('created_at', { ascending: false })

      if (error) console.error(error.message)
      else setArticles(data)
      setLoading(false)
    }
    fetch()
  }, [router])

  if (loading) return <div className="text-center py-10">Cargando...</div>

  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mis Artículos Medicinales</h1>
        <Link href="/profile/producer/medicina/nuevo">
          <Button>Nuevo Artículo</Button>
        </Link>
      </div>
      <div className="grid gap-4">
        {articles.map(a => (
          <div key={a.id} className="border p-4 rounded-lg shadow space-y-2">
            {a.image_url && (
              <img src={a.image_url} alt={a.title} className="w-full h-48 object-cover rounded" />
            )}
            <h2 className="text-lg font-semibold">{a.title}</h2>
            <p className="text-sm text-gray-500">Categoría: {a.category}</p>
            <p className="mt-2">{a.content.substring(0, 100)}...</p>
            <div className="flex gap-2 mt-4">
              <Link href={`/profile/producer/medicina/editar/${a.id}`}>
                <Button variant="outline">Editar</Button>
              </Link>
              <Button
                variant="destructive"
                onClick={async () => {
                  await supabase.from('articulos_medicinales').delete().eq('id', a.id)
                  setArticles(arts => arts.filter(x => x.id !== a.id))
                }}
              >
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
