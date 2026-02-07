# AGENTS.md

Project guidelines for AI assistants.


<!-- tambo-docs-v1.0 -->
## Tambo AI Framework

This project uses **Tambo AI** for building AI assistants with generative UI and MCP support.

**Documentation**: https://docs.tambo.co/llms.txt

### CLI Commands (Non-Interactive)

The Tambo CLI auto-detects non-interactive environments. Use these commands:

```bash
# Initialize (requires API key from https://console.tambo.co)
npx tambo init --api-key=sk_...

# Add components
npx tambo add <component> --yes

# List available components
npx tambo list --yes

# Create new app
npx tambo create-app <name> --template=standard

# Get help
npx tambo --help
npx tambo <command> --help
```

**Exit codes**: 0=success, 1=error, 2=requires flags (check stderr for exact command)


--------------------------------
# 🏥 ClinicalFlow: The Self-Building EHR

**Tagline:** A Generative UI for Medical Records that adapts in real-time.  
**Stack:** Next.js (App Router), Convex (BaaS), TailwindCSS, Lucide React (Icons).

> Save this file as `agent.md` in the project root. Then in any AI coding tool (Cursor, Windsurf, ChatGPT), say: **“Read `agent.md` and implement the project step-by-step.”**

---

## 0. Official Docs (use these when implementing)

- Next.js App Router: `https://nextjs.org/docs/app`
- Create Next App: `https://nextjs.org/docs/app/api-reference/create-next-app`
- Convex Docs: `https://docs.convex.dev/`
- Convex + Next.js: `https://docs.convex.dev/quickstart/nextjs`
- Tailwind CSS Docs: `https://tailwindcss.com/docs`
- Lucide React: `https://lucide.dev/guide/packages/lucide-react`
- shadcn/ui: `https://ui.shadcn.com/`

---

## 1. Project Overview

ClinicalFlow solves the "Click Fatigue" problem in healthcare. Instead of static forms, the UI is generated dynamically based on the doctor's input.

- **Zone A (Input):** Doctor types/speaks.
- **Zone B (History):** AI fetches *only* relevant past data (charts/graphs).
- **Zone C (Active):** AI generates *only* the needed forms/tools for the current exam.

---

## 2. Tech Stack & Setup

- **Frontend:** Next.js 14+ (App Router), JavaScript (No TS for speed), Tailwind CSS.
- **Backend:** Convex (Backend-as-a-Service). Handles DB, Realtime subscriptions, and Logic.
- **UI Library:** shadcn/ui (optional) or raw Tailwind components.

### Initialization Commands

```bash
npx create-next-app@latest clinical-flow --tailwind --eslint --no-ts --src-dir
cd clinical-flow
npm install convex lucide-react clsx tailwind-merge
npx convex dev
```

---

## 3. Database Schema (`convex/schema.js`)

We need a simple schema to store patient data and history.

```javascript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Static Patient Data
  patients: defineTable({
    name: v.string(),
    age: v.number(),
    bloodType: v.string(),
    medications: v.array(v.string()), // e.g., ["Warfarin", "Insulin"]
    allergies: v.array(v.string()),   // e.g., ["Penicillin"]
    chronicConditions: v.array(v.string()), // e.g., ["Asthma"]
  }),

  // Medical History Records (Charts/Graphs data)
  medicalHistory: defineTable({
    patientId: v.id("patients"),
    condition: v.string(), // e.g., "asthma", "hypertension"
    type: v.string(),      // "chart", "heatmap", "list"
    title: v.string(),
    data: v.any(),         // JSON object for chart data
    insight: v.string(),   // AI summary
  }),
});
```

---

## 4. Backend Logic (`convex/actions.js`)

This is the "Brain". It replaces the Python backend. It receives text and decides what UI to show.

```javascript
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const generateUI = action({
  args: {
    patientId: v.id("patients"),
    input: v.string()
  },
  handler: async (ctx, args) => {
    const text = args.input.toLowerCase();
    const uiPlan = [];

    // 1. Fetch Patient Data
    const patient = await ctx.runQuery(internal.patients.get, { id: args.patientId });

    // --- LOGIC: SAFETY CHECKS ---
    if (text.includes("aspirin") && patient.medications.includes("Warfarin")) {
      uiPlan.push({
        zone: "active",
        type: "AlertCard",
        props: {
          level: "critical",
          title: "DRUG INTERACTION",
          message: "Stop! Patient is on Warfarin. Aspirin risk."
        }
      });
    }

    // --- LOGIC: HISTORY RETRIEVAL ---
    if (text.includes("asthma") || text.includes("breathing")) {
      // In real app, query DB. Here, we mock the response or fetch specific history.
      const historyItem = await ctx.runQuery(internal.history.getByCondition, {
        patientId: args.patientId,
        condition: "asthma"
      });

      if (historyItem) {
        uiPlan.push({
          zone: "history",
          type: "LineChart",
          props: historyItem
        });
      }
    }

    // --- LOGIC: ACTIVE TOOLS ---
    if (text.includes("fever") || text.includes("check vitals")) {
      uiPlan.push({
        zone: "active",
        type: "VitalsForm",
        props: { defaultTemp: 98.6 }
      });
    }

    return uiPlan;
  },
});
```

---

## 5. Component Registry (`components/registry/`)

These are the "Lego Blocks" the AI can summon.

### File: `components/registry/AlertCard.jsx`

```jsx
import { AlertTriangle } from "lucide-react";

export default function AlertCard({ level, title, message }) {
  const color =
    level === "critical"
      ? "bg-red-100 border-red-500 text-red-700"
      : "bg-yellow-100 border-yellow-500 text-yellow-700";

  return (
    <div className={`p-4 border-l-4 rounded shadow-sm flex gap-3 ${color}`}>
      <AlertTriangle />
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
```

### File: `components/registry/LineChart.jsx`

*(Use Recharts or just CSS bars for hackathon speed)*

```jsx
export default function LineChart({ title, data, insight }) {
  return (
    <div className="p-4 bg-white border rounded shadow-sm">
      <h3 className="text-gray-500 text-xs font-bold uppercase">{title}</h3>
      <div className="h-32 flex items-end gap-2 mt-4">
        {data.values.map((val, i) => (
          <div
            key={i}
            style={{ height: `${val}%` }}
            className="w-8 bg-blue-500 rounded-t opacity-80 hover:opacity-100"
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-blue-600 font-medium">💡 {insight}</p>
    </div>
  );
}
```

---

## 6. Main Page Layout (`app/page.jsx`)

The canvas that renders the UI plan.

> Note: Convex `patientId` must be a real `Id<"patients">` from your seeded data. Replace the demo `"mock_id_123"` with a real id (or query the first patient).

```jsx
"use client";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

// Registry Import
import AlertCard from "@/components/registry/AlertCard";
import LineChart from "@/components/registry/LineChart";
import VitalsForm from "@/components/registry/VitalsForm";

const COMPONENT_MAP = { AlertCard, LineChart, VitalsForm };

export default function Dashboard() {
  const [input, setInput] = useState("");
  const [uiComponents, setUiComponents] = useState([]);
  const generate = useAction(api.actions.generateUI);

  const handleSend = async () => {
    // Hardcoded Patient ID for Demo
    const plan = await generate({ patientId: "mock_id_123", input });
    setUiComponents(plan);
  };

  return (
    <div className="grid grid-cols-12 h-screen bg-gray-50 font-sans">
      {/* ZONE B: HISTORY (Left) */}
      <div className="col-span-3 border-r bg-white p-6 overflow-y-auto">
        <h2 className="text-xs font-bold text-gray-400 mb-4 tracking-wider">
          CONTEXTUAL HISTORY
        </h2>
        {uiComponents
          .filter((c) => c.zone === "history")
          .map((c, i) => {
            const Comp = COMPONENT_MAP[c.type];
            return Comp ? <Comp key={i} {...c.props} /> : null;
          })}
      </div>

      {/* ZONE C: ACTIVE (Center) */}
      <div className="col-span-9 p-8 flex flex-col">
        <h2 className="text-xs font-bold text-gray-400 mb-4 tracking-wider">
          ACTIVE WORKSPACE
        </h2>
        <div className="grid grid-cols-2 gap-6">
          {uiComponents
            .filter((c) => c.zone === "active")
            .map((c, i) => {
              const Comp = COMPONENT_MAP[c.type];
              return Comp ? <Comp key={i} {...c.props} /> : null;
            })}
        </div>
      </div>

      {/* ZONE A: INPUT (Bottom) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl">
        <div className="bg-white p-2 rounded-xl shadow-2xl border flex gap-2">
          <input
            className="flex-1 p-3 outline-none text-lg"
            placeholder="Describe patient status..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-black text-white px-6 rounded-lg font-medium"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 7. Implementation Steps (Checklist)

1. **Setup:** Run `npx create-next-app` and `npx convex dev`.
2. **Schema:** Copy the schema into `convex/schema.js`.
3. **Seed Data:** Create a `convex/seed.js` script to add one patient ("Harsh Dange") and some dummy history (Asthma data). Run it once.
4. **Backend:** Copy the logic into `convex/actions.js`.
5. **Components:** Create `components/registry/` and build the 3 basic components.
6. **Frontend:** Update `app/page.jsx` to wire it all together.
7. **Demo:** Run the app, type **"Patient has asthma"**, and watch the charts appear.

