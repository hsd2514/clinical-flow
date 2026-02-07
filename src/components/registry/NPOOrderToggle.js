import { UtensilsCrossed, Check, Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useClinicalContext } from "../../contexts/ClinicalContext";

export default function NPOOrderToggle({ defaultOn = true, onToggle }) {
  const [isOn, setIsOn] = useState(defaultOn);
  const { updateContext } = useClinicalContext();
  const initialReportRef = useRef(false);

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onToggle) onToggle(newState);
    // Report to context
    updateContext("NPOOrderToggle", { isOn: newState });
  };

  // Report initial state to context (only once)
  useEffect(() => {
    if (!initialReportRef.current) {
      initialReportRef.current = true;
      updateContext("NPOOrderToggle", { isOn: defaultOn });
    }
  }, [defaultOn, updateContext]);

  return (
    <section className="card-clinical p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`
            w-12 h-12 rounded-xl flex items-center justify-center transition-all
            ${
              isOn
                ? "bg-destructive/20 text-destructive"
                : "bg-accent/10 text-accent"
            }
          `}
          >
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">NPO Status</h3>
            <p className="text-xs text-muted-foreground">
              Nothing by mouth before surgery
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className={`
            relative w-16 h-9 rounded-full transition-all duration-300
            ${isOn ? "bg-destructive" : "bg-muted"}
          `}
        >
          <div
            className={`
            absolute top-1 left-1 w-7 h-7 rounded-full bg-white shadow-md transition-all duration-300
            flex items-center justify-center
            ${isOn ? "translate-x-7" : "translate-x-0"}
          `}
          >
            {isOn && (
              <Check className="w-4 h-4 text-destructive" strokeWidth={3} />
            )}
          </div>
        </button>
      </div>

      {isOn && (
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 animate-fade-in">
          <Clock className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive font-medium">
            NPO Order Active - No oral intake
          </span>
        </div>
      )}
    </section>
  );
}
