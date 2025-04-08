'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { User, Mail, Lock, MapPin, FileText, Image } from 'lucide-react'

export default function RegisterClientPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    repetirContrasena: '',
    telefono: '',
    sexo: '',
    direccion: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.contrasena !== form.repetirContrasena) {
      setError('Las contraseñas no coinciden.')
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.correo,
      password: form.contrasena,
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    const userId = data.user?.id
    if (!userId) {
      setError('No se pudo obtener el ID del usuario.')
      return
    }

    const { error: insertError } = await supabase.from('clientes').insert({
      id: userId,
      nombre: form.nombre,
      correo: form.correo,
      telefono: form.telefono,
      sexo: form.sexo,
      direccion: form.direccion,
    })

    if (insertError) {
      setError(insertError.message)
      return
    }

    setSuccess('Registro exitoso. Revisa tu correo para confirmar tu cuenta.')
    setForm({
      nombre: '',
      correo: '',
      contrasena: '',
      repetirContrasena: '',
      telefono: '',
      sexo: '',
      direccion: '',
    })
  }

  return (
    <motion.div
      className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg border-2 border-amber-100 mt-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-4xl font-bold text-green-800 mb-6 text-center">
        Registro de Cliente
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex items-center gap-2">
          <User className="w-5 h-5 text-green-600" />
          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo*"
            className="w-full border p-2 rounded-xl"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </label>

        <label className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-green-600" />
          <input
            type="email"
            name="correo"
            placeholder="Correo electrónico*"
            className="w-full border p-2 rounded-xl"
            value={form.correo}
            onChange={handleChange}
            required
          />
        </label>

        <label className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-green-600" />
          <input
            type="password"
            name="contrasena"
            placeholder="Contraseña*"
            className="w-full border p-2 rounded-xl"
            value={form.contrasena}
            onChange={handleChange}
            required
          />
        </label>

        <label className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-green-600" />
          <input
            type="password"
            name="repetirContrasena"
            placeholder="Repetir contraseña*"
            className="w-full border p-2 rounded-xl"
            value={form.repetirContrasena}
            onChange={handleChange}
            required
          />
        </label>

        <label className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-600" />
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            className="w-full border p-2 rounded-xl"
            value={form.telefono}
            onChange={handleChange}
          />
        </label>

        <label className="flex items-center gap-2">
          <Image className="w-5 h-5 text-green-600" />
          <select
            name="sexo"
            value={form.sexo}
            onChange={handleChange}
            className="w-full border p-2 rounded-xl bg-white text-green-700"
            required
          >
            <option value="">Selecciona tu género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <input
            type="text"
            name="direccion"
            placeholder="Dirección"
            className="w-full border p-2 rounded-xl"
            value={form.direccion}
            onChange={handleChange}
          />
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl transition"
        >
          Registrarse
        </button>
      </form>
    </motion.div>
  )
}
