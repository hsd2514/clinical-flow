import { useState, useRef } from "react";
import { FlaskConical, Plus, X, CheckCircle, Clock } from "lucide-react";
import { useClinicalContext } from "../../contexts/ClinicalContext";

export default function LabsOrder({ recommended, onChange }) {
  const [selected, setSelected] = useState(recommended || []);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newLab, setNewLab] = useState("");
  const { updateContext } = useClinicalContext();

  // Use ref to store callbacks to avoid dependency loops
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Helper to update state and report to both onChange and context
  const updateSelected = (newSelected) => {
    setSelected(newSelected);
    if (onChangeRef.current) onChangeRef.current(newSelected);
    updateContext("LabsOrder", newSelected);
  };

  const toggle = (lab) => {
    const newSelected = selected.includes(lab)
      ? selected.filter((p) => p !== lab)
      : [...selected, lab];
    updateSelected(newSelected);
  };

  const addLab = () => {
    if (newLab.trim() && !selected.includes(newLab.trim())) {
      updateSelected([...selected, newLab.trim()]);
      setNewLab("");
      setShowAddInput(false);
    }
  };

  return (
    <div className="card-clinical p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Laboratory Orders</h3>
            <p className="text-xs text-muted-foreground">
              AI-recommended tests
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
          <Clock className="w-3 h-3" />
          <span>Pending</span>
        </div>
      </div>

      {/* Selected Labs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {selected.map((lab) => (
          <button
            key={lab}
            onClick={() => toggle(lab)}
            className="group px-4 py-2 bg-accent/10 text-accent border border-accent/20 rounded-xl text-sm font-semibold hover:bg-accent/20 transition-all flex items-center gap-2"
          >
            <span>{lab}</span>
            <X className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}

        {/* Add Lab Button/Input */}
        {showAddInput ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newLab}
              onChange={(e) => setNewLab(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLab()}
              placeholder="Lab name..."
              className="input-clinical text-sm py-2"
              autoFocus
            />
            <button
              onClick={addLab}
              className="p-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddInput(true)}
            className="px-4 py-2 bg-muted text-muted-foreground border border-border rounded-xl text-sm font-semibold hover:bg-muted/80 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lab</span>
          </button>
        )}
      </div>

      {/* Order Button */}
      <button
        disabled={selected.length === 0}
        className={`
                    w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2
                    ${
                      selected.length > 0
                        ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20 hover:opacity-90 active:scale-[0.98]"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }
                `}
      >
        <CheckCircle className="w-4 h-4" />
        Sign & Order ({selected.length}{" "}
        {selected.length === 1 ? "test" : "tests"})
      </button>
    </div>
  );
}
