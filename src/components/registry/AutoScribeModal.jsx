import {
  X,
  Check,
  FileText,
  Sparkles,
  Copy,
  Download,
  Printer,
  Pill,
  UserPlus,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Clock3,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const HEADING_ALIASES = {
  summary: "Visit Summary",
  "visit summary": "Visit Summary",
  "chief complaint": "Chief Complaint",
  vitals: "Vitals",
  "symptoms and findings": "Symptoms and Findings",
  symptoms: "Symptoms and Findings",
  assessment: "Assessment",
  "orders/labs": "Orders/Labs",
  orders: "Orders/Labs",
  labs: "Orders/Labs",
  "plan and follow-up": "Plan and Follow-up",
  plan: "Plan and Follow-up",
};

function normalizeHeading(raw = "") {
  const key = String(raw).trim().toLowerCase();
  return HEADING_ALIASES[key] || null;
}

function parseClinicalSections(summary = "") {
  if (!summary.trim()) return [];

  const lines = summary
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-=]{3,}$/g, "").trim())
    .filter(Boolean);

  const sections = [];
  let current = null;

  lines.forEach((line) => {
    const headingOnly = line.match(/^([A-Za-z][A-Za-z/\-\s]+):?$/);
    const headingWithText = line.match(/^([A-Za-z][A-Za-z/\-\s]+):\s+(.+)$/);

    if (headingWithText) {
      const title = normalizeHeading(headingWithText[1]);
      if (title) {
        if (current) sections.push(current);
        current = { title, lines: [headingWithText[2]] };
        return;
      }
    }

    if (headingOnly) {
      const title = normalizeHeading(headingOnly[1]);
      if (title) {
        if (current) sections.push(current);
        current = { title, lines: [] };
        return;
      }
    }

    if (!current) {
      current = { title: "Visit Summary", lines: [] };
    }
    current.lines.push(line);
  });

  if (current) sections.push(current);

  const deduped = [];
  const byTitle = new Map();
  sections.forEach((section) => {
    const normalized = {
      title: section.title,
      text: section.lines.join("\n").trim(),
    };
    if (!normalized.text) return;

    if (byTitle.has(normalized.title)) {
      byTitle.set(
        normalized.title,
        `${byTitle.get(normalized.title)}\n${normalized.text}`.trim(),
      );
      return;
    }

    byTitle.set(normalized.title, normalized.text);
    deduped.push(normalized);
  });

  return deduped;
}

export default function AutoScribeModal({
  summary,
  isOpen,
  isLoading = false,
  loadingStartedAt = null,
  patientName = "Patient",
  onClose,
  onAction,
}) {
  const [copied, setCopied] = useState(false);
  const [approved, setApproved] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const sections = useMemo(() => parseClinicalSections(summary), [summary]);

  useEffect(() => {
    if (!isOpen || !isLoading) return undefined;
    const startAt = Number(loadingStartedAt) || Date.now();
    const tick = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startAt) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isOpen, isLoading, loadingStartedAt]);

  if (!isOpen) return null;

  const handleApprove = () => {
    setApproved(true);
  };

  const handlePostAction = (action) => {
    if (onAction) {
      onAction(action);
    }
    onClose();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in-scale">
      <div className="bg-card w-full max-w-3xl rounded-3xl shadow-2xl border border-border flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-border overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 opacity-50" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-accent/20 to-transparent -translate-y-1/2 translate-x-1/2" />

          <div className="relative flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/30">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-display text-2xl text-foreground">
                    Auto-Scribe
                  </h2>
                  <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  Clinical Note Draft for Physician Review
                </p>
                <div className="mt-1 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{patientName}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-8">
            {isLoading ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Clock3 className="w-4 h-4 text-primary" />
                      Building clinical summary
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {elapsedSeconds}s elapsed
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-2/3 bg-gradient-to-r from-primary to-accent animate-pulse" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["Visit Summary", "Assessment", "Plan and Follow-up"].map(
                    (title) => (
                      <div
                        key={title}
                        className="rounded-2xl border border-border bg-card p-4"
                      >
                        <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-2">
                          {title}
                        </div>
                        <div className="space-y-2">
                          <div className="h-2.5 rounded bg-muted animate-pulse" />
                          <div className="h-2.5 rounded bg-muted animate-pulse w-5/6" />
                          <div className="h-2.5 rounded bg-muted animate-pulse w-4/6" />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ) : sections.length ? (
              <div className="space-y-4">
                <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
                  SOAP-Style Clinical Draft
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sections.map((section) => (
                    <div
                      key={section.title}
                      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                    >
                      <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-primary mb-2">
                        {section.title}
                      </div>
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                        {section.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : summary ? (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-primary mb-3">
                  Clinical Narrative
                </div>
                <div className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                  {summary}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <div className="loading-spinner" />
                </div>
                <p className="text-muted-foreground font-medium">
                  Generating clinical summary...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border bg-muted/30">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center">
              AI is drafting your note. You can keep working while this completes.
            </p>
          ) : !approved ? (
            <>
              <div className="flex items-center justify-between">
                {/* Secondary Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="btn-clinical btn-ghost gap-2"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                  <button className="btn-clinical btn-ghost gap-2">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button className="btn-clinical btn-ghost gap-2">
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                </div>

                {/* Primary Actions */}
                <div className="flex items-center gap-3">
                  <button onClick={onClose} className="btn-clinical btn-ghost">
                    Edit Manually
                  </button>
                  <button
                    onClick={handleApprove}
                    className="btn-clinical btn-primary gap-2 shadow-lg"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Sign</span>
                  </button>
                </div>
              </div>

              {/* Legal disclaimer */}
              <p className="text-xs text-muted-foreground text-center mt-4">
                This document has been generated by AI. Please review and verify
                all information before signing.
              </p>
            </>
          ) : (
            <div className="animate-fade-in-scale">
              {/* Approved success note */}
              <div className="flex items-center justify-center gap-2 mb-6 py-3 rounded-xl bg-green-50 border border-green-200">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-green-700">
                  Summary Approved & Signed
                </span>
              </div>

              {/* Post-visit actions */}
              <p className="text-sm text-muted-foreground text-center mb-4">
                What would you like to do next?
              </p>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handlePostAction("prescription")}
                  className="group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Pill className="w-7 h-7" />
                  </div>
                  <div className="text-center">
                    <span className="font-semibold text-foreground block">
                      Prescription
                    </span>
                    <span className="text-xs text-muted-foreground">
                      E-prescribe medications
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => handlePostAction("referral")}
                  className="group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-border hover:border-accent/50 hover:bg-accent/5 transition-all duration-200"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <UserPlus className="w-7 h-7" />
                  </div>
                  <div className="text-center">
                    <span className="font-semibold text-foreground block">
                      Referral
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Refer to specialist
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => handlePostAction("followup")}
                  className="group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-200"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Calendar className="w-7 h-7" />
                  </div>
                  <div className="text-center">
                    <span className="font-semibold text-foreground block">
                      Follow-Up
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Schedule next visit
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </button>
              </div>

              {/* Skip option */}
              <button
                onClick={onClose}
                className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
