'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ProductFilters } from '@/components/ui/ProductFilters';

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  comunidad_origen: string;
  imagen_url: string;
}

export default function ProductsPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filters, setFilters]     = useState<{ comunidad?: string; precioMin?: number; precioMax?: number }>({});
  const [loading, setLoading]     = useState(false);

  const limit  = 12;
  const offset = useRef(0);
  const hasMore= useRef(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchProductos = useCallback(
    async (reset = false) => {
      if (loading || !hasMore.current) return;
      setLoading(true);

      const params = new URLSearchParams();
      if (filters.comunidad)  params.set('comunidad', filters.comunidad);
      if (filters.precioMin != null) params.set('precioMin', String(filters.precioMin));
      if (filters.precioMax != null) params.set('precioMax', String(filters.precioMax));
      params.set('from', String(offset.current));
      params.set('to', String(offset.current + limit - 1));

      const res  = await fetch(`/api/products?${params.toString()}`);
      const data = (await res.json()) as Producto[];

      if (reset) setProductos(data);
      else {
        setProductos(prev => {
          const all = [...prev, ...data];
          return Array.from(new Map(all.map(p => [p.id, p])).values());
        });
      }

      if (data.length < limit) hasMore.current = false;
      else offset.current += limit;

      setLoading(false);
    },
    [filters]
  );

  useEffect(() => {
    offset.current  = 0;
    hasMore.current = true;
    fetchProductos(true);
  }, [filters]);

  useEffect(() => {
    if (!loaderRef.current || productos.length === 0) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) fetchProductos();
    });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [productos, fetchProductos]);

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 py-10 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-4xl font-bold text-green-800 text-center">Productos disponibles</h1>

      <ProductFilters onChange={setFilters} />

      {loading && <p className="text-center text-green-700">Cargando productos...</p>}
      {!loading && productos.length === 0 && <p className="text-center text-gray-600">No se encontraron productos.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map(prod => (
          <motion.div
            key={prod.id}
            className="bg-white rounded-2xl border shadow hover:shadow-lg transition"
            whileHover={{ scale: 1.02 }}
          >
            <div
              onClick={() => router.push(`/products/${prod.id}`)}
              className="cursor-pointer"
            >
              <div className="relative w-full aspect-video bg-white overflow-hidden rounded-t-2xl">
                <Image src={prod.imagen_url} alt={prod.nombre} fill className="object-contain" />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-green-900 mb-1">{prod.nombre}</h2>
                <p className="text-green-700 font-bold">${prod.precio.toLocaleString('es-CO')}</p>
                <p className="text-sm text-gray-600">{prod.comunidad_origen}</p>
              </div>
            </div>
            <div className="p-4 pt-0">
              <button onClick={() => router.push(`/products/${prod.id}`)} className="mt-2 w-full bg-green-700 text-white py-2 rounded-xl hover:bg-green-800 transition">
                Agregar al carrito 🛒
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div ref={loaderRef} className="h-8" />
    </motion.div>
  );
}