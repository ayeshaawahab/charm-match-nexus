import { CATEGORIES, type CategoryKey } from "@/lib/categories";

interface Props {
  activeCategory: CategoryKey | null;
  onToggle: (cat: CategoryKey) => void;
}

export const CategoriesSection = ({ activeCategory, onToggle }: Props) => {
  return (
    <section id="categories" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Explore</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground font-serif">
              Browse by category
            </h2>
          </div>
          {activeCategory && (
            <button
              onClick={() => onToggle(activeCategory)}
              className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity shrink-0"
            >
              Clear filter ×
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => onToggle(cat.key)}
                className="flex flex-col items-center gap-3 group"
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${
                    isActive ? "ring-2 ring-offset-2 ring-primary shadow-lg" : "shadow-sm hover:shadow-md"
                  }`}
                  style={{ background: "#8A715D" }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-xs font-semibold text-center transition-colors ${isActive ? "text-primary font-bold" : "text-foreground"}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
