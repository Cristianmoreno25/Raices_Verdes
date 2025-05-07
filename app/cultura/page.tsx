// app/cultura/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {supabase} from '@/utils/supabase/client';
import { Spinner } from '@/components/ui/spinner';

interface Comment {
  id: string;
  nombre: string;
  comentario_comunidad: string;
  created_at: string;
}

export default function CulturaPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const pageSize = 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('productores')
      .select('id, nombre_productor, descripcion_comunidad, creado_en')
      .order('creado_en', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching comments:', error.message);
      setHasMore(false);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      setComments(prev => {
        // Map and filter duplicates based on prev
        const items = data.map(item => ({
          id: item.id,
          nombre: item.nombre_productor,
          comentario_comunidad: item.descripcion_comunidad,
          created_at: item.creado_en,
        }));
        const filtered = items.filter(item => !prev.some(p => p.id === item.id));
        return [...prev, ...filtered];
      });

      if (data.length < pageSize) {
        setHasMore(false);
      } else {
        setPage(prev => prev + 1);
      }
    } else {
      setHasMore(false);
    }

    setLoading(false);
  }, [page, hasMore, loading]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          fetchComments();
        }
      },
      { rootMargin: '200px' }
    );

    const loader = loaderRef.current;
    if (loader) observer.observe(loader);
    return () => {
      if (loader) observer.unobserve(loader);
    };
  }, [fetchComments, hasMore]);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Cultura Indígena</h1>
      <div className="grid gap-4">
        {comments.map(comment => (
          <div key={comment.id} className="border rounded-lg p-4 shadow-md">
            <div className="mb-2">
              <h2 className="font-semibold text-lg">{comment.nombre}</h2>
              <time className="text-sm text-gray-500">
                {new Date(comment.created_at).toLocaleString('es-CO')}
              </time>
            </div>
            <p>{comment.comentario_comunidad}</p>
          </div>
        ))}
      </div>

      <div ref={loaderRef} className="flex justify-center my-8">
        {loading && <Spinner />}
        {!hasMore && <p>No hay más comentarios.</p>}
      </div>
    </main>
  );
}
