import { FileCheck, Shield, AlertTriangle, Stethoscope } from "lucide-react";

export default function ConsentSummaryCard({ procedure }) {
  return (
    <section className="card-clinical overflow-hidden">
      {/* Header */}
      <div className="bg-green-500/10 border-b border-green-500/20 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center">
          <FileCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-green-700 dark:text-green-400">
            Surgical Consent
          </h3>
          <p className="text-xs text-green-600 dark:text-green-500">
            Key risks and benefits discussed
          </p>
        </div>
        <Shield className="w-6 h-6 text-green-500 ml-auto" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
          <Stethoscope className="w-4 h-4 text-accent" />
          <div>
            <span className="text-xs text-muted-foreground">Procedure</span>
            <p className="text-sm font-semibold text-foreground">
              {procedure || "Appendectomy"}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-xs font-semibold text-destructive">
              Risks Covered
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Bleeding, infection, injury to surrounding organs, need for open
            conversion.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-green-600">
              Benefits Explained
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Definitive treatment of suspected appendicitis and reduction of
            perforation risk.
          </p>
        </div>
      </div>
    </section>
  );
}
