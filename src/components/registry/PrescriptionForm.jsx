import { useState } from "react";
import {
  Pill,
  Plus,
  Trash2,
  FileText,
  Download,
  Send,
  AlertTriangle,
  Check,
} from "lucide-react";

const COMMON_MEDICATIONS = [
  {
    name: "Acetaminophen",
    dosage: "500mg",
    frequency: "Every 6 hours as needed",
  },
  { name: "Ibuprofen", dosage: "400mg", frequency: "Every 8 hours with food" },
  { name: "Amoxicillin", dosage: "500mg", frequency: "Three times daily" },
  {
    name: "Omeprazole",
    dosage: "20mg",
    frequency: "Once daily before breakfast",
  },
  { name: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
  { name: "Metformin", dosage: "500mg", frequency: "Twice daily with meals" },
  { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily at bedtime" },
  {
    name: "Albuterol Inhaler",
    dosage: "2 puffs",
    frequency: "Every 4-6 hours as needed",
  },
];

export default function PrescriptionForm({
  patientName,
  diagnoses = [],
  onSubmit,
  onChange,
}) {
  const [medications, setMedications] = useState([]);
  const [customMed, setCustomMed] = useState({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    notes: "",
  });
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [pharmacyNotes, setPharmacyNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const addMedication = (med) => {
    const newMed = {
      id: Date.now(),
      ...med,
      duration: med.duration || "7 days",
      notes: med.notes || "",
    };
    const updated = [...medications, newMed];
    setMedications(updated);
    if (onChange) onChange(updated);
    setShowQuickAdd(false);
    setCustomMed({
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      notes: "",
    });
  };

  const removeMedication = (id) => {
    const updated = medications.filter((m) => m.id !== id);
    setMedications(updated);
    if (onChange) onChange(updated);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (onSubmit) {
      onSubmit({
        medications,
        pharmacyNotes,
        patientName,
        diagnoses,
        prescribedAt: new Date().toISOString(),
      });
    }
  };

  if (submitted) {
    return (
      <div className="card-clinical p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Prescription Sent
        </h3>
        <p className="text-muted-foreground text-sm mb-6">
          {medications.length} medication(s) prescribed for{" "}
          {patientName || "patient"}
        </p>
        <div className="flex justify-center gap-3">
          <button className="btn-clinical btn-ghost gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={() => setSubmitted(false)}
            className="btn-clinical btn-primary gap-2"
          >
            <FileText className="w-4 h-4" />
            Edit Prescription
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-clinical p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg">
              E-Prescription
            </h3>
            <p className="text-sm text-muted-foreground">
              {patientName ? `For ${patientName}` : "Create prescription"}
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
          {medications.length} medication(s)
        </span>
      </div>

      {/* Diagnoses */}
      {diagnoses.length > 0 && (
        <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl">
          <p className="text-xs text-muted-foreground mb-1">Diagnoses</p>
          <p className="text-sm font-medium text-foreground">
            {diagnoses.join(", ")}
          </p>
        </div>
      )}

      {/* Medications List */}
      <div className="space-y-3">
        {medications.map((med) => (
          <div
            key={med.id}
            className="flex items-start justify-between p-4 bg-card border border-border rounded-xl group hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Pill className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{med.name}</p>
                <p className="text-sm text-muted-foreground">
                  {med.dosage} • {med.frequency}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Duration: {med.duration}
                </p>
                {med.notes && (
                  <p className="text-xs text-accent mt-1 italic">{med.notes}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => removeMedication(med.id)}
              className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {medications.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Pill className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No medications added yet</p>
          </div>
        )}
      </div>

      {/* Quick Add */}
      {showQuickAdd ? (
        <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-4">
          <p className="text-sm font-medium text-foreground">
            Quick Add Common Medications
          </p>
          <div className="grid grid-cols-2 gap-2">
            {COMMON_MEDICATIONS.map((med, i) => (
              <button
                key={i}
                onClick={() => addMedication(med)}
                className="p-3 text-left bg-card border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-sm"
              >
                <p className="font-medium text-foreground">{med.name}</p>
                <p className="text-xs text-muted-foreground">{med.dosage}</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowQuickAdd(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Custom Medication Form */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Medication name"
              value={customMed.name}
              onChange={(e) =>
                setCustomMed({ ...customMed, name: e.target.value })
              }
              className="col-span-2 p-3 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <input
              type="text"
              placeholder="Dosage (e.g., 500mg)"
              value={customMed.dosage}
              onChange={(e) =>
                setCustomMed({ ...customMed, dosage: e.target.value })
              }
              className="p-3 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <input
              type="text"
              placeholder="Duration (e.g., 7 days)"
              value={customMed.duration}
              onChange={(e) =>
                setCustomMed({ ...customMed, duration: e.target.value })
              }
              className="p-3 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <input
              type="text"
              placeholder="Frequency (e.g., Twice daily)"
              value={customMed.frequency}
              onChange={(e) =>
                setCustomMed({ ...customMed, frequency: e.target.value })
              }
              className="col-span-2 p-3 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <input
              type="text"
              placeholder="Special instructions (optional)"
              value={customMed.notes}
              onChange={(e) =>
                setCustomMed({ ...customMed, notes: e.target.value })
              }
              className="col-span-2 p-3 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() =>
                customMed.name && customMed.dosage && addMedication(customMed)
              }
              disabled={!customMed.name || !customMed.dosage}
              className="flex-1 btn-clinical btn-primary gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Medication
            </button>
            <button
              onClick={() => setShowQuickAdd(true)}
              className="btn-clinical btn-ghost"
            >
              Quick Add
            </button>
          </div>
        </div>
      )}

      {/* Pharmacy Notes */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          Notes for Pharmacy
        </label>
        <textarea
          placeholder="Any special instructions for the pharmacist..."
          value={pharmacyNotes}
          onChange={(e) => setPharmacyNotes(e.target.value)}
          rows={2}
          className="w-full p-3 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
        />
      </div>

      {/* Warning for interactions */}
      {medications.length >= 3 && (
        <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-600">
              Drug Interaction Check
            </p>
            <p className="text-xs text-muted-foreground">
              Multiple medications prescribed. Consider reviewing for potential
              interactions.
            </p>
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={medications.length === 0}
          className="flex-1 btn-clinical btn-primary gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          Send to Pharmacy
        </button>
        <button className="btn-clinical btn-ghost gap-2">
          <Download className="w-4 h-4" />
          Save Draft
        </button>
      </div>
    </div>
  );
}
