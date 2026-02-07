import { Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function TimeMachineSlider({ years = [], currentYear }) {
  const sorted =
    years && years.length
      ? [...years].sort()
      : [2021, 2023, currentYear ?? 2025];
  const [selectedIndex, setSelectedIndex] = useState(sorted.length - 1);

  const percentage = (selectedIndex / (sorted.length - 1)) * 100;

  return (
    <section className="card-clinical p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              History Time Machine
            </h3>
            <p className="text-xs text-muted-foreground">
              Compare current visit with prior years
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-bold font-mono">
            {sorted[selectedIndex]}
          </span>
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="relative">
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary/50 to-primary transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Year markers */}
        <div className="flex justify-between mt-3">
          {sorted.map((year, index) => (
            <button
              key={year}
              onClick={() => setSelectedIndex(index)}
              className={`
                flex flex-col items-center gap-1 transition-all
                ${index === selectedIndex ? "scale-110" : "opacity-60 hover:opacity-100"}
              `}
            >
              <div
                className={`
                w-3 h-3 rounded-full transition-all
                ${
                  index === selectedIndex
                    ? "bg-primary ring-4 ring-primary/20"
                    : "bg-muted-foreground/30"
                }
              `}
              />
              <span
                className={`
                text-xs font-medium
                ${index === selectedIndex ? "text-primary font-bold" : "text-muted-foreground"}
              `}
              >
                {year}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
          disabled={selectedIndex === 0}
          className="btn-clinical btn-ghost p-2 disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() =>
            setSelectedIndex(Math.min(sorted.length - 1, selectedIndex + 1))
          }
          disabled={selectedIndex === sorted.length - 1}
          className="btn-clinical btn-ghost p-2 disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
