import { ReactElement } from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface FacturaPageProps {
  params: {
    pagoId: string
  }
}

export default async function FacturaPage({ params }: FacturaPageProps): Promise<ReactElement> {
  const { pagoId } = params

  // Inicializa Supabase en componente server-side
  const supabase = createServerComponentClient({ cookies })

  // Llama al RPC que devuelve detalle de factura
  const { data: lineas, error } = await supabase
    .rpc('obtener_factura_con_detalle', { p_pago_id: pagoId })

  if (error) {
    console.error('Error al obtener la factura:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4">
        <div className="max-w-md w-full bg-red-50 p-8 rounded-xl shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-600">No se pudo cargar la factura. Intenta de nuevo más tarde.</p>
        </div>
      </div>
    )
  }

  // Si no hay líneas, factura no existente o vacía
  if (!lineas || lineas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4">
        <div className="max-w-md w-full bg-yellow-50 p-8 rounded-xl shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Factura no encontrada</h1>
          <p className="text-gray-600">No existe factura asociada al pago {pagoId}.</p>
        </div>
      </div>
    )
  }

  // Calcula totales
  const detalle = lineas as Array<any>
  const total = detalle.reduce((sum, row) => sum + Number(row.subtotal), 0)

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4">
      <div className="max-w-3xl w-full bg-gray-50 p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Factura #{detalle[0].numero_factura}</h1>
        <p className="text-gray-600 mb-6">Fecha: {new Date(detalle[0].fecha_factura).toLocaleString()}</p>

        <table className="w-full mb-6 table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-left">Producto</th>
              <th className="px-4 py-2 text-right">Cantidad</th>
              <th className="px-4 py-2 text-right">Precio Unitario</th>
              <th className="px-4 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {detalle.map((row) => (
              <tr key={row.producto_id} className="border-t">
                <td className="px-4 py-2">{row.nombre_producto}</td>
                <td className="px-4 py-2 text-right">{row.cantidad}</td>
                <td className="px-4 py-2 text-right">${row.precio_unitario.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">${row.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <span className="text-lg font-semibold">Total: ${total.toFixed(2)}</span>
        </div>

        {/* Botón de descarga de comprobante */}
        <div className="text-center">
          <a
            href={`/api/facturas/${pagoId}/comprobante`}
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-xl shadow hover:bg-blue-700 transition"
          >
            Descargar comprobante
          </a>
        </div>
      </div>
    </div>
  )
}