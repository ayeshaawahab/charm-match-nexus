import { useState } from "react";
import { ChevronLeft, ChevronRight, Home, User, Calendar, Package, LogOut, Zap } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const MENU_ITEMS = [
  { label: "Dashboard", path: "/influencer/dashboard", icon: Home },
  { label: "Profile", path: "/influencer/profile", icon: User },
  { label: "Bookings", path: "/influencer/bookings", icon: Calendar },
  { label: "Packages", path: "/influencer/packages", icon: Package },
];

export const InfluencerSidebar = () => {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-40 ${
          open ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-border">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          {open && <span className="font-bold text-foreground font-serif">MatchEngine</span>}
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2 flex-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {open && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {open && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Toggle Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed left-4 top-20 z-50 flex items-center justify-center"
      >
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity">
          {open ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {/* Spacer */}
      <div className={`transition-all duration-300 ${open ? "w-64" : "w-20"}`} />
    </>
  );
};
