
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaShoppingCart } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/utils/supabase/client'

export type CartItem = {
  id: string
  cantidad: number
  producto: {
    id: string
    nombre: string
    precio: number
    imagen_url: string
  }
}

export default function CartDropdown() {
  const [showCart, setShowCart] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const cartRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // 1) Limpiar carrito al cerrar sesión
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setCartItems([])
    })
    return () => listener.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    const onCartUpdated = () => fetchCart()
    window.addEventListener('cartUpdated', onCartUpdated)
    return () => window.removeEventListener('cartUpdated', onCartUpdated)
  }, [])
  
  // 2) Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setShowCart(false)
      }
    }
    if (showCart) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCart])

  // 3) Fetch de carrito
  async function fetchCart() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // No mostrar error si no hay sesión, simplemente limpiar carrito
    setCartItems([])
    return
  }
    setLoading(true)
    const { data, error } = await supabase
      .from('carritos')
      .select('id, cantidad, producto:producto_id(id, nombre, precio, imagen_url)')
      .eq('cliente_id', user.id)
    if (!error && data) {
      const normalized = data.map((item: any) => ({
        id: item.id,
        cantidad: item.cantidad,
        producto: Array.isArray(item.producto) ? item.producto[0] : item.producto
      }))
      setCartItems(normalized)
    }
    setLoading(false)
  }

  // 4) Real-time subscription
  useEffect(() => {
    let channel: any = null
    const subscribeToCart = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      channel = supabase
        .channel('realtime-carrito')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'carritos',
            filter: `cliente_id=eq.${user.id}`
          },
          () => fetchCart()
        )
        .subscribe()
    }
    subscribeToCart()
    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  // 5) Helper de sesión
  async function requireSession(action: () => void) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMessage('Necesitas iniciar sesión para ver el carrito')
      setTimeout(() => setMessage(null), 2500)
      return false
    }
    action()
    return true
  }

  // 6) Toggle carrito
  const handleToggle = () => {
    requireSession(() => setShowCart(prev => !prev))
  }

  // 7) Update quantity
  async function updateQuantity(itemId: string, newQty: number) {
    if (!(await requireSession(() => {}))) return
    if (newQty < 1) return
    await supabase.from('carritos').update({ cantidad: newQty }).eq('id', itemId)
    fetchCart()
  }

  // 8) Remove item
  async function removeItem(itemId: string) {
    if (!(await requireSession(() => {}))) return
    await supabase.from('carritos').delete().eq('id', itemId)
    fetchCart()
  }

  // 9) Carga inicial al abrir
  useEffect(() => {
    if (showCart) fetchCart()
  }, [showCart])

  const total = cartItems.reduce((sum, i) => sum + i.cantidad * i.producto.precio, 0)

  return (
    <div className="relative" ref={cartRef}>
      {/* Tooltip animado */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 right-0 transform translate-y-[-100%] translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded-xl shadow-lg whitespace-nowrap z-50"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón del carrito */}
      <button
        onClick={handleToggle}
        className="relative p-2 hover:text-amber-200 transition-colors"
      >
        <FaShoppingCart className="text-xl" />
        <span className="absolute -top-1 -right-1 bg-amber-300 text-green-800 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {cartItems.length}
        </span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-40 text-black"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">Tu carrito</h3>
              {loading ? (
                <p>Cargando...</p>
              ) : cartItems.length === 0 ? (
                <p className="text-gray-500">El carrito está vacío</p>
              ) : (
                <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                  {cartItems.map(item => (
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
                        <p className="text-sm">
                          ${item.producto.precio.toLocaleString('es-CO')}
                        </p>
                        <div className="flex items-center mt-1">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.cantidad - 1)
                            }
                            className="px-2 py-1 text-sm bg-gray-200 rounded-l hover:bg-gray-300"
                          >
                            –
                          </button>
                          <span className="px-3 py-1 text-sm bg-gray-100">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.cantidad + 1)
                            }
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
                    onClick={() => {
                      setShowCart(false)
                      router.push('/checkout')
                    }}
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
  )
}
