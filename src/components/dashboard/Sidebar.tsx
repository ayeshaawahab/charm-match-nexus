import {
  Zap,
  BookUser,
  Sparkles,
  User,
  LayoutDashboard,
  Package,
  FolderKanban,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { NavLink } from "@/components/NavLink";

type Role = "brand" | "influencer";

type NavItem = {
  icon: typeof Zap;
  label: string;
  to: string;
};

const brandItems: NavItem[] = [
  { icon: BookUser, label: "Directory", to: "/" },
  { icon: Zap, label: "AI Match", to: "/campaign-match" },
  { icon: FolderKanban, label: "My Campaigns", to: "/brand/campaigns" },
  { icon: User, label: "My Profile", to: "/brand/profile" },
];

const influencerItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/influencer/dashboard" },
  { icon: User, label: "My Profile", to: "/influencer/profile" },
  { icon: Package, label: "My Packages", to: "/influencer/packages" },
];

const useRoleItems = (): NavItem[] => {
  const [role, setRole] = useState<Role>("brand");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const r = (data.session?.user.user_metadata?.role as Role) ?? "brand";
      setRole(r);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      const r = (s?.user.user_metadata?.role as Role) ?? "brand";
      setRole(r);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return useMemo(() => (role === "influencer" ? influencerItems : brandItems), [role]);
};

export const Sidebar = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  const items = useRoleItems();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <aside className="hidden md:flex tile flex-col items-center gap-2 py-6 px-3 sticky top-6 h-[calc(100vh-3rem)]">
      <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
        <Zap className="w-5 h-5 text-primary" />
      </div>
      <nav className="flex flex-col gap-3">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <div
              key={it.label}
              className="relative"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <NavLink
                to={it.to}
                end
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-[0_0_24px_hsl(var(--primary)/0.35)]"
                activeClassName="bg-primary text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.5)] hover:text-primary-foreground hover:bg-primary"
                aria-label={it.label}
              >
                <Icon className="w-5 h-5" />
              </NavLink>
              {hovered === i && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-14 top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 rounded-xl bg-card border border-border text-sm whitespace-nowrap shadow-lg"
                >
                  {it.label}
                </motion.span>
              )}
            </div>
          );
        })}
      </nav>
      <button
        onClick={handleLogout}
        aria-label="Log out"
        className="mt-auto w-12 h-12 rounded-2xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-[0_0_24px_hsl(var(--primary)/0.35)] transition-all duration-300"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </aside>
  );
};

export const MobileNav = () => {
  const items = useRoleItems();

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 tile flex justify-around py-3">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <NavLink
            key={it.label}
            to={it.to}
            end
            aria-label={it.label}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-muted-foreground"
            activeClassName="bg-primary text-primary-foreground"
          >
            <Icon className="w-5 h-5" />
          </NavLink>
        );
      })}
    </nav>
  );
};
