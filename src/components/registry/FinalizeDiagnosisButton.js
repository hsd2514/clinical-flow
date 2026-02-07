import { CheckCircle, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function FinalizeDiagnosisButton({ disabled, reason, onClick }) {
  const [status, setStatus] = useState("idle"); // idle, loading, done

  const handleClick = async () => {
    if (disabled) return;
    setStatus("loading");
    if (onClick) await onClick();
    setTimeout(() => setStatus("done"), 1000);
  };

  return (
    <div className="flex flex-col items-stretch gap-2">
      <button
        onClick={handleClick}
        disabled={disabled || status !== "idle"}
        className={`
          w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-300
          flex items-center justify-center gap-3
          ${
            disabled
              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
              : status === "done"
                ? "bg-green-500 text-white cursor-default"
                : status === "loading"
                  ? "bg-primary/70 text-primary-foreground cursor-wait"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          }
        `}
      >
        {status === "loading" && <Loader2 className="w-5 h-5 animate-spin" />}
        {status === "done" && <CheckCircle className="w-5 h-5" />}
        {status === "idle" && !disabled && <ArrowRight className="w-5 h-5" />}

        <span>
          {status === "done"
            ? "Diagnosis Finalized"
            : status === "loading"
              ? "Finalizing..."
              : "Finalize Diagnosis"}
        </span>
      </button>

      {disabled && reason && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 text-amber-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-xs">{reason}</p>
        </div>
      )}
    </div>
  );
}
