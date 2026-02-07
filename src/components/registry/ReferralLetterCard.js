import { FileText, Send, Download, Building2 } from "lucide-react";

export default function ReferralLetterCard({ diagnosis, summary }) {
  return (
    <section className="card-clinical overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Surgical Referral</h3>
            <p className="text-xs text-muted-foreground">
              Pre-filled for on-call surgeon
            </p>
          </div>
        </div>

        <Building2 className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="p-3 rounded-lg bg-accent/10">
          <span className="text-xs text-muted-foreground">
            Provisional Diagnosis
          </span>
          <p className="text-sm font-semibold text-foreground mt-1">
            {diagnosis || "Acute Appendicitis"}
          </p>
        </div>

        {summary && (
          <div className="p-3 rounded-lg bg-muted border-l-4 border-accent">
            <p className="text-sm text-foreground leading-relaxed">{summary}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border flex gap-2">
        <button className="btn-clinical btn-ghost flex-1 flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
        <button className="btn-clinical btn-primary flex-1 flex items-center justify-center gap-2">
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </div>
    </section>
  );
}
