import { TrendingUp, Lightbulb, BarChart3 } from "lucide-react";

export default function LineChart({ title, data, insight }) {
  const values = data?.values || [];
  const labels = data?.labels || [];
  const maxVal = Math.max(...values, 1);

  const getBarColor = (val, index) => {
    const intensity = val / maxVal;
    if (intensity > 0.8) return "from-primary to-primary/70";
    if (intensity > 0.5) return "from-primary/80 to-primary/50";
    return "from-primary/60 to-primary/30";
  };

  return (
    <div className="card-clinical p-6 group">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">
              {values.length} data points
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-green-600">
          <TrendingUp className="w-3 h-3" />
          <span className="text-xs font-semibold">Live</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative h-36 flex items-end justify-between gap-1 mb-4 px-2">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-px bg-border/50 w-full" />
          ))}
        </div>

        {/* Bars */}
        {values.map((val, i) => {
          const heightPercent = (val / maxVal) * 100;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1.5 relative z-10 group/bar"
            >
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all duration-200 pointer-events-none">
                <div className="bg-foreground text-background px-2 py-1 rounded-lg text-xs font-bold shadow-lg whitespace-nowrap">
                  {val}
                </div>
              </div>

              {/* Bar */}
              <div
                style={{ height: `${heightPercent}%` }}
                className={`
                  w-full max-w-[32px] rounded-t-lg bg-gradient-to-t ${getBarColor(val, i)}
                  transition-all duration-500 ease-out
                  group-hover/bar:scale-105 group-hover/bar:shadow-lg group-hover/bar:shadow-primary/20
                `}
              />

              {/* X-axis label */}
              {labels[i] && (
                <span className="text-[10px] text-muted-foreground font-medium truncate max-w-full">
                  {labels[i]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Insight Box */}
      {insight && (
        <div className="flex gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold text-accent mb-0.5">
              AI Insight
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {insight}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
