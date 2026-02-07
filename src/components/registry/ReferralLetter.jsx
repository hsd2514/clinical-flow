import {
  FileText,
  Printer,
  Send,
  Clock,
  AlertCircle,
  Download,
} from "lucide-react";

export default function ReferralLetter({
  patientName,
  reason,
  urgency,
  toSpecility,
}) {
  const urgencyConfig = {
    stat: {
      color: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/30",
      label: "STAT",
    },
    urgent: {
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      label: "Urgent",
    },
    routine: {
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      label: "Routine",
    },
  };

  const config = urgencyConfig[urgency?.toLowerCase()] || urgencyConfig.routine;

  return (
    <div className="card-clinical overflow-hidden">
      {/* Document Header */}
      <div className="relative p-6 border-b border-border bg-gradient-to-br from-muted/50 to-transparent">
        {/* Folded corner effect */}
        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-border to-muted rounded-bl-2xl shadow-inner" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-display text-xl text-foreground">
                Medical Referral
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Generated {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-lg ${config.bg} ${config.border} border`}
          >
            <span className={`text-xs font-bold ${config.color}`}>
              {config.label}
            </span>
          </div>
        </div>
      </div>

      {/* Document Body */}
      <div className="p-6 space-y-6 font-serif">
        {/* Recipient */}
        <div className="space-y-1">
          <span className="text-clinical text-muted-foreground">To</span>
          <p className="text-lg font-semibold text-foreground">
            Department of {toSpecility || "Surgery"}
          </p>
        </div>

        {/* Patient Info */}
        <div className="p-4 bg-muted/30 rounded-xl border border-border">
          <span className="text-clinical text-muted-foreground">Patient</span>
          <p className="text-lg font-semibold text-foreground">
            {patientName || "Patient Name"}
          </p>
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <span className="text-clinical text-muted-foreground">
            Reason for Referral
          </span>
          <p className="text-base text-foreground leading-relaxed">
            {reason || "Clinical assessment and further evaluation required."}
          </p>
        </div>

        {/* Clinical Notes */}
        <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              Clinical Notes
            </span>
          </div>
          <p className="text-sm text-foreground/80 italic leading-relaxed">
            "Patient presenting with classic signs of acute appendicitis.
            Positive for rebound tenderness. Requesting immediate surgical
            evaluation."
          </p>
        </div>

        {/* Signature Line */}
        <div className="pt-6 border-t border-dashed border-border">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <div className="w-48 border-b-2 border-foreground/30 h-8" />
              <p className="text-xs text-muted-foreground">
                Referring Physician Signature
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-4 bg-muted/30 border-t border-border flex gap-3">
        <button className="flex-1 btn-clinical btn-ghost justify-center gap-2">
          <Printer className="w-4 h-4" />
          Print PDF
        </button>
        <button className="flex-1 btn-clinical btn-ghost justify-center gap-2">
          <Download className="w-4 h-4" />
          Download
        </button>
        <button className="flex-1 btn-clinical btn-primary justify-center gap-2 shadow-lg">
          <Send className="w-4 h-4" />
          Send to Dept
        </button>
      </div>
    </div>
  );
}
