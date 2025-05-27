'use client';
import React, { useState } from 'react';

interface Props {
  onChange: (filters: { comunidad?: string; precioMin?: number; precioMax?: number }) => void;
}

export function ProductFilters({ onChange }: Props) {
  const [comunidad, setComunidad] = useState('');
  const [precioMin, setPrecioMin] = useState<number>();
  const [precioMax, setPrecioMax] = useState<number>();

  const aplicar = () => onChange({ comunidad, precioMin, precioMax });
  const limpiar = () => {
    setComunidad('');
    setPrecioMin(undefined);
    setPrecioMax(undefined);
    onChange({});
  };

  return (
    <div className="space-y-4 p-4 border rounded">
      <h3 className="text-lg font-semibold">Filtrar productos</h3>

      <div>
        <label htmlFor="f-comunidad" className="block">Comunidad:</label>
        <input
          id="f-comunidad"
          type="text"
          value={comunidad}
          onChange={e => setComunidad(e.target.value)}
          className="w-full border p-1 rounded"
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="f-preciomin" className="block">Precio mínimo:</label>
          <input
          id="f-preciomin"
          type="number"
          value={precioMin !== undefined ? precioMin : ''}
          onChange={e => {
            const v = e.target.value;
            setPrecioMin(v === '' ? undefined : Number(v));
          }}
          className="w-full border p-1 rounded"
        />
        </div>
        <div className="flex-1">
          <label htmlFor="f-preciomax" className="block">Precio máximo:</label>
          <input
          id="f-preciomax"
          type="number"
          value={precioMax !== undefined ? precioMax : ''}
          onChange={e => {
            const v = e.target.value;
            setPrecioMax(v === '' ? undefined : Number(v));
          }}
          className="w-full border p-1 rounded"
        />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={aplicar}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Aplicar
        </button>
        <button
          onClick={limpiar}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}