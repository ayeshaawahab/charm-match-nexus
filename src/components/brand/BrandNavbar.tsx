import { Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserIds } from "@/hooks/useUserIds";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface BrandProfile {
  company_name?: string;
}

export const BrandNavbar = () => {
  const navigate = useNavigate();
  const { brandId } = useUserIds();
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (brandId) {
        const { data } = await supabase
          .from("profiles")
          .select("company_name")
          .eq("id", brandId)
          .maybeSingle();
        if (!cancelled && data) {
          setProfile(data);
        }
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [brandId]);

  const initial = profile?.company_name?.trim()?.[0]?.toUpperCase() ?? "🏢";

  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border">
      <div className="h-16 px-6 flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search creators..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative w-10 h-10 rounded-full bg-card hover:bg-muted transition-colors flex items-center justify-center border border-border">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary"></span>
          </button>

          <button
            onClick={() => navigate("/brand/profile")}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary flex items-center justify-center shrink-0 bg-primary/15 hover:opacity-90 transition-opacity"
          >
            <span className="text-sm font-bold text-foreground">{loading ? "…" : initial}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
