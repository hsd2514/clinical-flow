import { useState, useEffect } from "react";
import { Frown, Meh, Smile, AlertTriangle } from "lucide-react";

export default function PainSlider({
  label,
  defaultValue,
  initialValue,
  onChange,
}) {
  // Support both defaultValue and initialValue props
  const [value, setValue] = useState(initialValue ?? defaultValue ?? 0);

  // Update if props change
  useEffect(() => {
    const newVal = initialValue ?? defaultValue ?? 0;
    if (typeof newVal === "number") {
      setValue(newVal);
    }
  }, [initialValue, defaultValue]);

  const handleChange = (e) => {
    const newVal = parseInt(e.target.value);
    setValue(newVal);
    if (onChange) onChange(newVal);
  };

  const getPainLevel = (val) => {
    if (val === 0)
      return {
        label: "No Pain",
        color: "text-green-500",
        bg: "bg-green-500",
        emoji: "😊",
        icon: Smile,
      };
    if (val <= 3)
      return {
        label: "Mild",
        color: "text-green-500",
        bg: "bg-green-500",
        emoji: "🙂",
        icon: Smile,
      };
    if (val <= 6)
      return {
        label: "Moderate",
        color: "text-amber-500",
        bg: "bg-amber-500",
        emoji: "😐",
        icon: Meh,
      };
    if (val <= 8)
      return {
        label: "Severe",
        color: "text-orange-500",
        bg: "bg-orange-500",
        emoji: "😣",
        icon: Frown,
      };
    return {
      label: "Worst Possible",
      color: "text-destructive",
      bg: "bg-destructive",
      emoji: "😫",
      icon: AlertTriangle,
    };
  };

  const pain = getPainLevel(value);
  const PainIcon = pain.icon;

  // Generate gradient stops for visual indicator
  const gradientStyle = {
    background: `linear-gradient(90deg, 
      rgb(34, 197, 94) 0%, 
      rgb(234, 179, 8) 40%, 
      rgb(249, 115, 22) 70%, 
      rgb(239, 68, 68) 100%
    )`,
  };

  return (
    <div className="card-clinical p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl ${pain.bg}/10 flex items-center justify-center transition-colors duration-300`}
          >
            <span className="text-2xl">{pain.emoji}</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {label || "Pain Level"}
            </h3>
            <p
              className={`text-sm font-medium ${pain.color} transition-colors duration-300`}
            >
              {pain.label}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`text-5xl font-bold font-mono ${pain.color} transition-colors duration-300`}
          >
            {value}
          </span>
          <span className="text-lg text-muted-foreground">/10</span>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative py-4">
        {/* Track Background */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-3 rounded-full opacity-30"
          style={gradientStyle}
        />

        {/* Active Track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 h-3 rounded-full transition-all duration-200"
          style={{
            ...gradientStyle,
            width: `${value * 10}%`,
          }}
        />

        {/* Slider Input */}
        <input
          type="range"
          min="0"
          max="10"
          value={value}
          onChange={handleChange}
          className="relative w-full h-3 appearance-none bg-transparent cursor-pointer z-10
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-6
            [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-4
            [&::-webkit-slider-thumb]:border-foreground
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-6
            [&::-moz-range-thumb]:h-6
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-4
            [&::-moz-range-thumb]:border-foreground
            [&::-moz-range-thumb]:shadow-lg
            [&::-moz-range-thumb]:cursor-grab
          "
        />
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between text-xs text-muted-foreground font-medium mt-2 px-1">
        <span className="flex items-center gap-1">
          <Smile className="w-3 h-3" /> No Pain
        </span>
        <span>Moderate</span>
        <span className="flex items-center gap-1">
          Worst <Frown className="w-3 h-3" />
        </span>
      </div>

      {/* Warning for high pain */}
      {value >= 8 && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl animate-fade-in-up">
          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-xs text-destructive font-medium">
            Severe pain detected. Consider immediate intervention.
          </p>
        </div>
      )}
    </div>
  );
}
