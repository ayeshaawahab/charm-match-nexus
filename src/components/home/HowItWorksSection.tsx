const STEPS = [
  { step: "01", title: "Set your brief", desc: "Tell us your niche, budget, and campaign goals. Our AI surfaces the best-fit creators instantly.", accent: "#C7522A", bg: "#FFF3EE" },
  { step: "02", title: "Browse matches", desc: "Review ranked influencer profiles with verified stats, past brand collabs, and audience breakdowns.", accent: "#E8953A", bg: "#FFF8EE" },
  { step: "03", title: "Book & launch", desc: "Send collaboration requests, negotiate rates, sign contracts, and track your campaign — all in one dashboard.", accent: "#059669", bg: "#F0FFF8" },
];

export const HowItWorksSection = () => (
  <section id="how-it-works" className="py-20 bg-background">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Simple process</p>
      <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4 font-serif">
        From brief to booking in minutes
      </h2>
      <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-14">
        We handle the discovery — you focus on the campaign.
      </p>

      <div className="grid md:grid-cols-3 gap-5 text-left">
        {STEPS.map((s) => (
          <div key={s.step} className="flex flex-col gap-4 p-6 rounded-2xl border border-border hover:shadow-md transition-shadow" style={{ background: s.bg }}>
            <span className="text-5xl font-bold leading-none font-serif" style={{ color: s.accent }}>{s.step}</span>
            <h3 className="text-xl font-bold text-foreground">{s.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
