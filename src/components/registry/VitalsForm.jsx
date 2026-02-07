import { useState, useEffect } from "react";
import { Activity, Thermometer, Heart, Gauge } from "lucide-react";
import { useClinicalContext } from "../../contexts/ClinicalContext";

export default function VitalsForm({ defaultTemp, onChange }) {
  const [form, setForm] = useState({ temp: defaultTemp || "", bp: "", hr: "" });
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const { updateContext } = useClinicalContext();

  // Report vitals data to both onChange prop (rule-based) AND context (Tambo)
  const reportVitals = (newState) => {
    const vitalsData = {
      temperature: parseFloat(newState.temp) || null,
      bloodPressure: newState.bp || null,
      heartRate: parseInt(newState.hr) || null,
    };

    // Report to onChange prop if available (rule-based mode)
    if (onChange) {
      onChange(vitalsData);
    }

    // Always report to context (works in Tambo mode too)
    updateContext("VitalsForm", vitalsData);
    setLastSavedAt(new Date());
  };

  const update = (field, val) => {
    const newState = { ...form, [field]: val };
    setForm(newState);
  };

  const getVitalStatus = (field, value) => {
    if (!value) return "neutral";
    const num = parseFloat(value);
    if (field === "temp") {
      if (num > 100.4) return "critical";
      if (num > 99.5) return "warning";
      if (num < 97) return "warning";
      return "normal";
    }
    if (field === "hr") {
      if (num > 100 || num < 60) return "warning";
      return "normal";
    }
    return "normal";
  };

  const statusColors = {
    neutral: "border-border bg-muted/30",
    normal:
      "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20",
    warning:
      "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20",
    critical: "border-destructive bg-destructive/10",
  };

  return (
    <div className="card-clinical p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Vital Signs</h3>
          <p className="text-xs text-muted-foreground">
            Record current patient vitals
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Temperature */}
        <div
          className={`p-4 rounded-xl border-2 transition-all ${statusColors[getVitalStatus("temp", form.temp)]}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Thermometer className="w-4 h-4 text-muted-foreground" />
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Temp
            </label>
          </div>
          <div className="flex items-baseline gap-1">
            <input
              type="number"
              step="0.1"
              value={form.temp}
              onChange={(e) => update("temp", e.target.value)}
              className="w-full bg-transparent text-2xl font-bold text-foreground outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="98.6"
            />
            <span className="text-sm text-muted-foreground font-medium">
              °F
            </span>
          </div>
        </div>

        {/* Blood Pressure */}
        <div
          className={`p-4 rounded-xl border-2 transition-all ${statusColors["neutral"]}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              BP
            </label>
          </div>
          <input
            type="text"
            value={form.bp}
            onChange={(e) => update("bp", e.target.value)}
            className="w-full bg-transparent text-2xl font-bold text-foreground outline-none font-mono"
            placeholder="120/80"
          />
        </div>

        {/* Heart Rate */}
        <div
          className={`p-4 rounded-xl border-2 transition-all ${statusColors[getVitalStatus("hr", form.hr)]}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Heart
              className={`w-4 h-4 ${form.hr ? "text-destructive animate-heartbeat" : "text-muted-foreground"}`}
            />
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              HR
            </label>
          </div>
          <div className="flex items-baseline gap-1">
            <input
              type="number"
              value={form.hr}
              onChange={(e) => update("hr", e.target.value)}
              className="w-full bg-transparent text-2xl font-bold text-foreground outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="72"
            />
            <span className="text-sm text-muted-foreground font-medium">
              bpm
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Save vitals to include them in scribe.
        </p>
        <div className="flex items-center gap-3">
          {lastSavedAt ? (
            <span className="text-xs text-green-700">
              Saved {lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          ) : (
            <span className="text-xs text-amber-700">Not saved</span>
          )}
          <button
            type="button"
            onClick={() => reportVitals(form)}
            className="btn-clinical btn-primary"
          >
            Save Vitals
          </button>
        </div>
      </div>
    </div>
  );
}
