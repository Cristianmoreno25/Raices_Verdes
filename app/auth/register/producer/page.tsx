
'use client'
import { FormEvent, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { User, Mail, Lock, MapPin, FileText, Image } from 'lucide-react'

export default function ProducerRegister() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  
  // Nuevos estados para mostrar nombres de archivos
  const [documentoNombre, setDocumentoNombre] = useState('')
  const [logoNombre, setLogoNombre] = useState('')
  
  // Referencias para los inputs de archivo
  const documentoRef = useRef<HTMLInputElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)

  // Función para manejar cambios en los archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'documento' | 'logo') => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name
      if (type === 'documento') {
        setDocumentoNombre(fileName)
      } else {
        setLogoNombre(fileName)
      }
    }
  }

  // handleSubmit permanece EXACTAMENTE igual (no hacer cambios aquí)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    const formData = new FormData(e.currentTarget)

    // Obtener datos del formulario
    const nombre_productor = formData.get('nombre_productor') as string
    const nombre_negocio = formData.get('nombre_negocio') as string
    const ubicacion = formData.get('ubicacion') as string
    const descripcion_comunidad = formData.get('descripcion_comunidad') as string
    const correo = formData.get('correo') as string
    const password = formData.get('password') as string
    const confirmar_password = formData.get('confirmar_password') as string
    const documentoFile = formData.get('documento') as File
    const logoFile = formData.get('logo') as File

    // Validar que las contraseñas coincidan
    if (password !== confirmar_password) {
      setErrorMsg('Las contraseñas no coinciden.')
      setLoading(false)
      return
    }

    // 1) Registrar al usuario en auth.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: correo,
      password
    })

    if (authError) {
      setErrorMsg('Error en el registro: ' + authError.message)
      setLoading(false)
      return
    }

    const user = authData.user
    if (!user) {
      setErrorMsg('No se pudo obtener la información del usuario.')
      setLoading(false)
      return
    }

    // 2) Subir el documento al bucket "documentos" (público)
    let documento_url: string | null = null
    if (documentoFile) {
      const docFileName = `${user.id}/documento.pdf`
      const { error: docError } = await supabase.storage
        .from('documentos')
        .upload(docFileName, documentoFile, { upsert: false })
      if (docError) {
        setErrorMsg('Error al subir el documento: ' + docError.message)
        setLoading(false)
        return
      }
      // Obtener URL pública
      const { data: docUrlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(docFileName)
      documento_url = docUrlData.publicUrl
    }

    // 3) Subir el logo al bucket "logos" (público)
    let logo_url: string | null = null
    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const logoFileName = `${user.id}/logo.${ext}`
      const { error: logoError } = await supabase.storage
        .from('logos')
        .upload(logoFileName, logoFile, { upsert: false })
      if (logoError) {
        setErrorMsg('Error al subir el logo: ' + logoError.message)
        setLoading(false)
        return
      }
      // Obtener URL pública
      const { data: logoUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(logoFileName)
      logo_url = logoUrlData.publicUrl
    }

    // 4) Insertar la información del productor en la tabla "productores"
    const { error: insertError } = await supabase
      .from('productores')
      .insert([
        {
          id: user.id, // Relación con auth.users
          nombre_productor,
          nombre_negocio,
          ubicacion,
          descripcion_comunidad,
          correo,
          documento_url,
          logo_url
          // correo_confirmado y documento_verificado quedan en false por defecto
        }
      ])

    if (insertError) {
      setErrorMsg('Error al crear el registro del productor: ' + insertError.message)
      setLoading(false)
      return
    }

    // 5) Mostrar mensaje de éxito
    setSuccessMsg('Registro exitoso, por favor verifica tu correo para poder iniciar sesión.')
    setLoading(false)

    // Opcional: redirigir al login
    // router.push('/auth/login')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-amber-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            Registro de Productor
          </h1>
          <p className="text-green-600">Forma parte de nuestra comunidad sostenible</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white rounded-2xl shadow-lg p-8 border-2 border-amber-100"
          whileHover={{ scale: 1.005 }}
        >
          {/* Sección Información Personal */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-800 flex items-center gap-2">
              <User className="w-5 h-5" />
              Información Personal
            </h2>
            
            <div className="space-y-3">
              <InputField
                icon={<User className="w-5 h-5 text-green-600" />}
                name="nombre_productor"
                placeholder="Nombre completo del productor"
                type="text"
              />
              <InputField
                icon={<MapPin className="w-5 h-5 text-green-600" />}
                name="nombre_negocio"
                placeholder="Nombre de tu negocio o cooperativa"
                type="text"
              />
              <InputField
                icon={<MapPin className="w-5 h-5 text-green-600" />}
                name="ubicacion"
                placeholder="Ubicación (Ciudad, País)"
                type="text"
              />
            </div>
          </div>

          {/* Sección Descripción */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-800 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Sobre tu comunidad
            </h2>
            <textarea
              name="descripcion_comunidad"
              placeholder="Describe tu comunidad indígena y prácticas sostenibles..."
              required
              className="w-full p-3 border-2 border-amber-100 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none min-h-[120px]"
            />
          </div>

          {/* Sección Credenciales */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-800 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Credenciales
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <InputField
                icon={<Mail className="w-5 h-5 text-green-600" />}
                name="correo"
                placeholder="Correo electrónico"
                type="email"
              />
              <InputField
                icon={<Lock className="w-5 h-5 text-green-600" />}
                name="password"
                placeholder="Contraseña"
                type="password"
              />
              <InputField
                icon={<Lock className="w-5 h-5 text-green-600" />}
                name="confirmar_password"
                placeholder="Confirmar contraseña"
                type="password"
              />
            </div>
          </div>

           {/* Sección Archivos */}
           <div className="space-y-4">
        <h2 className="text-xl font-semibold text-green-800 flex items-center gap-2">
          <Image className="w-5 h-5" />
          Documentación
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FileInput 
            icon={<FileText className="w-5 h-5" />}
            label="Documento (PDF) que lo avala como perteneciente a una comunidad indígena"
            name="documento"
            accept="application/pdf"
            inputRef={documentoRef as React.RefObject<HTMLInputElement>} // Añadir tipo explícito
            fileName={documentoNombre}
            onClick={() => (documentoRef.current as HTMLInputElement)?.click()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'documento')}
          />
          <FileInput 
            icon={<Image className="w-5 h-5" />}
            label="Logo del negocio"
            name="logo"
            accept="image/jpeg,image/png"
            inputRef={logoRef as React.RefObject<HTMLInputElement>} // Añadir tipo explícito
            fileName={logoNombre}
            onClick={() => (logoRef.current as HTMLInputElement)?.click()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'logo')}
          />
        </div>
      </div>

          {/* Mensajes y Botón */}
          <div className="space-y-4">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2"
              >
                <span className="text-sm">{errorMsg}</span>
              </motion.div>
            )}
            
            {successMsg && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2"
              >
                <span className="text-sm">{successMsg}</span>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold p-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Completar Registro'}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </motion.div>
  )
}

// Componente reutilizable para inputs (se mantiene igual)
const InputField = ({ icon, ...props }: any) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      {icon}
    </div>
    <input
      {...props}
      className="w-full pl-10 pr-3 py-2 border-2 border-amber-100 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent"
    />
  </div>
)

// Componente para subida de archivos (actualizado con tipos TypeScript)
interface FileInputProps {
  icon: React.ReactNode;
  label: string;
  fileName?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  onClick?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  accept: string;
}

// 2. Componente FileInput actualizado
const FileInput = ({ 
  icon, 
  label, 
  fileName,
  inputRef,
  onClick,
  onChange,
  ...props 
}: FileInputProps) => (
  <div className="space-y-2">
    <label className="block cursor-pointer">
      <div 
        onClick={onClick}
        className="flex flex-col items-center justify-center p-6 border-2 border-amber-100 border-dashed rounded-xl hover:bg-amber-50 transition-colors"
      >
        <div className="mb-2 text-green-600">{icon}</div>
        <span className="text-sm text-green-800 font-medium text-center">{label}</span>
        <span className="text-xs text-green-600 mt-1">
          {fileName || 'Haz click para subir'}
        </span>
      </div>
      <input
        {...props}
        ref={inputRef}
        type="file"
        onChange={onChange}
        className="hidden"
      />
    </label>
    {fileName && (
      <motion.div 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-green-700 truncate px-2"
      >
        {fileName}
      </motion.div>
    )}
  </div>
)