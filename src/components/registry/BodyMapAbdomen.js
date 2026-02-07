import { Crosshair, MapPin, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useClinicalContext } from "../../contexts/ClinicalContext";

const REGIONS = [
  { id: "upper-left", label: "Upper Left", hint: "Spleen, Stomach" },
  { id: "upper-right", label: "Upper Right", hint: "Liver, Gallbladder" },
  { id: "lower-left", label: "Lower Left", hint: "Sigmoid Colon" },
  { id: "lower-right", label: "Lower Right", hint: "Appendix, Cecum" },
];

export default function BodyMapAbdomen({ highlight = null, onSelect }) {
  const [selected, setSelected] = useState(highlight ? [highlight] : []);
  const [hovered, setHovered] = useState(null);
  const { updateContext } = useClinicalContext();

  const toggleRegion = (id) => {
    const newSelected = selected.includes(id)
      ? selected.filter((r) => r !== id)
      : [...selected, id];
    setSelected(newSelected);
    if (onSelect) onSelect(newSelected);
    // Always report to context (works in Tambo mode too)
    updateContext("BodyMapAbdomen", newSelected);
  };

  return (
    <section className="card-clinical p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Crosshair className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Abdominal Map</h3>
            <p className="text-xs text-muted-foreground">
              Tap where the patient points
            </p>
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
            <AlertCircle className="w-3 h-3" />
            <span>
              {selected.length} area{selected.length > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      <div className="grid aspect-square grid-cols-2 gap-2 p-2 bg-muted rounded-xl">
        {REGIONS.map((region) => {
          const isActive = selected.includes(region.id);
          return (
            <button
              key={region.id}
              onClick={() => toggleRegion(region.id)}
              onMouseEnter={() => setHovered(region.id)}
              onMouseLeave={() => setHovered(null)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
                ${
                  isActive
                    ? "border-destructive bg-destructive/20 text-destructive"
                    : "border-border hover:border-accent/50 hover:bg-accent/5 text-muted-foreground"
                }
              `}
            >
              <span className="text-sm font-bold">{region.label}</span>
              {isActive && <MapPin className="w-4 h-4 mt-1" />}
            </button>
          );
        })}
      </div>

      {hovered && (
        <div className="mt-3 p-2 rounded-lg bg-muted text-center animate-fade-in">
          <span className="text-xs text-muted-foreground">
            {REGIONS.find((r) => r.id === hovered)?.hint}
          </span>
        </div>
      )}
    </section>
  );
}
