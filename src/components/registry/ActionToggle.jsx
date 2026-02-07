import { useState } from "react";
import { AlertOctagon, Shield, CheckCircle } from "lucide-react";

export default function ActionToggle({
  label,
  isCritical,
  defaultChecked,
  onChange,
  description,
}) {
  const [checked, setChecked] = useState(defaultChecked || false);

  const toggle = () => {
    const newVal = !checked;
    setChecked(newVal);
    if (onChange) onChange(newVal);
  };

  const getStyles = () => {
    if (!checked) {
      return {
        container: "bg-card border-border",
        icon: "bg-muted text-muted-foreground",
        text: "text-foreground",
        toggle: "bg-muted",
      };
    }
    if (isCritical) {
      return {
        container:
          "bg-destructive/10 border-destructive/30 shadow-lg shadow-destructive/10",
        icon: "bg-destructive text-destructive-foreground",
        text: "text-destructive",
        toggle: "bg-destructive",
      };
    }
    return {
      container:
        "bg-green-500/10 border-green-500/30 shadow-lg shadow-green-500/10",
      icon: "bg-green-500 text-white",
      text: "text-green-600",
      toggle: "bg-green-500",
    };
  };

  const styles = getStyles();
  const Icon = isCritical ? AlertOctagon : checked ? CheckCircle : Shield;

  return (
    <div
      className={`
      card-clinical p-5 border-2 transition-all duration-300
      ${styles.container}
    `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`
            w-12 h-12 rounded-xl flex items-center justify-center transition-all
            ${styles.icon}
            ${isCritical && checked ? "animate-pulse" : ""}
          `}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`font-semibold ${styles.text}`}>{label}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
            {checked && isCritical && (
              <p className="text-xs text-destructive font-semibold mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                Active - Strict Protocol
              </p>
            )}
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={toggle}
          className={`
            relative w-14 h-8 rounded-full transition-all duration-300
            ${styles.toggle}
          `}
        >
          <div
            className={`
            absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300
            ${checked ? "translate-x-7" : "translate-x-1"}
          `}
          />
        </button>
      </div>
    </div>
  );
}
