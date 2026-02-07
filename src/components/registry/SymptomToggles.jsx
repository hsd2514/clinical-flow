import { useState, useRef } from "react";
import { Check, Stethoscope } from "lucide-react";
import { useClinicalContext } from "../../contexts/ClinicalContext";

// Default GI/abdominal symptoms
const DEFAULT_SYMPTOMS = [
  "Nausea",
  "Vomiting",
  "Fever",
  "Diarrhea",
  "Constipation",
  "Loss of Appetite",
];

export default function SymptomToggles({ symptoms, active, onChange }) {
  // Use provided symptoms or defaults
  const displaySymptoms =
    symptoms && symptoms.length > 0 ? symptoms : DEFAULT_SYMPTOMS;

  // Use ref to track if we've initialized from props (prevents infinite loop)
  const initializedRef = useRef(false);
  const initialActive =
    !initializedRef.current && active?.length > 0 ? active : [];
  if (!initializedRef.current) initializedRef.current = true;

  const [selected, setSelected] = useState(initialActive);
  const { updateContext } = useClinicalContext();

  const toggle = (symptom) => {
    const newDoc = selected.includes(symptom)
      ? selected.filter((s) => s !== symptom)
      : [...selected, symptom];

    setSelected(newDoc);

    // Report to onChange prop if available (rule-based mode)
    if (onChange) onChange(newDoc);

    // Always report to context (works in Tambo mode too)
    updateContext("SymptomToggles", newDoc);
  };

  return (
    <div className="card-clinical p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Presenting Symptoms
            </h3>
            <p className="text-xs text-muted-foreground">
              Select all that apply
            </p>
          </div>
        </div>

        {selected.length > 0 && (
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {selected.length} selected
          </span>
        )}
      </div>

      {/* Symptom Grid */}
      <div className="grid grid-cols-2 gap-3">
        {displaySymptoms.map((s, index) => {
          const isActive = selected.includes(s);
          return (
            <button
              key={s}
              onClick={() => toggle(s)}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200 flex justify-between items-center group
                ${
                  isActive
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                    : "border-border hover:border-primary/30 hover:bg-primary/5"
                }
              `}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <span
                className={`font-medium text-sm ${isActive ? "text-primary" : "text-foreground"}`}
              >
                {s}
              </span>
              <div
                className={`
                w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200
                ${
                  isActive
                    ? "bg-primary text-primary-foreground scale-110"
                    : "bg-muted text-transparent group-hover:bg-primary/20"
                }
              `}
              >
                <Check className="w-4 h-4" strokeWidth={3} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary */}
      {selected.length > 0 && (
        <div className="mt-4 p-3 bg-muted/50 rounded-xl">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">Selected:</span>{" "}
            {selected.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
