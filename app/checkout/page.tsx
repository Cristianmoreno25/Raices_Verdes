'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'

// Tipado para los items del carrito con precios
type CartItemWithPrecio = {
  producto_id: string
  cantidad: number
  productos: { precio: number }[]
}

// Tipado del pago insertado
type Pago = {
  id: string
}

type NuevoPago = {
  cliente_id: string
  total: number
  metodo_pago: string
}

export default function CheckoutPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [total, setTotal] = useState<number>(0)
  const [method, setMethod] = useState<'tarjeta' | 'efectivo'>('tarjeta')
  const [processing, setProcessing] = useState(false)
  const router = useRouter()

  // 1) Obtener usuario y calcular total del carrito
  useEffect(() => {
    async function load() {
      // Obtener sesión
      const { data: sessionData } = await supabase.auth.getSession()
      const id = sessionData.session?.user.id ?? null
      if (!id) {
        router.push('/auth/login')
        return
      }
      setUserId(id)

      // Obtener items del carrito con precio de producto
      const { data: itemsData, error: itemsError } = await supabase
        .from('carritos')
        .select('producto_id, cantidad, productos(precio)')
        .eq('cliente_id', id)

      if (itemsError) {
        console.error('Error cargando carrito:', itemsError)
        return
      }

      const cartItems = (itemsData ?? []) as CartItemWithPrecio[]

      // Calcular total
      const sum = cartItems.reduce((acc, item) => {
        const precio = item.productos[0]?.precio ?? 0
        return acc + item.cantidad * precio
      }, 0)

      setTotal(sum)
    }

    load()
  }, [router])

  // 2) Enviar pago ficticio
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!userId) return
    if (total <= 0) {
      alert('El carrito está vacío.')
      return
    }

    setProcessing(true)

    // Insertar pago
    const { data: pagoData, error: pagoError } = await supabase
      .from('pagos')
      .insert<NuevoPago>({
        cliente_id: userId,
        total,
        metodo_pago: method
      })
      .select('id')
      .single()

    if (pagoError || !pagoData?.id) {
      alert('Error al crear el pago.')
      console.error(pagoError)
      setProcessing(false)
      return
    }

    const pagoId = pagoData.id

    // Obtener los items para detalle
    const { data: detailData, error: detailError } = await supabase
      .from('carritos')
      .select('producto_id, cantidad, productos(precio)')
      .eq('cliente_id', userId)

    if (detailError) {
      console.error('Error cargando items para detalle:', detailError)
    } else {
      const detalleItems = (detailData ?? []) as CartItemWithPrecio[]
      const detalles = detalleItems.map(i => ({
        pago_id: pagoId,
        producto_id: i.producto_id,
        cantidad: i.cantidad,
        precio_unitario: i.productos[0]?.precio ?? 0
      }))
      await supabase.from('detalle_pagos').insert(detalles)
    }

    // Limpiar carrito y redirigir
    await supabase.from('carritos').delete().eq('cliente_id', userId)
    alert('Pago simulado exitoso!')
    router.push('/orders/confirmation')
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Pagar pedido</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1" htmlFor="method">Método de pago:</label>
          <select
            id="method"
            value={method}
            onChange={e => setMethod(e.target.value as 'tarjeta' | 'efectivo')}
            className="w-full p-2 border rounded"
          >
            <option value="tarjeta">Tarjeta</option>
            <option value="efectivo">Efectivo</option>
          </select>
        </div>

        <div>
          <label className="block mb-1" htmlFor="total">Total a pagar:</label>
          <input
            id="total"
            type="text"
            readOnly
            value={`$${total.toFixed(2)}`}
            className="w-full p-2 bg-gray-100 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={processing}
          className="w-full py-2 bg-green-700 text-white rounded hover:bg-green-800 transition"
        >
          {processing ? 'Procesando...' : 'Realizar pago'}
        </button>
      </form>
    </div>
  )
}
