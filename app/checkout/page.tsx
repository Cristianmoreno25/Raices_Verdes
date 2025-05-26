//app/checkout/page.tsx
"use client"

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FaShoppingBag, FaLeaf } from 'react-icons/fa'
import { supabase } from '@/utils/supabase/client'

interface CartItem {
  id: string
  producto_id: string
  nombre: string
  precio: number
  cantidad: number
  stock: number
}

type NuevoPago = {
  cliente_id: string
  total: number
  metodo_pago: string
}

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState<number>(0)
  const [method, setMethod] = useState<'tarjeta' | 'efectivo'>('tarjeta')
  const [processing, setProcessing] = useState(false)
  const router = useRouter()

 useEffect(() => {
    async function loadCart() {
      const { data: session } = await supabase.auth.getSession()
      const userId = session.session?.user.id
      if (!userId) return router.push('/auth/login')

      const { data, error } = await supabase
        .from('carritos')
        .select('id, producto_id, cantidad, producto:producto_id(nombre, precio, stock)')
        .eq('cliente_id', userId)

      if (error) {
        console.error('Error cargando carrito:', error)
        return
      }

      setItems(
        (data ?? []).map((i: any) => ({
          id: i.id,
          producto_id: i.producto_id,
          nombre: i.producto.nombre,
          precio: i.producto.precio,
          stock: i.producto.stock,
          cantidad: i.cantidad,
        }))
      )
    }
    loadCart()
  }, [router])

  useEffect(() => {
    setTotal(items.reduce((sum, i) => sum + i.precio * i.cantidad, 0))
  }, [items])

  const updateQuantity = (idx: number, qty: number) => {
    setItems(prev => {
      const c = [...prev]
      c[idx].cantidad = Math.min(Math.max(qty, 1), c[idx].stock)
      return c
    })
  }
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    // Obtener usuario
    const { data: session } = await supabase.auth.getSession()
    const user = session.session?.user
    if (!user?.id) {
      alert('Debes iniciar sesión para pagar.')
      router.push('/auth/login')
      return
    }
    const userId = user.id

    // Validar existencia de cliente
    const { data: cliente, error: clienteErr } = await supabase
      .from('clientes')
      .select('id')
      .eq('id', userId)
      .single()
    if (clienteErr && clienteErr.code === 'PGRST116') {
      const { error: ciErr } = await supabase.from('clientes').insert({
        id: userId,
        nombre: user.user_metadata.full_name || user.email,
        correo: user.email as string,
      })
      if (ciErr) {
        console.error('Error creando cliente:', ciErr)
        alert('No se pudo crear tu perfil de cliente.')
        setProcessing(false)
        return
      }
    }

    if (items.length === 0) {
      alert('Tu carrito está vacío.')
      setProcessing(false)
      return
    }

    for (const item of items) {
      if (item.cantidad > item.stock) {
        alert(`Stock insuficiente para ${item.nombre}`)
        setProcessing(false)
        return
      }
    }

    // Crear pago
    const { data: pago, error: pagoErr } = await supabase
      .from('pagos')
      .insert<NuevoPago>({ cliente_id: userId, total, metodo_pago: method })
      .select('id')
      .single()
    if (pagoErr || !pago?.id) {
      console.error('Error al crear pago:', pagoErr)
      alert('Error al crear el pago: ' + (pagoErr?.message || pagoErr))
      setProcessing(false)
      return
    }

    // Detalles y stock
    await Promise.all(
      items.map(i =>
        Promise.all([
          supabase.from('detalle_pagos').insert({
            pago_id: pago.id,
            producto_id: i.producto_id,
            cantidad: i.cantidad,
            precio_unitario: i.precio,
          }),
          supabase.from('productos').update({ stock: i.stock - i.cantidad }).eq('id', i.producto_id),
        ])
      )
    )

    // Limpiar carrito
    await supabase.from('carritos').delete().eq('cliente_id', userId)

    router.push('/orders/confirmation')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="max-w-lg mx-auto mt-12 p-6 bg-white rounded-xl shadow">
      <div className="flex items-center mb-6">
        <FaLeaf className="text-2xl text-green-700 mr-2" />
        <h1 className="text-2xl font-bold">Confirmar Compra</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence>
          {items.map((i, idx) => (
            <motion.div key={i.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
              className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div>
                <p className="font-medium">{i.nombre}</p>
                <p className="text-sm text-gray-500">${i.precio.toFixed(2)}</p>
                <p className="text-xs text-red-600">Stock: {i.stock}</p>
              </div>
              <div className="flex items-center">
                <button type="button" onClick={() => updateQuantity(idx, i.cantidad - 1)} disabled={i.cantidad <= 1} className="px-2">–</button>
                <input type="number" value={i.cantidad} min={1} max={i.stock} onChange={e => updateQuantity(idx, +e.target.value)}
                  className="w-12 text-center border rounded mx-1" />
                <button type="button" onClick={() => updateQuantity(idx, i.cantidad + 1)} disabled={i.cantidad >= i.stock} className="px-2">+</button>
              </div>
              <p className="font-semibold">${(i.precio * i.cantidad).toFixed(2)}</p>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex justify-between pt-4 border-t">
          <span className="font-bold">Total:</span>
          <span className="font-bold">${total.toFixed(2)}</span>
        </div>

        <div>
          <label className="block text-sm mb-1">Método de Pago:</label>
          <select value={method} onChange={e => setMethod(e.target.value as any)} className="w-full p-2 border rounded">
            <option value="tarjeta">Tarjeta</option>
            <option value="efectivo">Efectivo</option>
          </select>
        </div>

        <button type="submit" disabled={processing} className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
          {processing ? 'Procesando...' : <><FaShoppingBag className="inline mr-2" />Pagar Ahora</>}
        </button>
      </form>
    </motion.div>
  )
}
