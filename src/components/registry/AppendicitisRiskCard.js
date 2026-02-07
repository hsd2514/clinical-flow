import {
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

export default function AppendicitisRiskCard({ score = 0, riskLevel = "low" }) {
  const configs = {
    high: {
      bg: "bg-destructive/10",
      border: "border-destructive/30",
      text: "text-destructive",
      icon: AlertTriangle,
      label: "High Risk for Appendicitis",
      action: "Urgent surgical consultation recommended",
    },
    moderate: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-600 dark:text-amber-400",
      icon: ShieldAlert,
      label: "Intermediate Risk",
      action: "CT imaging and observation advised",
    },
    low: {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-600 dark:text-green-400",
      icon: ShieldCheck,
      label: "Low Risk",
      action: "Consider alternate diagnosis",
    },
  };

  const config = configs[riskLevel] || configs.low;
  const Icon = config.icon;
  const percentage = (score / 10) * 100;

  return (
    <section
      className={`card-clinical overflow-hidden ${config.bg} ${config.border}`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center`}
            >
              <Icon className={`w-6 h-6 ${config.text}`} />
            </div>
            <div>
              <h3 className="text-clinical text-muted-foreground">
                Alvarado Score
              </h3>
              <p className={`font-semibold ${config.text}`}>{config.label}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-bold font-mono ${config.text}`}>
                {score}
              </span>
              <span className="text-lg text-muted-foreground">/10</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 via-amber-500 to-destructive transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Recommendation */}
        <div className="mt-4 flex items-center gap-2">
          <TrendingUp className={`w-4 h-4 ${config.text}`} />
          <span className="text-sm text-muted-foreground">{config.action}</span>
        </div>
      </div>
    </section>
  );
}
