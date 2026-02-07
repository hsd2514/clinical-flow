import { AlertTriangle } from "lucide-react";

export default function AlertCard({ level, title, message }) {
  const tone =
    level === "critical"
      ? "border-red-500/80 bg-red-50 text-red-900"
      : "border-amber-500/80 bg-amber-50 text-amber-900";

  return (
    <div className={`flex gap-3 rounded-xl border-l-4 p-4 shadow-sm ${tone}`}>
      <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 shadow-inner">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold tracking-wide uppercase">
          {title}
        </h3>
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

