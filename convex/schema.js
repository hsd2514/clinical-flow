import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Static Patient Data
  patients: defineTable({
    name: v.string(),
    age: v.number(),
    gender: v.optional(v.string()),
    bloodType: v.string(),
    medications: v.array(v.string()), // e.g., ["Warfarin", "Insulin"]
    allergies: v.array(v.string()),   // e.g., ["Penicillin"]
    chronicConditions: v.array(v.string()), // e.g., ["Asthma"]
  }),

  // Medical History Records (Charts/Graphs data)
  medicalHistory: defineTable({
    patientId: v.id("patients"),
    condition: v.string(), // e.g., "asthma", "hypertension", "appendectomy"
    type: v.string(),      // "chart", "heatmap", "list", "text"
    title: v.string(),
    data: v.any(),         // JSON object for chart data or text details
    insight: v.string(),   // AI summary or key takeaway
    date: v.optional(v.string()),      // ISO date string
  }),

  // Consultations / Visits
  consultations: defineTable({
    patientId: v.id("patients"),
    date: v.string(),
    chiefComplaint: v.string(),
    diagnosis: v.optional(v.string()),
    notes: v.optional(v.string()), // The auto-scribed summary
    vitals: v.optional(v.object({
      temperature: v.optional(v.number()),
      bloodPressure: v.optional(v.string()),
      heartRate: v.optional(v.number()),
    })),
  }),
});
