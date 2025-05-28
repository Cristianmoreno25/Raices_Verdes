//app/orders/confirmation/page.tsx

"use client"

import { FaCheckCircle } from 'react-icons/fa'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const pagoId = searchParams.get('pagoId')

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center space-y-4">
        <FaCheckCircle className="text-green-600 text-6xl mx-auto mb-2" />
        <h1 className="text-3xl font-bold">¡Gracias por tu compra!</h1>
        <p className="text-gray-700">
          Tu pedido ha sido procesado con éxito. Recibirás un correo de confirmación pronto.
        </p>

        <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6">
          <Link
            href="/"
            className="flex-1 inline-block py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition text-center"
          >
            Volver a la tienda
          </Link>

          {pagoId && (
            <Link
              href={`/facturas/${pagoId}`}
              className="flex-1 inline-block py-3 border border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition text-center mt-4 sm:mt-0"
            >
              Ver factura y obtener comprobante
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
