'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Hero from '@/components/hero'
import { FaLeaf, FaHandshake, FaShoppingBag } from 'react-icons/fa'

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Sección principal */}
      <Hero />

      {/* Sección de presentación */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 text-center"
      >
        <h1 className="text-4xl font-bold text-green-800 mb-4">
          Conecta con las raíces de nuestra tierra
        </h1>
        <p className="text-lg text-green-700 max-w-2xl mx-auto">
          Raíces Verdes es una plataforma digital que impulsa el comercio justo y sostenible de productos elaborados por comunidades indígenas. Nuestro propósito es visibilizar y valorar el conocimiento ancestral, ofreciendo productos auténticos que reflejan identidad, historia y conexión con la tierra.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link 
            href="/products"
            className="flex items-center gap-2 px-6 py-3 bg-green-800 text-amber-50 rounded-full hover:bg-green-700 transition-colors"
          >
            <FaShoppingBag />
            Ver Productos
          </Link>
          <Link 
            href="/cultural"
            className="flex items-center gap-2 px-6 py-3 border border-green-800 text-green-800 rounded-full hover:bg-green-50 transition-colors"
          >
            <FaHandshake />
            Comunidad
          </Link>
        </div>
      </motion.section>

      {/* Visión y alcance */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="container mx-auto px-4 text-center"
      >
        <h2 className="text-3xl font-bold text-green-800 mb-4">Nuestra Visión</h2>
        <p className="text-green-700 text-lg max-w-3xl mx-auto">
          Raíces Verdes nace con el objetivo de ser un puente entre productores indígenas y consumidores conscientes. Queremos que cada producto cuente una historia, que cada compra represente un acto de apoyo a la identidad cultural y a la economía de las comunidades originarias.
        </p>
      </motion.section>

      {/* Impacto */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="container mx-auto px-4 text-center"
      >
        <h2 className="text-3xl font-bold text-green-800 mb-4">Nuestro Impacto</h2>
        <p className="text-green-700 text-lg max-w-3xl mx-auto">
          A través de nuestra plataforma, fortalecemos la autonomía de los pueblos originarios, promovemos el respeto por sus saberes, y ofrecemos una vitrina ética para productos naturales, artesanales y sustentables.
        </p>
      </motion.section>
    </div>
  )
}
