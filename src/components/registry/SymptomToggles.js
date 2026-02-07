"use client";
import { useState, useRef } from "react";
import { useClinicalContext } from "../../contexts/ClinicalContext";

const SYMPTOMS = [
  { id: "nausea", label: "Nausea" },
  { id: "vomiting", label: "Vomiting" },
  { id: "fever", label: "Fever" },
];

export default function SymptomToggles({ active = [] }) {
  // Use ref to track if we've initialized from props
  const initializedRef = useRef(false);
  const initialActive =
    !initializedRef.current && active?.length > 0 ? active : [];
  if (!initializedRef.current) initializedRef.current = true;

  const [selected, setSelected] = useState(initialActive);
  const { updateContext } = useClinicalContext();

  const toggle = (id) => {
    const newSelected = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    setSelected(newSelected);
    // Report to context (maps ids to labels for scribe)
    updateContext(
      "SymptomToggles",
      newSelected.map((s) => SYMPTOMS.find((sym) => sym.id === s)?.label || s),
    );
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-sm">
      <header>
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Associated symptoms
        </h3>
        <p className="text-[11px] text-zinc-500">
          Quick-tap correlates that strongly change your differential.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {SYMPTOMS.map((s) => {
          const isOn = selected.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                isOn
                  ? "bg-emerald-600 text-emerald-50"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-[10px] text-zinc-400">
          Selected:{" "}
          {selected
            .map((s) => SYMPTOMS.find((sym) => sym.id === s)?.label || s)
            .join(", ")}
        </p>
      )}
    </section>
  );
}
