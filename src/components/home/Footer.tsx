import { Zap } from "lucide-react";

export const Footer = () => (
  <footer className="py-8 bg-background border-t border-border">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Zap className="w-3 h-3 text-primary-foreground" />
        </div>
        <span className="font-bold text-foreground font-serif">MatchEngine</span>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        © 2026 MatchEngine. Connecting brands with creators across Pakistan.
      </p>
      <div className="flex items-center gap-5 text-xs text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
        <a href="#" className="hover:text-foreground transition-colors">Terms</a>
        <a href="#" className="hover:text-foreground transition-colors">Contact</a>
      </div>
    </div>
  </footer>
);
