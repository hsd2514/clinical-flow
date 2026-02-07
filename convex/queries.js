import { query } from "./_generated/server";
import { v } from "convex/values";

export const getPatients = query({
    handler: async (ctx) => {
        return await ctx.db.query("patients").collect();
    }
});

export const getHistory = query({
    args: { patientId: v.optional(v.id("patients")) },
    handler: async (ctx, args) => {
        if (!args.patientId) return [];
        return await ctx.db
            .query("medicalHistory")
            .filter(q => q.eq(q.field("patientId"), args.patientId))
            .collect();
    }
});
