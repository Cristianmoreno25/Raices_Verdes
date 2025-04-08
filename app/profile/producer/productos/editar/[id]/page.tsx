'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export default function EditarProductoPage() {
  const { id } = useParams()
  const router = useRouter()

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [comunidad, setComunidad] = useState('')
  const [historia, setHistoria] = useState('')
  const [stock, setStock] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarProducto = async () => {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError('No se pudo cargar el producto.')
      } else {
        setNombre(data.nombre)
        setDescripcion(data.descripcion)
        setPrecio(data.precio)
        setComunidad(data.comunidad_origen)
        setHistoria(data.historia || '')
        setStock(data.stock?.toString() || '')
      }

      setCargando(false)
    }

    cargarProducto()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { error } = await supabase
      .from('productos')
      .update({
        nombre,
        descripcion,
        precio: parseFloat(precio),
        comunidad_origen: comunidad,
        historia,
        stock: parseInt(stock)
      })
      .eq('id', id)

    if (error) {
      setError('No se pudo actualizar el producto.')
    } else {
      router.push('/profile/producer/productos')
    }
  }

  if (cargando) {
    return <p className="text-center text-green-700 py-10">Cargando producto...</p>
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">Editar producto</h2>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-amber-200 shadow-lg">
        <div>
          <Label className="text-green-900">Nombre</Label>
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>

        <div>
          <Label className="text-green-900">Descripción</Label>
          <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4} />
        </div>

        <div>
          <Label className="text-green-900">Historia del producto</Label>
          <Textarea value={historia} onChange={(e) => setHistoria(e.target.value)} rows={3} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-green-900">Precio</Label>
            <Input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-green-900">Comunidad</Label>
            <Input value={comunidad} onChange={(e) => setComunidad(e.target.value)} />
          </div>
        </div>

        <div>
          <Label className="text-green-900">Stock disponible</Label>
          <Input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-100 p-2 rounded-md">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-2"
        >
          Guardar cambios
        </Button>
      </form>
    </motion.div>
  )
}
