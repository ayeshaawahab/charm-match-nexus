import { useUserIds } from "@/hooks/useUserIds";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export const WelcomeBanner = () => {
  const { influencerId } = useUserIds();
  const [name, setName] = useState<string>("Influencer");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (influencerId) {
        const { data } = await supabase
          .from("influencers")
          .select("name")
          .eq("id", influencerId)
          .maybeSingle();
        if (!cancelled && data?.name) {
          setName(data.name);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [influencerId]);

  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <h2 className="text-2xl font-bold text-foreground font-serif">Welcome, {name}!</h2>
    </div>
  );
};
