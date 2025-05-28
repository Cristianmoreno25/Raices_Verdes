//app/facturas/[pagoId]/comprobante/page.tsx
import { useEffect } from 'react'
import { useParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function ComprobantePage() {
  const { pagoId } = useParams()

  useEffect(() => {
    async function downloadComprobante() {
      try {
        const res = await fetch(`/api/facturas/${pagoId}/comprobante`)
        if (!res.ok) throw new Error('Error descargando comprobante')
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `factura-${pagoId}.pdf`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      } catch (err) {
        console.error(err)
      }
    }
    downloadComprobante()
  }, [pagoId])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-gray-600">Descargando comprobante...</p>
    </div>
  )
}
