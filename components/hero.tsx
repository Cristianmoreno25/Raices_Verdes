'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-green-50 py-20 px-6 text-center"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-green-800 mb-6 leading-tight">
          Raíces Verdes
        </h1>
        <p className="text-lg text-green-700 mb-8 max-w-2xl mx-auto">
          Un espacio donde la cultura, identidad y sostenibilidad se conectan. Apoyamos a productores indígenas para que sus productos lleguen al mundo, valorizando el conocimiento ancestral y fomentando un comercio justo.
        </p>
        <Image
          src="/logoRV.jpg" 
          alt="Raíces Verdes"
          width={200}
          height={200}
          className="mx-auto mb-4"
        />
      </div>
    </motion.section>
  )}