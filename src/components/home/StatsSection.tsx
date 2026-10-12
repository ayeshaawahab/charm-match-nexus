interface Props {
  influencerCount: number;
  avgEngagement: number;
  loading: boolean;
}

export const StatsSection = ({ influencerCount, avgEngagement, loading }: Props) => {
  const stats = [
    { value: loading ? "—" : `${influencerCount}+`, label: "Verified Influencers" },
    { value: "8", label: "Content Categories" },
    { value: "5+", label: "Pakistani Brands" },
    { value: loading ? "—" : `${avgEngagement.toFixed(1)}%`, label: "Avg. Engagement Rate" },
  ];

  return (
    <section className="bg-stats border-y border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1">
            <span className="text-3xl lg:text-4xl font-bold text-primary font-serif">
              {s.value}
            </span>
            <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
