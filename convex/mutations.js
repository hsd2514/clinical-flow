import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveConsultation = mutation({
  args: {
    patientId: v.id("patients"),
    date: v.string(),
    chiefComplaint: v.string(),
    diagnosis: v.optional(v.string()),
    notes: v.string(),
    vitals: v.optional(
      v.object({
        temperature: v.optional(v.number()),
        bloodPressure: v.optional(v.string()),
        heartRate: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("consultations", args);
  },
});
