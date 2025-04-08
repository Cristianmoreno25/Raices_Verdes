'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

type SupabaseProviderProps = {
  children: React.ReactNode
  onClient?: (supabase: SupabaseClient) => void
}

export default function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )

  return <>{children}</>
}