import { motion } from "framer-motion";
import { Search, TrendingUp, Users, Star } from "lucide-react";

interface Props {
  searchQuery: string;
  onSearchQuery: (v: string) => void;
  onSearchSubmit: () => void;
  onQuickCategory: (cat: string) => void;
}

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export const HeroSection = ({ searchQuery, onSearchQuery, onSearchSubmit, onQuickCategory }: Props) => {
  return (
    <section className="relative overflow-hidden pt-14 pb-20 lg:pt-20 lg:pb-28">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full opacity-70"
          style={{ background: "radial-gradient(circle, #F4EAD8 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-[380px] h-[380px] rounded-full opacity-50"
          style={{ background: "radial-gradient(circle, #E8953A30 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-6 items-center">
        <div className="flex flex-col gap-7 max-w-xl">
          <motion.h1
            className="text-5xl lg:text-6xl xl:text-[4.5rem] font-bold text-foreground leading-[1.05] tracking-tight font-serif"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Where brands meet their{" "}
            <em className="not-italic text-primary">perfect voice.</em>
          </motion.h1>

          <motion.p
            className="text-lg text-muted-foreground leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            Discover and book Pakistan's top creators by niche, reach, and real engagement.
            AI-matched influencers across 8 categories.
          </motion.p>

          <motion.div
            className="flex gap-2 p-1.5 rounded-2xl bg-card border border-border shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex-1 flex items-center gap-3 px-3 py-1">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
                placeholder="Search by name, niche, or handle…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
              />
            </div>
            <button
              onClick={onSearchSubmit}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center gap-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-xs text-muted-foreground font-medium">Popular:</span>
            {["Beauty", "Fashion", "Food", "Fitness"].map((cat) => (
              <button
                key={cat}
                onClick={() => onQuickCategory(cat)}
                className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-muted transition-colors border border-border"
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="relative h-[520px] hidden lg:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="absolute top-0 right-0 w-[15rem] h-[20rem] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-background z-10"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              src="https://images.unsplash.com/photo-1677677159237-a36fcffe4516?w=420&h=560&fit=crop&auto=format&q=85"
              alt="Fashion influencer"
              className="w-full h-full object-cover object-top"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white font-bold text-sm font-serif">Layla Ahmed</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#E8538A40", color: "#fff", border: "1px solid #E8538A90" }}>
                Fashion · 3.1M
              </span>
            </div>
          </motion.div>

          <motion.div
            className="absolute top-48 left-2 w-[13rem] h-[17rem] rounded-[2rem] overflow-hidden shadow-xl border-4 border-background z-20"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              src="https://images.unsplash.com/photo-1616639943825-e0fbad20a3d3?w=380&h=500&fit=crop&auto=format&q=85"
              alt="Beauty influencer"
              className="w-full h-full object-cover object-top"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.8 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white font-bold text-sm font-serif">Sara Malik</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#7C3AED40", color: "#fff", border: "1px solid #7C3AED90" }}>
                Beauty · 2.4M
              </span>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-2 right-8 w-[11.5rem] h-[14rem] rounded-[2rem] overflow-hidden shadow-xl border-4 border-background z-10"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              src="https://images.unsplash.com/photo-1754485115876-9221149ccc19?w=360&h=460&fit=crop&auto=format&q=85"
              alt="Lifestyle influencer"
              className="w-full h-full object-cover object-top"
              animate={{ y: [0, -9, 0] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1.4 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white font-bold text-sm font-serif">Omar Raza</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#0891B240", color: "#fff", border: "1px solid #0891B290" }}>
                Lifestyle · 1.8M
              </span>
            </div>
          </motion.div>

          <motion.div
            className="absolute top-6 left-0 bg-card rounded-2xl shadow-lg border border-border p-3 flex items-center gap-3 z-30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Avg. Engagement</p>
              <p className="text-sm font-bold text-foreground">4.2%</p>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-20 left-0 bg-card rounded-2xl shadow-lg border border-border p-3 flex items-center gap-3 z-30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.05 }}
          >
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Verified Creators</p>
              <p className="text-sm font-bold text-foreground">100+</p>
            </div>
          </motion.div>

          <motion.div
            className="absolute top-[14.5rem] right-1 bg-card rounded-xl shadow-md border border-border px-3 py-2 flex items-center gap-1.5 z-30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.15 }}
          >
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="text-xs font-bold text-foreground">4.9 / 5</span>
            <span className="text-xs text-muted-foreground">by brands</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
