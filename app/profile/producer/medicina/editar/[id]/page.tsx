'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function EditarArticuloMedicina() {
  const { id } = useParams()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [existingImageUrl, setExistingImageUrl] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('articulos_medicinales')
        .select('*')
        .eq('id', id)
        .single()
      if (error) console.error(error.message)
      else {
        setTitle(data.title)
        setCategory(data.category)
        setContent(data.content)
        setExistingImageUrl(data.image_url)
      }
      setLoading(false)
    }
    fetch()
  }, [id])

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

    let image_url = existingImageUrl
    if (imageFile) {
      const fileName = `${user.id}/${Date.now()}_${imageFile.name}`
      const { data: upData, error: upErr } = await supabase
        .storage
        .from('imagenes_medicina')
        .upload(fileName, imageFile, { cacheControl: '3600', upsert: true })

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

    const { error: updateError } = await supabase
      .from('articulos_medicinales')
      .update({ title, category, content, image_url })
      .eq('id', id)

    if (updateError) console.error('Error actualizando:', updateError.message)
    else router.push('/profile/producer/medicina')

    setLoading(false)
  }

  if (loading) return <div className="text-center py-10">Cargando...</div>

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Artículo Medicinal</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} required />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border rounded p-2 w-full"
          required
        >
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
        <div className="space-y-2">
          <p>Imagen actual:</p>
          {existingImageUrl && (
            <img src={existingImageUrl} alt="Actual" className="h-32 rounded" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={e => setImageFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Actualizando...' : 'Guardar Cambios'}
        </Button>
      </form>
    </main>
  )
}
