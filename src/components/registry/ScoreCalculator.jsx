import { useState, useRef } from "react";
import {
  Calculator,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useClinicalContext } from "../../contexts/ClinicalContext";

export default function ScoreCalculator({ title, inputs, onChange }) {
  const [checked, setChecked] = useState({});
  const { updateContext } = useClinicalContext();

  // Use ref to store callback to avoid dependency loops
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const score =
    inputs?.reduce(
      (acc, curr) => acc + (checked[curr.id] ? curr.points : 0),
      0,
    ) || 0;
  const maxScore = inputs?.reduce((acc, curr) => acc + curr.points, 0) || 0;

  const toggle = (id) => {
    const newChecked = { ...checked, [id]: !checked[id] };
    setChecked(newChecked);

    // Calculate new score
    const newScore =
      inputs?.reduce(
        (acc, curr) => acc + (newChecked[curr.id] ? curr.points : 0),
        0,
      ) || 0;

    const scoreData = {
      score: newScore,
      maxScore,
      items: Object.keys(newChecked).filter((k) => newChecked[k]),
      title: title || "Alvarado Score",
    };
    if (onChangeRef.current) onChangeRef.current(scoreData);
    updateContext("ScoreCalculator", scoreData);
  };

  const getRiskLevel = (s) => {
    if (s < 4)
      return {
        label: "Low Risk",
        color: "text-green-500",
        bg: "bg-green-500",
        icon: CheckCircle,
      };
    if (s < 7)
      return {
        label: "Moderate Risk",
        color: "text-amber-500",
        bg: "bg-amber-500",
        icon: AlertCircle,
      };
    return {
      label: "High Risk",
      color: "text-destructive",
      bg: "bg-destructive",
      icon: AlertTriangle,
    };
  };

  const risk = getRiskLevel(score);
  const RiskIcon = risk.icon;
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return (
    <div className="card-clinical overflow-hidden">
      {/* Header with Score Display */}
      <div className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {title || "Alvarado Score"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Appendicitis probability
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span
                className={`text-4xl font-bold font-mono ${risk.color} transition-colors duration-500`}
              >
                {score}
              </span>
              <span className="text-lg text-muted-foreground font-medium">
                /{maxScore}
              </span>
            </div>
            <div
              className={`flex items-center gap-1.5 justify-end mt-1 ${risk.color}`}
            >
              <RiskIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{risk.label}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${risk.bg} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Criteria List */}
      <div className="p-4 space-y-2">
        {inputs?.map((item, index) => {
          const isChecked = checked[item.id];
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`
                w-full flex justify-between items-center p-4 rounded-xl border-2 transition-all duration-200
                ${
                  isChecked
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-card border-border hover:border-primary/30 hover:bg-primary/5"
                }
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                  w-6 h-6 rounded-lg flex items-center justify-center transition-all
                  ${isChecked ? "bg-primary-foreground/20" : "bg-muted"}
                `}
                >
                  {isChecked && <CheckCircle className="w-4 h-4" />}
                </div>
                <span
                  className={`font-medium text-sm ${isChecked ? "" : "text-foreground"}`}
                >
                  {item.label}
                </span>
              </div>
              <span
                className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${isChecked ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"}
              `}
              >
                +{item.points}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
