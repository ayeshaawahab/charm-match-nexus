import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useUserIds() {
  const [authId, setAuthId] = useState<string | null>(null)
  const [influencerId, setInfluencerId] = useState<string | null>(null)
  const [brandId, setBrandId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: session } = await supabase.auth.getSession()
      const uid = session.session?.user?.id ?? null
      if (!uid || cancelled) { setLoading(false); return }
      setAuthId(uid)
      const role = session.session?.user?.user_metadata?.role
      if (role === 'influencer') {
        const { data } = await supabase
          .from('influencers')
          .select('id')
          .eq('user_id', uid)
          .maybeSingle()
        if (!cancelled) setInfluencerId(data?.id ?? null)
      }
      if (role === 'brand') {
        // profiles.id === auth user id (standard Supabase pattern; no separate brands table)
        if (!cancelled) setBrandId(uid)
      }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  return { authId, influencerId, brandId, loading }
}
