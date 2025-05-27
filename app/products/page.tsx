'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
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
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    comunidad?: string;
    precioMin?: number;
    precioMax?: number;
  }>({});

  const limit = 12;
  const offset = useRef(0);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const router = useRouter();

  // Obtener sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });
  }, []);

  // Fetch con filtros
  const fetchProductos = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    if (reset) {
      offset.current = 0;
      setHasMore(true);
    }

    let query = supabase
      .from('productos')
      .select('id, nombre, precio, comunidad_origen, imagen_url')
      .order('creado_en', { ascending: false })
      .range(offset.current, offset.current + limit - 1);

    if (filters.comunidad)  query = query.eq('comunidad_origen', filters.comunidad);
    if (filters.precioMin != null) query = query.gte('precio', filters.precioMin);
    if (filters.precioMax != null) query = query.lte('precio', filters.precioMax);

    const { data, error: fetchError } = await query;
    if (fetchError) {
      setError('Error al cargar productos.');
      setLoading(false);
      return;
    }

    const nuevos = data ?? [];
    if (reset) setProductos(nuevos);
    else {
      setProductos(prev => {
        const all = [...prev, ...nuevos];
        return Array.from(new Map(all.map(p => [p.id, p])).values());
      });
    }

    if (nuevos.length < limit) setHasMore(false);
    else offset.current += limit;

    setLoading(false);
  }, [filters]);

  // Reload al cambiar filtros
  useEffect(() => {
    fetchProductos(true);
  }, [filters]);

  // Infinite scroll
  useEffect(() => {
    if (!loaderRef.current) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) fetchProductos();
    });
    observerRef.current.observe(loaderRef.current);
    return () => observerRef.current?.disconnect();
  }, [fetchProductos, hasMore]);

  // Carrito
  const agregarAlCarrito = async (producto: Producto) => {
    if (!userId) {
      router.push('/auth/login');
      return;
    }
    const { data: existente } = await supabase
      .from('carritos')
      .select('id, cantidad')
      .eq('cliente_id', userId)
      .eq('producto_id', producto.id)
      .single();

    if (existente) {
      const { error: updateError } = await supabase
        .from('carritos')
        .update({ cantidad: existente.cantidad + 1 })
        .eq('id', existente.id);
      if (updateError) alert('Error al actualizar el carrito.');
      else {
        alert('Cantidad actualizada en el carrito ✅');
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } else {
      const { error: insertError } = await supabase.from('carritos').insert({
        cliente_id: userId,
        producto_id: producto.id,
        cantidad: 1,
      });
      if (insertError) alert('Error al agregar al carrito.');
      else {
        alert('Producto agregado al carrito ✅');
        window.dispatchEvent(new Event('cartUpdated'));
      }
    }
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-4xl font-bold text-green-800 mb-8 text-center">
        Productos disponibles
      </h1>

      <ProductFilters onChange={setFilters} />

      {msg && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {msg}
        </div>
      )}

      {loading && productos.length === 0 && (
        <p className="text-center text-green-700">Cargando productos...</p>
      )}
      {!loading && productos.length === 0 && (
        <p className="text-center text-gray-600">No se encontraron productos.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map(prod => (
          <motion.div
            key={prod.id}
            className="bg-white rounded-2xl border border-amber-200 shadow hover:shadow-lg transition"
            whileHover={{ scale: 1.02 }}
          >
            <div
              onClick={() => router.push(`/products/${prod.id}`)}
              className="cursor-pointer"
            >
              <div className="relative w-full aspect-video bg-white border border-amber-100 rounded-t-2xl overflow-hidden">
                <Image
                  src={prod.imagen_url}
                  alt={prod.nombre}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-green-900 mb-1">
                  {prod.nombre}
                </h2>
                <p className="text-green-700 font-bold">
                  ${prod.precio.toLocaleString('es-CO')}
                </p>
                <p className="text-sm text-gray-600">
                  {prod.comunidad_origen}
                </p>
              </div>
            </div>
            <div className="p-4 pt-0">
              <button
                onClick={() => agregarAlCarrito(prod)}
                className="mt-2 w-full bg-green-700 text-white py-2 px-4 rounded-xl hover:bg-green-800 transition"
              >
                Agregar al carrito 🛒
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {loading && productos.length > 0 && (
        <p className="text-center mt-6 text-green-700 font-semibold">
          Cargando más productos...
        </p>
      )}
      <div ref={loaderRef} className="h-8" />
    </motion.div>
  );
}