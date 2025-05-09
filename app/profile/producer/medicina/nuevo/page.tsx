'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function CrearArticuloMedicina() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error(userError)
      setLoading(false)
      return
    }

    let image_url = ''
    if (imageFile) {
      const fileName = `${user.id}/${Date.now()}_${imageFile.name}`
      const { data: upData, error: upErr } = await supabase
        .storage
        .from('imagenes_medicina')
        .upload(fileName, imageFile, { cacheControl: '3600', upsert: false })

      if (upErr) {
        console.error('Error subiendo imagen:', upErr)
      } else {
        // EXTRAER BIEN LA URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('imagenes_medicina')
          .getPublicUrl(upData.path)
        image_url = publicUrl
      }
    }

    const { error: dbError } = await supabase
      .from('articulos_medicinales')
      .insert([
        { productor_id: user.id, title, category, content, image_url }
      ])

    if (dbError) console.error('Error guardando artículo:', dbError.message)
    else router.push('/profile/producer/medicina')

    setLoading(false)
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Nuevo Artículo Medicinal</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} required />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border rounded p-2 w-full"
          required
        >
          <option value="">Seleccione categoría</option>
          <option value="dolor_general">Dolor General</option>
          <option value="dolor_cabeza">Dolor de Cabeza</option>
          <option value="dolor_muscular">Dolor Muscular</option>
        </select>
        <textarea
          placeholder="Contenido..."
          className="w-full border rounded p-2 h-32"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={e => setImageFile(e.target.files?.[0] ?? null)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Crear Artículo'}
        </Button>
      </form>
    </main>
  )
}
