import { useState } from "react";
import {
  PenTool,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Shield,
} from "lucide-react";

export default function ConsentForm({ procedure, patientName }) {
  const [signed, setSigned] = useState(false);
  const [understood, setUnderstood] = useState(false);

  const canSign = understood;

  return (
    <div className="card-clinical overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-clinical text-muted-foreground">
              Informed Consent
            </h3>
            <h4 className="font-semibold text-lg text-foreground">
              {procedure}
            </h4>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Consent Text */}
        <div className="p-4 bg-muted/50 rounded-xl border border-border max-h-32 overflow-y-auto scrollbar-thin">
          <p className="text-sm text-muted-foreground leading-relaxed">
            I hereby authorize the performance of the procedure named above. I
            understand the risks involved including but not limited to bleeding,
            infection, adverse reaction to anesthesia, and other potential
            complications. The nature of the procedure, alternatives, and
            potential risks have been explained to me. All my questions have
            been answered to my satisfaction.
          </p>
        </div>

        {/* Risk Acknowledgment */}
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Please review and acknowledge the risks before signing.
            </p>
          </div>
        </div>

        {/* Checkbox */}
        <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-border hover:border-primary/30 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
            className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-primary focus:ring-offset-0"
          />
          <div>
            <span className="text-sm font-medium text-foreground">
              I have read and understand the risks
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              Required before signing
            </p>
          </div>
        </label>

        {/* Signature Area */}
        <div className="space-y-2">
          <label className="text-clinical text-muted-foreground">
            Patient Signature
          </label>

          <div className="relative min-h-[80px] rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
            {!signed ? (
              <button
                onClick={() => canSign && setSigned(true)}
                disabled={!canSign}
                className={`
                  w-full h-full py-6 flex flex-col items-center justify-center gap-2 transition-all
                  ${
                    canSign
                      ? "text-muted-foreground hover:text-primary hover:bg-primary/5 cursor-pointer"
                      : "text-muted-foreground/50 cursor-not-allowed"
                  }
                `}
              >
                <PenTool className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {canSign ? "Tap to Sign" : "Acknowledge risks first"}
                </span>
              </button>
            ) : (
              <div className="w-full py-4 px-6 flex items-center justify-between">
                <div className="font-display italic text-3xl text-primary">
                  {patientName || "Patient Signature"}
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-semibold">Signed</span>
                </div>
              </div>
            )}
          </div>

          {signed && (
            <p className="text-xs text-muted-foreground">
              Signed on {new Date().toLocaleDateString()} at{" "}
              {new Date().toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>This consent is digitally recorded and legally binding</span>
        </div>
      </div>
    </div>
  );
}
