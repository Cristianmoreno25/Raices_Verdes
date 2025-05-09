// components/ui/spinner.tsx
export function Spinner() {
    return (
      <div
        className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"
        role="status"
        aria-label="Cargando"
      />
    );
  }
  