import { Bell, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 relative flex items-center justify-between">
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <button onClick={() => scrollTo("categories")} className="hover:text-foreground transition-colors whitespace-nowrap">
            Categories
          </button>
          <button onClick={() => scrollTo("influencers")} className="hover:text-foreground transition-colors">
            Browse
          </button>
          <button onClick={() => scrollTo("how-it-works")} className="hover:text-foreground transition-colors whitespace-nowrap">
            How It Works
          </button>
        </nav>

        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground font-serif">
            MatchEngine
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            className="relative w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors border border-border"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-secondary-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary border-2 border-background" />
          </button>
          <Link to="/auth?mode=login" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Log in
          </Link>
          <Link
            to="/auth?mode=signup"
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
};
