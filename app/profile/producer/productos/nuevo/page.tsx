'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function NuevoProductoPage() {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [historia, setHistoria] = useState('')
  const [precio, setPrecio] = useState('')
  const [comunidad, setComunidad] = useState('')
  const [stock, setStock] = useState(0)
  const [imagen, setImagen] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!nombre || !descripcion || !precio || !comunidad || !imagen) {
      setError('Por favor, completa todos los campos obligatorios.')
      return
    }

    if (imagen.size > 2 * 1024 * 1024) {
      setError('La imagen no puede superar los 2MB.')
      return
    }

    setCargando(true)

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setError('No se pudo obtener el usuario.')
      setCargando(false)
      return
    }

    const nombreArchivo = `${user.id}/${Date.now()}-${imagen.name}`

    const { data: imagenData, error: uploadError } = await supabase.storage
      .from('imagenes_productos')
      .upload(nombreArchivo, imagen)

    if (uploadError || !imagenData) {
      setError('Error al subir la imagen.')
      setCargando(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('imagenes_productos')
      .getPublicUrl(imagenData.path)

    const imagenUrl = publicUrlData?.publicUrl

    const { error: insertError } = await supabase
      .from('productos')
      .insert({
        productor_id: user.id,
        nombre,
        descripcion,
        historia,
        stock,
        precio: parseFloat(precio),
        comunidad_origen: comunidad,
        imagen_url: imagenUrl
      })

    if (insertError) {
      setError('Error al registrar el producto.')
      setCargando(false)
      return
    }

    router.push('/profile/producer/productos')
  }

  return (
    <motion.div
      className="max-w-3xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-3xl font-extrabold text-green-800 mb-8 text-center">
        Registrar nuevo producto
      </h2>

      <div className="bg-white shadow-xl rounded-2xl border border-amber-200 p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-green-900">Nombre del producto</Label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>

          <div>
            <Label className="text-green-900">Descripción</Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <Label className="text-green-900">Historia del producto</Label>
            <Textarea
              value={historia}
              onChange={(e) => setHistoria(e.target.value)}
              rows={4}
              placeholder="Cuenta el origen, tradición o historia detrás de este producto"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-green-900">Precio (en pesos colombianos)</Label>
              <Input
                type="number"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-green-900">Comunidad de origen</Label>
              <Input
                value={comunidad}
                onChange={(e) => setComunidad(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-green-900">Stock disponible</Label>
            <Input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value))}
            />
          </div>

          <div>
            <Label className="text-green-900">Imagen del producto (máx 2MB)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setImagen(e.target.files[0])
                }
              }}
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-100 p-2 rounded-md">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={cargando}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-2 rounded-xl"
          >
            {cargando ? 'Registrando...' : 'Registrar producto'}
          </Button>
        </form>
      </div>
    </motion.div>
  )
}
