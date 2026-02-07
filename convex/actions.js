import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import OpenAI from "openai";

const SUMMARY_SYSTEM_PROMPT = `
You are a clinical documentation assistant.
Generate a concise, well-structured visit summary for "End Visit & Scribe".

Requirements:
- Use clear medical note sections:
  1) Visit Summary
  2) Chief Complaint
  3) Vitals
  4) Symptoms and Findings
  5) Assessment
  6) Orders/Labs
  7) Plan and Follow-up
- Include only information present in the input.
- Do not invent medications, diagnoses, test results, or plans.
- If diagnosis is missing, write "Diagnosis pending".
- Keep it readable for clinicians and suitable for chart documentation.
`;

const FASTROUTER_BASE_URL = "https://go.fastrouter.ai/api/v1";
const SUMMARY_MODEL = "z-ai/glm-4.7";

function extractMessageText(content) {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part?.type === "text" && typeof part?.text === "string") return part.text;
      return "";
    })
    .join("\n")
    .trim();
}

async function generateAISummary({ patient, visitData }) {
  const apiKey =
    process.env.FASTROUTER_API_KEY ||
    process.env.AI_SUMMARY_API_KEY ||
    process.env.TAMBO_API_KEY;

  if (!apiKey) return null;

  const payloadForModel = {
    patient: {
      name: patient?.name || "Unknown",
      age: patient?.age ?? null,
      gender: patient?.gender || null,
      bloodType: patient?.bloodType || null,
      medications: patient?.medications || [],
      allergies: patient?.allergies || [],
      chronicConditions: patient?.chronicConditions || [],
    },
    visit: {
      complaint: visitData?.complaint || null,
      diagnosis: visitData?.diagnosis || visitData?.inferredDiagnosis || null,
      vitals: visitData?.vitals || null,
      symptoms: visitData?.symptoms || [],
      bodyRegion: visitData?.bodyRegion || null,
      labsOrdered: visitData?.labsOrdered || [],
      score: visitData?.score || null,
      plan: visitData?.plan || null,
      messageCount: visitData?.messageCount || 0,
      conversationHistory: Array.isArray(visitData?.conversationHistory)
        ? visitData.conversationHistory
        : [],
    },
  };

  const prompt = `${SUMMARY_SYSTEM_PROMPT.trim()}

Generate the final clinical summary from this data:
${JSON.stringify(payloadForModel, null, 2)}`;

  const client = new OpenAI({
    baseURL: FASTROUTER_BASE_URL,
    apiKey,
  });
  const completion = await client.chat.completions.create({
    model: SUMMARY_MODEL,
    messages: [
      { role: "system", content: SUMMARY_SYSTEM_PROMPT.trim() },
      { role: "user", content: prompt },
    ],
  });

  const text = extractMessageText(completion?.choices?.[0]?.message?.content);
  return text || null;
}

export const generateUI = action({
  args: {
    patientId: v.id("patients"),
    input: v.string(),
    context: v.optional(v.any()), // Extra context like selected body part
  },
  handler: async (ctx, args) => {
    const text = args.input.toLowerCase();
    const uiPlan = [];
    const patientId = args.patientId;

    const patient = await ctx.runQuery(internal.patients.get, {
      id: patientId,
    });
    if (!patient) return [];

    // --- SYNTHESIZER LOGIC (The "Smart" Tambo) ---

    // 1. WELCOME / INITIAL STATE
    if (text === "" || text.includes("init") || text.includes("start")) {
      if (patient.name.includes("Sarah")) {
        uiPlan.push({
          zone: "active",
          type: "AlertCard",
          props: {
            level: "warning",
            title: `CRITICAL MONITORING: ${patient.name}`,
            message: `Initial BP baseline is ${patient.metadata?.baselineBP || "Unknown"}. Patient is ${patient.metadata?.riskLevel || "High Risk"}.`,
          },
        });
        uiPlan.push({
          zone: "active",
          type: "VitalsForm",
          props: {
            patientName: patient.name,
            fields: ["Blood Pressure", "Heart Rate"],
            instruction: `Verify baseline deviation from ${patient.metadata?.baselineBP || "120/80"}.`,
          },
        });
      } else if (patient.name.includes("John")) {
        uiPlan.push({
          zone: "active",
          type: "BodyMap",
          props: {
            instruction: `Pain localization. Note: Hardware present in ${patient.metadata?.hardware?.join(", ") || "lower limbs"}.`,
            selected: null,
          },
        });
        uiPlan.push({
          zone: "active",
          type: "AlertCard",
          props: {
            level: "info",
            title: "Trauma Protocol",
            message: `John's last recorded pain score was ${patient.metadata?.lastPainScore || "unknown"}. Assess for hardware-related inflammation.`,
          },
        });
      } else {
        uiPlan.push({
          zone: "active",
          type: "AlertCard",
          props: {
            level: "info",
            title: "Clinical Onboarding",
            message: `Evaluating ${patient.name}. Describe chief complaint to generate diagnostic tools.`,
          },
        });
      }
      return uiPlan;
    }

    // 2. DYNAMIC SCENARIOS
    // GI / Abdominal
    if (
      text.includes("stomach") ||
      text.includes("abdominal") ||
      text.includes("rlq") ||
      args.context?.bodyPart === "lower-right"
    ) {
      uiPlan.push({
        zone: "active",
        type: "BodyMap",
        props: {
          instruction: `Localizing ${patient.name}'s abdominal distress. Check for rebound tenderness.`,
          selected: args.context?.bodyPart || "lower-right",
        },
      });
      uiPlan.push({
        zone: "active",
        type: "ScoreCalculator",
        props: {
          title: "Alvarado Score (Appendicitis Risk)",
          inputs: [
            { id: "migration", label: "Migration of Pain", points: 1 },
            { id: "anorexia", label: "Anorexia", points: 1 },
            { id: "nausea", label: "Nausea/Vomiting", points: 1 },
            { id: "tenderness", label: "Tenderness in RLQ", points: 2 },
            { id: "rebound", label: "Rebound Tenderness", points: 1 },
            { id: "fever", label: "Elevated temp", points: 1 },
            { id: "leukocytosis", label: "Leukocytosis", points: 2 },
          ],
        },
      });
    }

    // Cardiac (BP/Heart)
    if (
      text.includes("bp") ||
      text.includes("check") ||
      text.includes("heart") ||
      text.includes("hypertension")
    ) {
      uiPlan.push({
        zone: "active",
        type: "LineChart",
        props: {
          title: `${patient.name} - Blood Pressure Trends`,
          data: { values: [160, 158, 155, 152, 148, 145] },
          insight: `Currently trending downward from baseline (${patient.metadata?.baselineBP || "N/A"}).`,
        },
      });
    }

    // Trauma / Pain
    if (
      text.includes("pain") ||
      text.includes("hurt") ||
      text.includes("injury")
    ) {
      const hasHardware = patient.metadata?.hardware?.length > 0;
      uiPlan.push({
        zone: "active",
        type: "PainSlider",
        props: {
          label: `Current Pain Level (Last: ${patient.metadata?.lastPainScore || "unrated"})`,
          defaultValue: patient.metadata?.lastPainScore || 5,
        },
      });
      if (hasHardware) {
        uiPlan.push({
          zone: "active",
          type: "AlertCard",
          props: {
            level: "warning",
            title: "Hardware Complication Check",
            message:
              "Assess for metal fatigue or local infection near: " +
              patient.metadata.hardware.join(", "),
          },
        });
      }
    }

    // RESPIRATORY / BREATHING
    if (
      text.includes("breathing") ||
      text.includes("breath") ||
      text.includes("cough") ||
      text.includes("wheez") ||
      text.includes("asthma") ||
      text.includes("respiratory") ||
      text.includes("dyspnea") ||
      text.includes("shortness")
    ) {
      uiPlan.push({
        zone: "active",
        type: "VitalsForm",
        props: {
          patientName: patient.name,
          fields: ["SpO2", "Respiratory Rate", "Peak Flow"],
          instruction:
            "Assess respiratory function. Check for accessory muscle use.",
        },
      });
      uiPlan.push({
        zone: "active",
        type: "SymptomToggles",
        props: {
          symptoms: [
            "Wheezing",
            "Stridor",
            "Productive Cough",
            "Hemoptysis",
            "Chest Tightness",
          ],
          title: "Respiratory Symptoms",
        },
      });

      if (text.includes("asthma") || text.includes("wheez")) {
        uiPlan.push({
          zone: "active",
          type: "AlertCard",
          props: {
            level: "warning",
            title: "Asthma Exacerbation Protocol",
            message:
              "Consider nebulized bronchodilators. Monitor for signs of respiratory distress.",
          },
        });
        uiPlan.push({
          zone: "active",
          type: "LineChart",
          props: {
            title: `${patient.name} - Peak Flow History`,
            data: { values: [85, 78, 65, 72, 80, 75] },
            insight: "Recent decline from baseline. Consider step-up therapy.",
          },
        });
      }
    }

    // NEUROLOGICAL
    if (
      text.includes("headache") ||
      text.includes("dizzy") ||
      text.includes("neuro") ||
      text.includes("stroke") ||
      text.includes("weakness") ||
      text.includes("numbness") ||
      text.includes("confusion") ||
      text.includes("seizure")
    ) {
      uiPlan.push({
        zone: "active",
        type: "AlertCard",
        props: {
          level: "critical",
          title: "Neurological Assessment Required",
          message:
            "Perform focused neuro exam. Document onset time for potential thrombolytic eligibility.",
        },
      });
      uiPlan.push({
        zone: "active",
        type: "ScoreCalculator",
        props: {
          title: "Glasgow Coma Scale (GCS)",
          inputs: [
            { id: "eye4", label: "Eyes: Spontaneous opening", points: 4 },
            { id: "eye3", label: "Eyes: Opens to voice", points: 3 },
            { id: "eye2", label: "Eyes: Opens to pain", points: 2 },
            { id: "eye1", label: "Eyes: No response", points: 1 },
            { id: "verbal5", label: "Verbal: Oriented", points: 5 },
            { id: "verbal4", label: "Verbal: Confused", points: 4 },
            { id: "verbal3", label: "Verbal: Inappropriate words", points: 3 },
            { id: "motor6", label: "Motor: Obeys commands", points: 6 },
            { id: "motor5", label: "Motor: Localizes pain", points: 5 },
            { id: "motor4", label: "Motor: Withdraws from pain", points: 4 },
          ],
        },
      });

      if (text.includes("stroke") || text.includes("weakness")) {
        uiPlan.push({
          zone: "active",
          type: "SymptomToggles",
          props: {
            symptoms: [
              "Facial Droop",
              "Arm Drift",
              "Slurred Speech",
              "Visual Changes",
              "Ataxia",
            ],
            title: "FAST Assessment",
          },
        });
      }
    }

    // INFECTIOUS DISEASE / FEVER
    if (
      text.includes("fever") ||
      text.includes("infection") ||
      text.includes("sepsis") ||
      text.includes("chill")
    ) {
      uiPlan.push({
        zone: "active",
        type: "VitalsForm",
        props: {
          patientName: patient.name,
          fields: [
            "Temperature",
            "Heart Rate",
            "Blood Pressure",
            "Respiratory Rate",
          ],
          instruction: "Assess for SIRS criteria. Document fever pattern.",
        },
      });
      uiPlan.push({
        zone: "active",
        type: "LabsChecklist",
        props: {
          items: [
            "CBC with Differential",
            "Blood Cultures x2",
            "Lactate",
            "Procalcitonin",
            "Urinalysis",
            "CRP",
          ],
        },
      });

      if (text.includes("sepsis")) {
        uiPlan.push({
          zone: "active",
          type: "AlertCard",
          props: {
            level: "critical",
            title: "SEPSIS ALERT: Hour-1 Bundle",
            message:
              "Initiate lactate measurement, blood cultures, broad-spectrum antibiotics, and fluid resuscitation within 1 hour.",
          },
        });
        uiPlan.push({
          zone: "active",
          type: "ScoreCalculator",
          props: {
            title: "qSOFA Score",
            inputs: [
              { id: "rr", label: "Respiratory Rate ≥22/min", points: 1 },
              { id: "sbp", label: "Systolic BP ≤100 mmHg", points: 1 },
              { id: "gcs", label: "Altered Mental Status", points: 1 },
            ],
          },
        });
      }
    }

    // PEDIATRIC
    if (
      text.includes("child") ||
      text.includes("pediatric") ||
      text.includes("infant") ||
      text.includes("baby") ||
      text.includes("kid")
    ) {
      uiPlan.push({
        zone: "active",
        type: "AlertCard",
        props: {
          level: "info",
          title: "Pediatric Assessment Mode",
          message:
            "Use age-appropriate vital sign ranges. Weight-based medication dosing required.",
        },
      });
      uiPlan.push({
        zone: "active",
        type: "VitalsForm",
        props: {
          patientName: patient.name,
          fields: [
            "Heart Rate",
            "Respiratory Rate",
            "Temperature",
            "Weight (kg)",
          ],
          instruction: "Pediatric vital signs - use age-appropriate norms.",
        },
      });
      uiPlan.push({
        zone: "active",
        type: "SymptomToggles",
        props: {
          symptoms: [
            "Irritability",
            "Poor Feeding",
            "Lethargy",
            "Rash",
            "Dehydration Signs",
          ],
          title: "Pediatric Warning Signs",
        },
      });
    }

    // VITALS CHECK (General)
    if (text.includes("vital") || text.includes("vitals")) {
      uiPlan.push({
        zone: "active",
        type: "VitalsForm",
        props: {
          patientName: patient.name,
          fields: [
            "Blood Pressure",
            "Heart Rate",
            "Temperature",
            "SpO2",
            "Respiratory Rate",
          ],
          instruction: "Complete vital signs assessment.",
        },
      });
    }

    // LABS / ORDERS
    if (
      text.includes("lab") ||
      text.includes("order") ||
      text.includes("blood work") ||
      text.includes("test")
    ) {
      uiPlan.push({
        zone: "active",
        type: "LabsOrder",
        props: {
          patientName: patient.name,
          suggestedLabs: ["CBC", "BMP", "LFTs", "Lipase", "Urinalysis"],
        },
      });
      uiPlan.push({
        zone: "active",
        type: "LabsChecklist",
        props: {
          items: ["CBC", "CMP", "Lipase", "LFTs", "UA", "Coags"],
        },
      });
    }

    // APPENDICITIS SPECIFIC
    if (text.includes("appendicitis") || text.includes("appendix")) {
      uiPlan.push({
        zone: "active",
        type: "AppendicitisRiskCard",
        props: {
          score: args.context?.alvaradoScore || 0,
          riskLevel:
            args.context?.alvaradoScore >= 7
              ? "high"
              : args.context?.alvaradoScore >= 4
                ? "moderate"
                : "low",
        },
      });
      uiPlan.push({
        zone: "active",
        type: "BodyMapAbdomen",
        props: {
          highlight: "lower-right",
        },
      });
      uiPlan.push({
        zone: "active",
        type: "NPOOrderToggle",
        props: {
          defaultOn: true,
        },
      });
      uiPlan.push({
        zone: "active",
        type: "ConsentSummaryCard",
        props: {
          procedure: "Appendectomy (Laparoscopic)",
        },
      });
    }

    // REFERRAL / CONSULT
    if (
      text.includes("refer") ||
      text.includes("consult") ||
      text.includes("surgery") ||
      text.includes("specialist")
    ) {
      uiPlan.push({
        zone: "active",
        type: "ReferralLetterCard",
        props: {
          diagnosis: args.context?.diagnosis || "Pending workup",
          summary: `Patient ${patient.name} requires specialist evaluation. Please see attached clinical notes.`,
        },
      });
    }

    // CONSENT
    if (
      text.includes("consent") ||
      text.includes("procedure") ||
      text.includes("surgery")
    ) {
      uiPlan.push({
        zone: "active",
        type: "ConsentForm",
        props: {
          procedure: args.context?.procedure || "Surgical Procedure",
          patientName: patient.name,
        },
      });
    }

    return uiPlan;
  },
});

export const generateDischargeSummary = action({
  args: {
    patientId: v.id("patients"),
    visitData: v.any(), // The collected state from frontend
  },
  handler: async (ctx, args) => {
    const { visitData } = args;
    const patient =
      visitData?.patient ||
      (await ctx.runQuery(internal.patients.get, {
        id: args.patientId,
      }));

    const enableBackendAISummary =
      process.env.ENABLE_AI_SUMMARY === "true" ||
      process.env.ENABLE_TAMBO_BACKEND_SUMMARY === "true";

    if (enableBackendAISummary) {
      try {
        const aiSummary = await generateAISummary({ patient, visitData });
        if (aiSummary) {
          return {
            text: aiSummary,
            approved: false,
            data: visitData,
            generatedBy: "ai",
          };
        }
      } catch (error) {
        console.error("AI summary generation failed, falling back:", error);
      }
    }

    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    // Build comprehensive clinical summary
    let narrative = "";

    // Header
    narrative += "═══════════════════════════════════════════\n";
    narrative += "           CLINICAL ENCOUNTER SUMMARY\n";
    narrative += "═══════════════════════════════════════════\n\n";

    // Patient Info
    narrative += "📋 PATIENT INFORMATION\n";
    narrative += "───────────────────────────────────────────\n";
    narrative += `Name: ${patient?.name || "Unknown"}\n`;
    narrative += `Age/Gender: ${patient?.age || "N/A"} years / ${patient?.gender || "N/A"}\n`;
    narrative += `Blood Type: ${patient?.bloodType || "N/A"}\n`;
    narrative += `Date: ${date} at ${time}\n\n`;

    // Active Medications
    if (patient?.medications?.length > 0) {
      narrative += "💊 CURRENT MEDICATIONS\n";
      narrative += "───────────────────────────────────────────\n";
      patient.medications.forEach((med) => {
        narrative += `  • ${med}\n`;
      });
      narrative += "\n";
    }

    // Allergies
    if (patient?.allergies?.length > 0) {
      narrative += "⚠️ ALLERGIES\n";
      narrative += "───────────────────────────────────────────\n";
      patient.allergies.forEach((allergy) => {
        narrative += `  ⛔ ${allergy}\n`;
      });
      narrative += "\n";
    }

    // Chronic Conditions
    if (patient?.chronicConditions?.length > 0) {
      narrative += "🏥 CHRONIC CONDITIONS\n";
      narrative += "───────────────────────────────────────────\n";
      patient.chronicConditions.forEach((condition) => {
        narrative += `  • ${condition}\n`;
      });
      narrative += "\n";
    }

    // Vitals if available
    const { vitals } = visitData || {};
    if (vitals) {
      narrative += "🩺 VITAL SIGNS\n";
      narrative += "───────────────────────────────────────────\n";
      if (vitals.temperature)
        narrative += `  Temperature: ${vitals.temperature}°F ${vitals.temperature > 99 ? "(Febrile)" : "(Normal)"}\n`;
      if (vitals.bloodPressure)
        narrative += `  Blood Pressure: ${vitals.bloodPressure} mmHg\n`;
      if (vitals.heartRate)
        narrative += `  Heart Rate: ${vitals.heartRate} bpm\n`;
      if (vitals.respiratoryRate)
        narrative += `  Respiratory Rate: ${vitals.respiratoryRate}/min\n`;
      if (vitals.oxygenSaturation)
        narrative += `  O2 Saturation: ${vitals.oxygenSaturation}%\n`;
      narrative += "\n";
    }

    // Symptoms if available
    const { symptoms } = visitData || {};
    if (symptoms && symptoms.length > 0) {
      narrative += "🔍 PRESENTING SYMPTOMS\n";
      narrative += "───────────────────────────────────────────\n";
      symptoms.forEach((symptom) => {
        narrative += `  • ${symptom}\n`;
      });
      narrative += "\n";
    }

    // Body Region if available
    if (visitData?.bodyRegion) {
      narrative += "📍 PAIN LOCALIZATION\n";
      narrative += "───────────────────────────────────────────\n";
      narrative += `  Region: ${visitData.bodyRegion}\n\n`;
    }

    const conversationHistory = Array.isArray(visitData?.conversationHistory)
      ? visitData.conversationHistory
      : [];
    const userConversation = conversationHistory.filter(
      (entry) => entry?.role === "user",
    );

    // Chief Complaint / Reason for Visit
    narrative += "📝 CHIEF COMPLAINT\n";
    narrative += "───────────────────────────────────────────\n";
    // Handle complaint being string or object
    let complaintText = visitData?.complaint;
    if (typeof complaintText === "object" && complaintText !== null) {
      complaintText =
        complaintText.text ||
        complaintText.content ||
        JSON.stringify(complaintText);
    }
    if (
      !complaintText &&
      userConversation.length > 0 &&
      typeof userConversation[0]?.content === "string"
    ) {
      complaintText = userConversation[0].content;
    }
    narrative += `${complaintText || "Patient presented for evaluation."}\n\n`;

    // Visit transcript
    if (conversationHistory.length > 0) {
      narrative += "💬 VISIT CONVERSATION LOG\n";
      narrative += "───────────────────────────────────────────\n";
      conversationHistory.forEach((entry) => {
        const speaker = entry?.role === "user" ? "Doctor" : "Assistant";
        const content =
          typeof entry?.content === "string"
            ? entry.content
            : JSON.stringify(entry?.content || "");
        if (content) {
          narrative += `${speaker}: ${content}\n`;
        }
      });
      narrative += "\n";
    }

    // Clinical Assessment / Score
    const scoreData = visitData?.score;
    const diagnosisText = visitData?.diagnosis || visitData?.inferredDiagnosis;
    if (diagnosisText || scoreData) {
      narrative += "🔬 CLINICAL ASSESSMENT\n";
      narrative += "───────────────────────────────────────────\n";
      if (diagnosisText) narrative += `Diagnosis: ${diagnosisText}\n`;
      if (scoreData) {
        if (typeof scoreData === "object") {
          narrative += `Clinical Score: ${scoreData.score || 0}/${scoreData.maxScore || 10}\n`;
          if (scoreData.items && scoreData.items.length > 0) {
            narrative += `Positive Findings: ${scoreData.items.join(", ")}\n`;
          }
        } else {
          narrative += `Clinical Score: ${scoreData}\n`;
        }
      }
      if (visitData.riskLevel)
        narrative += `Risk Level: ${visitData.riskLevel}\n`;
      narrative += "\n";
    }

    // Labs Ordered
    if (visitData?.labsOrdered && visitData.labsOrdered.length > 0) {
      narrative += "🧪 LABS ORDERED\n";
      narrative += "───────────────────────────────────────────\n";
      visitData.labsOrdered.forEach((lab) => {
        narrative += `  ☐ ${lab}\n`;
      });
      narrative += "\n";
    }

    // Treatment Plan
    narrative += "📋 TREATMENT PLAN\n";
    narrative += "───────────────────────────────────────────\n";
    if (visitData?.procedure) {
      narrative += `Procedure: ${visitData.procedure}\n`;
    }
    if (visitData?.npoStatus) {
      narrative += "NPO Status: Initiated\n";
    }
    if (visitData?.consentObtained) {
      narrative += "Consent: Obtained and documented\n";
    }
    narrative +=
      visitData?.plan || "Continue monitoring. Follow up as needed.\n";
    narrative += "\n";

    // Session Statistics
    narrative += "═══════════════════════════════════════════\n";
    narrative += "📊 SESSION SUMMARY\n";
    narrative += `   ${visitData?.messageCount || 0} clinical interactions recorded\n`;
    narrative += "═══════════════════════════════════════════\n";

    return {
      text: narrative,
      approved: false, // Requires doctor signature
      data: visitData, // Include raw data for editing
    };
  },
});
