import { Users, ChevronRight, Activity } from "lucide-react";

export default function PatientSidebar({
  patients,
  activePatientId,
  onSelect,
}) {
  if (!patients || patients.length <= 1) return null;

  return (
    <div className="mt-4">
      <button className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            Switch Patient
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </button>

      <div className="mt-2 space-y-1">
        {patients.map((p) => {
          const isActive = p._id === activePatientId;
          if (isActive) return null; // Don't show current patient in list

          return (
            <button
              key={p._id}
              onClick={() => onSelect(p._id)}
              className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group hover:bg-primary/5 border border-transparent hover:border-primary/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-xs font-bold text-muted-foreground">
                    {p.name.charAt(0)}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {p.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {p.gender?.charAt(0) || "?"} • {p.age}yo
                  </div>
                </div>
              </div>
              <Activity className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
