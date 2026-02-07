import {
  AlertTriangle,
  Info,
  ShieldAlert,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AlertCard({ level, title, message, action }) {
  const configs = {
    critical: {
      bg: "bg-destructive/10 dark:bg-destructive/20",
      border: "border-destructive/30",
      text: "text-destructive",
      icon: AlertTriangle,
      glow: "shadow-destructive/20",
    },
    warning: {
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      border: "border-amber-500/30",
      text: "text-amber-600 dark:text-amber-400",
      icon: ShieldAlert,
      glow: "shadow-amber-500/20",
    },
    info: {
      bg: "bg-primary/10 dark:bg-primary/20",
      border: "border-primary/30",
      text: "text-primary",
      icon: Info,
      glow: "shadow-primary/20",
    },
    success: {
      bg: "bg-green-500/10 dark:bg-green-500/20",
      border: "border-green-500/30",
      text: "text-green-600 dark:text-green-400",
      icon: CheckCircle,
      glow: "shadow-green-500/20",
    },
  };

  const config = configs[level] || configs.info;
  const Icon = config.icon;

  return (
    <div
      className={`
      relative overflow-hidden p-5 rounded-2xl border-l-4 
      ${config.bg} ${config.border}
      shadow-lg ${config.glow}
      transition-all duration-300 hover:scale-[1.01]
      animate-fade-in-scale
    `}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Icon className="w-24 h-24 rotate-12" />
      </div>

      <div className="flex gap-4 relative z-10">
        <div
          className={`
          flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
          ${config.bg} ${config.text}
          ${level === "critical" ? "animate-pulse" : ""}
        `}
        >
          <Icon className="w-5 h-5" strokeWidth={2.5} />
        </div>

        <div className="flex-1">
          <h3 className={`font-bold text-sm mb-1 ${config.text}`}>{title}</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {message}
          </p>

          {action && (
            <button
              className={`
              mt-3 px-4 py-2 rounded-lg text-xs font-semibold
              ${config.bg} ${config.text} border ${config.border}
              hover:opacity-80 transition-opacity
            `}
            >
              {action}
            </button>
          )}
        </div>

        {level === "critical" && (
          <button className="flex-shrink-0 p-1 hover:bg-destructive/10 rounded-lg transition-colors">
            <XCircle className="w-5 h-5 text-destructive/50 hover:text-destructive" />
          </button>
        )}
      </div>
    </div>
  );
}
