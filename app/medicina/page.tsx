// app/medicina/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {supabase} from '@/utils/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  image_url: string | null;
  author_name: string;
  created_at: string;
  likes: number;
  dislikes: number;
}

export default function MedicinaPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchArticles();
  }, [filter, category]);

  const fetchArticles = async () => {
    setLoading(true);
    let query = supabase
      .from('articulos_medicinales')
      .select(
        `id,
         title,
         category,
         content,
         image_url,
         created_at,
         likes,
         dislikes,
         productores (nombre_productor)`
      )
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (filter) query = query.ilike('title', `%${filter}%`);

    const { data, error } = await query;
    if (error) console.error(error.message);
    else {
      setArticles(
        data.map(a => ({
          id: a.id,
          title: a.title,
          category: a.category,
          content: a.content,
          image_url: a.image_url,
          author_name: a.productores![0]?.nombre_productor ?? 'Anónimo',
          created_at: a.created_at,
          likes: a.likes,
          dislikes: a.dislikes,
        }))
      );
    }
    setLoading(false);
  };

  const handleReaction = async (id: string, type: 'like' | 'dislike') => {
    await supabase.rpc('react_medicinal_article', { article_id: id, reaction: type });
    fetchArticles();
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Medicina Ancestral</h1>
      <div className="mb-4">
        <p className="text-yellow-700 bg-yellow-100 p-2 rounded">
          ⚠️ Esta información es de carácter cultural y no sustituye atención médica profesional.
        </p>
      </div>
      <div className="flex gap-2 mb-4">
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">Todas las categorías</option>
          <option value="dolor_general">Dolor General</option>
          <option value="dolor_cabeza">Dolor de Cabeza</option>
          <option value="dolor_muscular">Dolor Muscular</option>
        </select>
        <Input
          placeholder="Buscar artículos..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <Button onClick={fetchArticles}>Filtrar</Button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {articles.map(a => (
            <div key={a.id} className="border rounded-lg p-4 shadow-md">
              {a.image_url && <img src={a.image_url} alt={a.title} className="w-full h-40 object-cover rounded" />}
              <h2 className="font-semibold text-xl mt-2">{a.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Por {a.author_name} — {new Date(a.created_at).toLocaleDateString()}
              </p>
              <p className="mt-2">{a.content.substring(0, 150)}...</p>
              <div className="flex gap-4 mt-2">
                <button onClick={() => handleReaction(a.id, 'like')} className="flex items-center gap-1">
                  👍 {a.likes}
                </button>
                <button onClick={() => handleReaction(a.id, 'dislike')} className="flex items-center gap-1">
                  👎 {a.dislikes}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
