// app/role-selection/page.tsx
'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FaUser, 
  FaLeaf, 
  FaShoppingBag 
} from 'react-icons/fa'
import { FaHandshake } from 'react-icons/fa6' // Cambio crucial aquí

export default function RoleSelection() {
  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-green-800 text-center mb-8">
          Únete a nuestra comunidad
          <FaHandshake className="inline-block ml-2 text-amber-300" />
        </h1>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Tarjeta Cliente */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-8 border-2 border-amber-100"
          >
            <div className="text-center mb-6">
              <FaShoppingBag className="text-5xl text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-green-800 mb-4">
                Como Cliente
              </h2>
            </div>
            
            <p className="text-green-700 mb-6 leading-relaxed">
              Accede a un mundo de productos auténticos y sostenibles directamente de las manos de 
              comunidades indígenas. Tu registro te permitirá:
            </p>
            
            <ul className="space-y-3 mb-8 text-green-700">
              <li className="flex items-center">
                <FaLeaf className="text-amber-300 mr-2" />
                Descubrir artesanías únicas y medicinas tradicionales
              </li>
              <li className="flex items-center">
                <FaLeaf className="text-amber-300 mr-2" />
                Conectar con las historias culturales detrás de cada producto
              </li>
              <li className="flex items-center">
                <FaLeaf className="text-amber-300 mr-2" />
                Apoyar directamente el comercio justo indígena
              </li>
            </ul>

            <Link 
              href="/auth/register/client" 
              className="bg-green-600 hover:bg-green-700 text-amber-50 px-8 py-3 rounded-full font-medium flex items-center justify-center transition-colors"
            >
              <FaUser className="mr-2" />
              Registrarme como cliente
            </Link>
          </motion.div>

          {/* Tarjeta Productor */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-green-50 rounded-2xl shadow-lg p-8 border-2 border-green-100"
          >
            <div className="text-center mb-6">
              <FaLeaf className="text-5xl text-amber-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-green-800 mb-4">
                Como Guardián Cultural
              </h2>
            </div>

            <p className="text-green-700 mb-6 leading-relaxed">
              Para comunidades indígenas que desean compartir sus saberes y productos con el mundo. 
              Tu registro te permitirá:
            </p>
            
            <ul className="space-y-3 mb-8 text-green-700">
              <li className="flex items-center">
                <FaLeaf className="text-amber-300 mr-2" />
                Mostrar y vender tus creaciones artesanales
              </li>
              <li className="flex items-center">
                <FaLeaf className="text-amber-300 mr-2" />
                Compartir recetas medicinales ancestrales
              </li>
              <li className="flex items-center">
                <FaLeaf className="text-amber-300 mr-2" />
                Preservar y difundir tu legado cultural
              </li>
            </ul>

            <Link 
              href="/auth/register/producer" 
              className="bg-amber-300 hover:bg-amber-400 text-green-800 px-8 py-3 rounded-full font-medium flex items-center justify-center transition-colors"
            >
              <FaLeaf className="mr-2" />
              Registrarme como Productor indígena
            </Link>
          </motion.div>
        </div>

        <p className="text-center text-green-600 mt-12 max-w-2xl mx-auto leading-relaxed">
          "Cada registro fortalece el puente entre tradición y modernidad. Juntos construimos un comercio 
          que honra raíces y cultiva futuro."
        </p>
      </div>
    </div>
  )
}