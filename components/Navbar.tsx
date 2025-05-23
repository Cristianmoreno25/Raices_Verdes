// componentes/Navbar.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaBars, FaTimes, FaSearch, FaUser, FaShoppingCart, FaLeaf
} from 'react-icons/fa'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/utils/supabase/client'
import Image from 'next/image'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showCart, setShowCart] = useState(false)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [cartLoading, setCartLoading] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const cartRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setShowCart(false)
      }
    }
    if (showCart) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCart])

  // Sesión de usuario
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
     return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Obtiene rol para perfil
  const getUserRole = async (userId: string): Promise<'producer' | 'client' | null> => {
    const { data: productor } = await supabase
      .from('productores')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
     if (productor) return 'producer'
    const { data: cliente } = await supabase
      .from('clientes')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
     if (cliente) return 'client'
     return null
  }

  // Cerrar sesión
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    if (pathname.startsWith('/profile')) {
      router.push('/')
    }
  }

   const userName = user?.user_metadata?.full_name || user?.email || 'Usuario'
  const navLinks = [
    { href: '/products', name: 'Productos' },
    { href: '/cultura', name: 'Cultura Indígena' },
    { href: '/medicina', name: 'Medicina Natural' },
  ]

  // Scroll cierra menú móvil
  useEffect(() => {
    const handleScroll = () => setIsOpen(false)
    if (isOpen) {
      document.body.classList.add('overflow-hidden')
      window.addEventListener('scroll', handleScroll)
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => {
      document.body.classList.remove('overflow-hidden')
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isOpen])

  useEffect(() => setIsOpen(false), [pathname])

  // Cargar carrito
  const fetchCart = async () => {
    if (!user) return
    setCartLoading(true)
    const { data, error } = await supabase
      .from('carritos')
      .select('id, cantidad, producto:producto_id(id, nombre, precio, imagen_url)')
      .eq('cliente_id', user.id)
    if (!error && data) setCartItems(data)
    setCartLoading(false)
  }

  // Actualizar cantidad
  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return
    await supabase.from('carritos').update({ cantidad: newQty }).eq('id', itemId)
    fetchCart()
  }

  // Eliminar item
  const removeItem = async (itemId: string) => {
    await supabase.from('carritos').delete().eq('id', itemId)
    fetchCart()
  }

  // Efecto: recarga al abrir
  useEffect(() => {
    if (showCart) fetchCart()
  }, [showCart])

  const total = cartItems.reduce((sum, i) => sum + i.cantidad * i.producto.precio, 0)

  return (
    <header className="bg-green-800 text-amber-50 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-2 py-2 flex items-center justify-between">
        {/* Logo y menú hamburguesa */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-amber-50 hover:text-amber-200 transition-colors"
            aria-label="Menú"
          >
            {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
          <Link href="/" className="flex items-center gap-1">
            <FaLeaf className="text-2xl text-amber-300" />
            <span className="text-lg font-bold hover:text-amber-200 transition-colors">
              Raíces Verdes
            </span>
          </Link>
        </div>

        {/* Barra de búsqueda */}
        <div className="hidden md:flex flex-1 mx-4">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Buscar productos artesanales..."
              className="w-full py-1 px-3 rounded-full text-green-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
            <button className="absolute right-0 top-0 h-full px-3 text-green-800 rounded-r-full bg-amber-200 hover:bg-amber-300 transition-colors">
              <FaSearch />
            </button>
          </div>
        </div>

        {/* Botones de usuario y carrito */}
        <div className="hidden md:flex items-center gap-2 relative" ref={cartRef}>
          {user ? (
            <>
              <button
                onClick={async () => {
                  const role = await getUserRole(user.id)
                  router.push(role === 'producer' ? '/profile/producer' : '/profile/client')
                }}
                className="text-amber-200 hover:text-amber-100 transition-colors text-sm"
              >
                ¡Hola, {userName}!
              </button>
              <button
                onClick={handleSignOut}
                className="px-3 py-1 rounded-full bg-amber-200 text-green-800 hover:bg-amber-300 transition-colors font-medium text-sm"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-3 py-1 rounded-full flex items-center hover:text-amber-200 transition-colors text-sm"
              >
                <FaUser className="mr-1" />
                Ingresar
              </Link>
              <Link
                href="/role-selection"
                className="px-3 py-1 rounded-full bg-amber-200 hover:bg-amber-300 text-green-800 font-medium transition-colors text-sm"
              >
                Registrarse
              </Link>
            </>
          )}
          {/* Botón y dropdown del carrito */}
          <div className="relative">
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative p-2 hover:text-amber-200 transition-colors"
            >
              <FaShoppingCart className="text-xl" />
              <span className="absolute -top-1 -right-1 bg-amber-300 text-green-800 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            </button>

            <AnimatePresence>
              {showCart && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 text-black"
                >
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">Tu carrito</h3>
                    {cartLoading ? (
                      <p>Cargando...</p>
                    ) : cartItems.length === 0 ? (
                      <p className="text-gray-500">El carrito está vacío</p>
                    ) : (
                      <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                        {cartItems.map((item) => (
                          <li key={item.id} className="py-2 flex items-center gap-3">
                            <div className="relative w-12 h-12">
                              <Image
                                src={item.producto.imagen_url}
                                alt={item.producto.nombre}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.producto.nombre}</p>
                              <p className="text-sm">$
                                {item.producto.precio.toLocaleString('es-CO')}
                              </p>
                              <div className="flex items-center mt-1">
                                <button
                                  onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                                  className="px-2 py-1 text-sm bg-gray-200 rounded-l hover:bg-gray-300"
                                >
                                  –
                                </button>
                                <span className="px-3 py-1 text-sm bg-gray-100">
                                  {item.cantidad}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                                  className="px-2 py-1 text-sm bg-gray-200 rounded-r hover:bg-gray-300"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {cartItems.length > 0 && (
                      <div className="mt-4 border-t pt-2">
                        <p className="text-right font-semibold">
                          Total: ${total.toLocaleString('es-CO')}
                        </p>
                        <button
                          onClick={() => { setShowCart(false); router.push('/checkout') }}
                          className="mt-2 w-full bg-green-700 text-white py-2 px-4 rounded hover:bg-green-800 transition"
                        >
                          Ir al pago
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Menú móvil */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-green-700 z-50 pt-16 px-3 pb-3 flex flex-col"
              >
                <nav className="flex-grow">
                  <ul className="space-y-2">
                    {navLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={`block py-2 px-3 rounded transition-colors ${
                            pathname === link.href 
                              ? 'bg-green-600 text-amber-100' 
                              : 'hover:bg-green-600'
                          }`}
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="border-t border-green-600 pt-3 space-y-2">
                  {user ? (
                    <button
                      onClick={handleSignOut}
                      className="w-full block py-2 px-3 rounded bg-amber-200 hover:bg-amber-300 text-green-800 font-medium text-center transition-colors text-sm"
                    >
                      Cerrar sesión
                    </button>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="block py-2 px-3 rounded hover:bg-green-600 text-center transition-colors text-sm"
                      >
                        Ingresar
                      </Link>
                      <Link
                        href="/role-selection"
                        className="block py-2 px-3 rounded bg-amber-200 hover:bg-amber-300 text-green-800 font-medium text-center transition-colors text-sm"
                      >
                        Registrarse
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
