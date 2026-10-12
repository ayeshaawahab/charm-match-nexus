import { Link } from "react-router-dom";

export const CTASection = () => (
  <section className="py-20 bg-primary relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
    </div>

    <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6">
      <h2 className="text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight font-serif">
        Ready to find your perfect creator?
      </h2>
      <p className="text-primary-foreground/80 text-lg">
        Join Pakistani brands already running campaigns with MatchEngine.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <input
          type="email"
          placeholder="Enter your work email"
          className="flex-1 px-4 py-3 rounded-xl bg-white/15 border border-white/25 text-primary-foreground placeholder:text-primary-foreground/50 text-sm outline-none focus:bg-white/20 transition-colors"
        />
        <Link
          to="/auth?mode=signup"
          className="px-6 py-3 rounded-xl bg-primary-foreground text-primary font-bold text-sm whitespace-nowrap hover:opacity-90 active:scale-[0.98] transition-all text-center"
        >
          Get Started Free
        </Link>
      </div>
      <p className="text-primary-foreground/55 text-xs">No credit card required · Free for brands</p>
    </div>
  </section>
);
