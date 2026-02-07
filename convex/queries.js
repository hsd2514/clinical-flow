import { query } from "./_generated/server";
import { v } from "convex/values";

async function requireAuth(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return identity;
}

export const getPatients = query({
    handler: async (ctx) => {
        await requireAuth(ctx);
        return await ctx.db.query("patients").collect();
    }
});

export const getHistory = query({
    args: { patientId: v.optional(v.id("patients")) },
    handler: async (ctx, args) => {
        await requireAuth(ctx);
        if (!args.patientId) return [];
        return await ctx.db
            .query("medicalHistory")
            .filter(q => q.eq(q.field("patientId"), args.patientId))
            .collect();
    }
});

export const getConsultations = query({
    args: { patientId: v.optional(v.id("patients")) },
    handler: async (ctx, args) => {
        await requireAuth(ctx);
        let consultations;

        if (args.patientId) {
            consultations = await ctx.db
                .query("consultations")
                .filter((q) => q.eq(q.field("patientId"), args.patientId))
                .collect();
        } else {
            consultations = await ctx.db.query("consultations").collect();
        }

        return consultations.sort((a, b) => {
            const aTime = Date.parse(a.date || "") || 0;
            const bTime = Date.parse(b.date || "") || 0;
            return bTime - aTime;
        });
    },
});
