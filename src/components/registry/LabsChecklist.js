import { FlaskConical, Check, Square, Clock } from "lucide-react";
import { useState, useRef } from "react";
import { useClinicalContext } from "../../contexts/ClinicalContext";

export default function LabsChecklist({ items = [], onChange }) {
  const list = items.length
    ? items
    : ["WBC count", "CRP", "Electrolytes", "Lactate"];

  const [checked, setChecked] = useState({});
  const { updateContext } = useClinicalContext();

  // Use ref to store callback to avoid dependency loops
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const toggle = (item) => {
    const newChecked = { ...checked, [item]: !checked[item] };
    setChecked(newChecked);
    const selectedLabs = Object.keys(newChecked).filter(
      (key) => newChecked[key],
    );
    if (onChangeRef.current) onChangeRef.current(selectedLabs);
    updateContext("LabsChecklist", selectedLabs);
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;
  return (
    <section className="card-clinical p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Order Labs</h3>
            <p className="text-xs text-muted-foreground">
              Minimal workup for suspected appendicitis
            </p>
          </div>
        </div>

        {checkedCount > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
            <Clock className="w-3 h-3" />
            <span>
              {checkedCount}/{list.length}
            </span>
          </div>
        )}
      </div>

      <ul className="space-y-2">
        {list.map((label, index) => (
          <li key={label}>
            <button
              onClick={() => toggle(label)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                ${
                  checked[label]
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/30 hover:bg-accent/5"
                }
              `}
            >
              <div
                className={`
                w-5 h-5 rounded-md flex items-center justify-center transition-all
                ${
                  checked[label]
                    ? "bg-accent text-accent-foreground"
                    : "border-2 border-muted-foreground/30"
                }
              `}
              >
                {checked[label] && (
                  <Check className="w-3 h-3" strokeWidth={3} />
                )}
              </div>
              <span
                className={`text-sm font-medium ${checked[label] ? "text-accent" : "text-foreground"}`}
              >
                {label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
