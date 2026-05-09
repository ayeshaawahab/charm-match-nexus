import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRole } from './useRole'

export function useUserIds() {
  const { userId: authId, role, loading: roleLoading } = useRole()
  const [influencerId, setInfluencerId] = useState<string | null>(null)
  const [brandId, setBrandId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (roleLoading) return
    let cancelled = false
    ;(async () => {
      if (!authId) {
        if (!cancelled) { setInfluencerId(null); setBrandId(null); setLoading(false) }
        return
      }
      if (role === 'influencer') {
        const { data } = await supabase
          .from('influencers')
          .select('id')
          .eq('user_id', authId)
          .maybeSingle()
        if (!cancelled) { setInfluencerId(data?.id ?? null); setBrandId(null) }
      } else if (role === 'brand') {
        // profiles.id === auth.users.id
        if (!cancelled) { setBrandId(authId); setInfluencerId(null) }
      } else {
        if (!cancelled) { setInfluencerId(null); setBrandId(null) }
      }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [authId, role, roleLoading])

  return { authId, influencerId, brandId, loading: loading || roleLoading }
}
