import { FileAudio, Copy, Check, Sparkles } from "lucide-react";
import { useState } from "react";

export default function AutoScribeSummary({ summary }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!summary) return null;

  return (
    <section className="card-clinical overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-green-500/5 to-accent/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-accent flex items-center justify-center text-white">
            <FileAudio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              AutoScribe Summary
              <Sparkles className="w-4 h-4 text-accent" />
            </h3>
            <p className="text-xs text-muted-foreground">
              AI-generated discharge summary
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="btn-clinical btn-ghost flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-green-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="p-4 rounded-lg bg-muted border-l-4 border-green-500">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {summary}
          </p>
        </div>
      </div>
    </section>
  );
}
