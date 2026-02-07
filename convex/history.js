import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

// Internal query used by generateUI to fetch a relevant history item.
export const getByCondition = internalQuery({
  args: {
    patientId: v.id("patients"),
    condition: v.string(),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("medicalHistory")
      .filter((q) =>
        q.and(
          q.eq(q.field("patientId"), args.patientId),
          q.eq(q.field("condition"), args.condition),
        ),
      )
      .collect();

    const item = items[0];
    if (!item) return null;

    // Shape props to match the LineChart component.
    return {
      title: item.title,
      data: item.data,
      insight: item.insight,
    };
  },
});

