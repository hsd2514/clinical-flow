import { useState } from "react";
import { Target, MapPin } from "lucide-react";

export default function BodyMap({
  instruction,
  selected: initialSelected,
  onChange,
}) {
  const [selected, setSelected] = useState(initialSelected || null);
  const [hovering, setHovering] = useState(null);

  const handleSelect = (part) => {
    const newVal = selected === part ? null : part;
    setSelected(newVal);
    if (onChange) onChange(newVal);
  };

  const regions = [
    {
      id: "upper-left",
      label: "RUQ",
      cx: 70,
      cy: 140,
      description: "Right Upper Quadrant",
    },
    {
      id: "upper-right",
      label: "LUQ",
      cx: 130,
      cy: 140,
      description: "Left Upper Quadrant",
    },
    {
      id: "lower-left",
      label: "RLQ",
      cx: 70,
      cy: 220,
      description: "Right Lower Quadrant",
    },
    {
      id: "lower-right",
      label: "LLQ",
      cx: 130,
      cy: 220,
      description: "Left Lower Quadrant",
    },
  ];

  const Quadrant = ({ id, cx, cy, label, description }) => {
    const isSelected = selected === id;
    const isHovering = hovering === id;

    return (
      <g
        onClick={() => handleSelect(id)}
        onMouseEnter={() => setHovering(id)}
        onMouseLeave={() => setHovering(null)}
        className="cursor-pointer"
        style={{ transition: "all 0.3s ease" }}
      >
        {/* Outer glow ring */}
        {isSelected && (
          <circle
            cx={cx}
            cy={cy}
            r="48"
            className="fill-none stroke-destructive/30 animate-pulse"
            strokeWidth="4"
          />
        )}

        {/* Main circle */}
        <circle
          cx={cx}
          cy={cy}
          r="38"
          className={`
            transition-all duration-300
            ${
              isSelected
                ? "fill-destructive stroke-destructive shadow-lg"
                : isHovering
                  ? "fill-primary/20 stroke-primary"
                  : "fill-muted stroke-border"
            }
          `}
          strokeWidth={isSelected ? "3" : "2"}
        />

        {/* Label */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dy=".3em"
          className={`
            text-xs font-bold uppercase pointer-events-none
            ${isSelected ? "fill-white" : isHovering ? "fill-primary" : "fill-muted-foreground"}
          `}
        >
          {label}
        </text>
      </g>
    );
  };

  const selectedRegion = regions.find((r) => r.id === selected);
  const hoveringRegion = regions.find((r) => r.id === hovering);

  return (
    <div className="card-clinical p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            {instruction || "Localize Pain"}
          </h3>
          <p className="text-xs text-muted-foreground">
            Tap to select abdominal quadrant
          </p>
        </div>
      </div>

      {/* Body Map Canvas */}
      <div className="relative bg-muted/30 rounded-2xl border-2 border-dashed border-border overflow-hidden">
        <svg viewBox="0 0 200 320" className="w-full h-auto max-h-80">
          {/* Body outline */}
          <path
            d="M 60,60 Q 20,80 20,180 Q 20,280 70,320 L 130,320 Q 180,280 180,180 Q 180,80 140,60 Q 100,40 60,60"
            fill="none"
            className="stroke-border"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Center line */}
          <line
            x1="100"
            y1="80"
            x2="100"
            y2="280"
            className="stroke-border/50"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Horizontal line */}
          <line
            x1="40"
            y1="180"
            x2="160"
            y2="180"
            className="stroke-border/50"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Quadrants */}
          {regions.map((region) => (
            <Quadrant key={region.id} {...region} />
          ))}

          {/* Umbilicus marker */}
          <circle cx="100" cy="180" r="4" className="fill-border" />
        </svg>

        {/* Hover tooltip */}
        {hoveringRegion && !selected && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-foreground text-background rounded-lg text-xs font-medium shadow-lg animate-fade-in-scale">
            {hoveringRegion.description}
          </div>
        )}
      </div>

      {/* Selection indicator */}
      {selectedRegion && (
        <div className="mt-4 flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-xl animate-fade-in-up">
          <MapPin className="w-5 h-5 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">
              Selected: {selectedRegion.description}
            </p>
            <p className="text-xs text-destructive/70">
              Click again to deselect
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
