//app/orders/confirmation/page.tsx
import { FaCheckCircle } from 'react-icons/fa'
import Link from 'next/link'

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
        <FaCheckCircle className="text-green-600 text-6xl mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">¡Gracias por tu compra!</h1>
        <p className="text-gray-700 mb-6">
          Tu pedido ha sido procesado con éxito. Recibirás un correo de confirmación pronto.
        </p>
        <Link
          href="/"
          className="inline-block w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  )
}
