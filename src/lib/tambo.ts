/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * IMPORTANT: If you have components in different directories (e.g., both ui/ and tambo/),
 * make sure all import paths are consistent. Run 'npx tambo migrate' to consolidate.
 *
 * Read more about Tambo at https://docs.tambo.co
 */

import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod/v4";

import AlertCard from "../components/registry/AlertCard.js";
import LineChart from "../components/registry/LineChart.js";
import VitalsForm from "../components/registry/VitalsForm.js";
import BodyMapAbdomen from "../components/registry/BodyMapAbdomen.js";
import SymptomToggles from "../components/registry/SymptomToggles.js";
import AppendicitisRiskCard from "../components/registry/AppendicitisRiskCard.js";
import LabsChecklist from "../components/registry/LabsChecklist.js";
import ReferralLetterCard from "../components/registry/ReferralLetterCard.js";
import NPOOrderToggle from "../components/registry/NPOOrderToggle.js";
import ConsentSummaryCard from "../components/registry/ConsentSummaryCard.js";
import FinalizeDiagnosisButton from "../components/registry/FinalizeDiagnosisButton.js";
import TimeMachineSlider from "../components/registry/TimeMachineSlider.js";
// AutoScribeSummary removed - users should click "End Visit & Scribe" button for comprehensive scribe
import PrescriptionForm from "../components/registry/PrescriptionForm.jsx";

/**
 * Components Array - ClinicalFlow registry exposed to Tambo
 *
 * These are the Lego blocks Tambo can render as part of the generative UI.
 */
export const components: TamboComponent[] = [
  {
    name: "AlertCard",
    description:
      "Clinical safety alert card, used to highlight drug interactions or critical issues.",
    component: AlertCard,
    propsSchema: z.object({
      level: z.enum(["critical", "warning"]).default("warning"),
      title: z.string().default("Alert"),
      message: z.string().default(""),
    }),
  },
  {
    name: "LineChart",
    description:
      "Compact trend chart for a clinical measurement or risk score over time.",
    component: LineChart,
    propsSchema: z.object({
      title: z.string().default("Trend"),
      data: z
        .object({
          values: z
            .array(z.number())
            .describe("Values expressed as percentages from 0 to 100.")
            .default([]),
        })
        .default({ values: [] }),
      insight: z.string().optional(),
    }),
  },
  {
    name: "VitalsForm",
    description:
      "Focused vitals capture form for the current encounter (temperature, heart rate, blood pressure).",
    component: VitalsForm,
    propsSchema: z.object({
      defaultTemp: z.number().optional(),
    }),
  },
  {
    name: "BodyMapAbdomen",
    description: "Quadrant-level abdominal body map used to localize pain.",
    component: BodyMapAbdomen,
    propsSchema: z.object({
      highlight: z
        .enum(["upper-left", "upper-right", "lower-left", "lower-right"])
        .nullable()
        .optional(),
    }),
  },
  {
    name: "SymptomToggles",
    description:
      "Common correlated GI symptoms toggles (nausea, vomiting, fever).",
    component: SymptomToggles,
    propsSchema: z.object({
      active: z.array(z.enum(["nausea", "vomiting", "fever"])).optional(),
    }),
  },
  {
    name: "AppendicitisRiskCard",
    description: "Displays Alvarado appendicitis risk score and risk tier.",
    component: AppendicitisRiskCard,
    propsSchema: z.object({
      score: z.number().default(0),
      riskLevel: z.enum(["low", "moderate", "high"]).default("low"),
    }),
  },
  {
    name: "LabsChecklist",
    description: "Checklist of lab tests to order for a given scenario.",
    component: LabsChecklist,
    propsSchema: z.object({
      items: z.array(z.string()).optional(),
    }),
  },
  {
    name: "ReferralLetterCard",
    description: "Pre-filled referral letter summary for handoff.",
    component: ReferralLetterCard,
    propsSchema: z.object({
      diagnosis: z.string().default("Pending"),
      summary: z.string().default(""),
    }),
  },
  {
    name: "NPOOrderToggle",
    description: "Indicates whether NPO (nothing by mouth) order is active.",
    component: NPOOrderToggle,
    propsSchema: z.object({
      defaultOn: z.boolean().optional(),
    }),
  },
  {
    name: "ConsentSummaryCard",
    description: "Summarizes key consent discussion points for a procedure.",
    component: ConsentSummaryCard,
    propsSchema: z.object({
      procedure: z.string().default("Procedure"),
    }),
  },
  {
    name: "FinalizeDiagnosisButton",
    description:
      "Finalize diagnosis button that can be disabled by safety-net logic.",
    component: FinalizeDiagnosisButton,
    propsSchema: z.object({
      disabled: z.boolean().default(false),
      reason: z.string().optional(),
    }),
  },
  {
    name: "TimeMachineSlider",
    description:
      "Timeline slider to conceptually move between historical snapshots.",
    component: TimeMachineSlider,
    propsSchema: z.object({
      years: z.array(z.number()).optional(),
      currentYear: z.number().optional(),
    }),
  },
  // NOTE: AutoScribeSummary removed from Tambo - users should click "End Visit & Scribe" button
  // to get the comprehensive clinical summary from Convex generateDischargeSummary action
  {
    name: "PrescriptionForm",
    description:
      "E-prescription form for prescribing medications. Shows quick-add common medications and custom medication entry with dosage, frequency, and duration.",
    component: PrescriptionForm,
    propsSchema: z.object({
      patientName: z.string().default("Patient"),
      patientAllergies: z.array(z.string()).default([]),
    }),
  },
];
