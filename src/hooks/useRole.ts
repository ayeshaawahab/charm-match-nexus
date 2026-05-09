import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Role = "brand" | "influencer";

export function useRole() {
  const [role, setRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async (uid: string | null) => {
      if (!uid) {
        if (!cancelled) { setUserId(null); setRole(null); setLoading(false); }
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .maybeSingle();
      if (!cancelled) {
        setUserId(uid);
        setRole((data?.role as Role) ?? null);
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      load(data.session?.user?.id ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      load(session?.user?.id ?? null);
    });

    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  return { role, userId, loading };
}
