import { Button } from "@/components/ui/button";
import { ArrowRight, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();
  const scrollToResults = () => {
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="tile relative overflow-hidden p-7"
    >
      <div className="relative z-10">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
          AI Match Engine · Live
        </span>
        <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight">
          Find Your Perfect{" "}
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Influencer Match
          </span>
        </h1>
        <p className="mt-3 text-muted-foreground text-sm">
          Smart AI-driven discovery across 100+ creators in 8 categories.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            onClick={() => navigate("/campaign-match")}
            className="rounded-2xl h-11 px-5 shadow-[0_0_24px_hsl(var(--primary)/0.45)]"
          >
            Get Started <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
          <Button
            onClick={scrollToResults}
            variant="outline"
            className="rounded-2xl h-11 px-5 border-border bg-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/50"
          >
            <Compass className="mr-1 w-4 h-4" /> Browse
          </Button>
        </div>
      </div>
    </motion.section>
  );
};
