"use client";
import { useState } from "react";
import { useClinicalContext } from "../../contexts/ClinicalContext";

export default function VitalsForm({ defaultTemp = 98.6 }) {
  const [form, setForm] = useState({ temp: defaultTemp, bp: "118/76", hr: 78 });
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const { updateContext } = useClinicalContext();

  // Report vitals data to context
  const reportVitals = (newState) => {
    const vitalsData = {
      temperature: parseFloat(newState.temp) || null,
      bloodPressure: newState.bp || null,
      heartRate: parseInt(newState.hr) || null,
    };
    updateContext("VitalsForm", vitalsData);
    setLastSavedAt(new Date());
  };

  const update = (field, val) => {
    const newState = { ...form, [field]: val };
    setForm(newState);
  };

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-sm">
      <header className="flex items-baseline justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Quick vitals
          </h3>
          <p className="text-[11px] text-zinc-400">
            Capture a focused snapshot for this encounter.
          </p>
        </div>
        <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-50">
          Live
        </span>
      </header>

      <div className="grid grid-cols-3 gap-3 text-[11px]">
        <div className="space-y-1">
          <label className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            Temperature
          </label>
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5">
            <input
              type="number"
              value={form.temp}
              onChange={(e) => update("temp", e.target.value)}
              className="w-full bg-transparent text-xs font-medium text-zinc-900 outline-none"
            />
            <span className="text-[10px] text-zinc-400">°F</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            Heart rate
          </label>
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5">
            <input
              type="number"
              value={form.hr}
              onChange={(e) => update("hr", e.target.value)}
              className="w-full bg-transparent text-xs font-medium text-zinc-900 outline-none"
            />
            <span className="text-[10px] text-zinc-400">bpm</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            Blood pressure
          </label>
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5">
            <input
              type="text"
              value={form.bp}
              onChange={(e) => update("bp", e.target.value)}
              className="w-full bg-transparent text-xs font-medium text-zinc-900 outline-none"
            />
            <span className="text-[10px] text-zinc-400">mmHg</span>
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-between pt-1">
        <p className="text-[10px] text-zinc-400">
          Click save to include vitals in clinical scribe.
        </p>
        <div className="flex items-center gap-2">
          {lastSavedAt ? (
            <span className="text-[10px] text-green-700">
              Saved {lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          ) : (
            <span className="text-[10px] text-amber-700">Not saved</span>
          )}
          <button
            type="button"
            onClick={() => reportVitals(form)}
            className="rounded-full bg-zinc-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm hover:bg-zinc-700 transition-colors"
          >
            Save Vitals
          </button>
        </div>
      </footer>
    </section>
  );
}
