import { Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserIds } from "@/hooks/useUserIds";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface UserProfile {
  avatar_url?: string;
  name?: string;
}

export const InfluencerNavbar = () => {
  const navigate = useNavigate();
  const { influencerId } = useUserIds();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (influencerId) {
        const { data } = await supabase
          .from("influencers")
          .select("avatar_url, name")
          .eq("id", influencerId)
          .maybeSingle();
        if (!cancelled && data) {
          setProfile(data);
        }
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [influencerId]);

  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border">
      <div className="h-16 px-6 flex items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Right Section: Notifications + Avatar */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative w-10 h-10 rounded-full bg-card hover:bg-muted transition-colors flex items-center justify-center border border-border">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary"></span>
          </button>

          {/* Avatar */}
          <button
            onClick={() => navigate("/influencer/profile")}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
          >
            {!loading && profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-foreground">👤</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
