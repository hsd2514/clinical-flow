import { NextResponse } from "next/server";
import OpenAI from "openai";

const SUMMARY_SYSTEM_PROMPT = `
You are a clinical documentation assistant.
Generate a concise, clinically useful encounter summary.

Output requirements:
- Plain text only
- Sections:
  1) Visit Summary
  2) Chief Complaint
  3) Vitals
  4) Symptoms and Findings
  5) Assessment
  6) Orders/Labs
  7) Plan and Follow-up
- Do not invent facts.
- If diagnosis is missing, write "Diagnosis pending".
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

export async function POST(req) {
  try {
    const body = await req.json();
    const visitData = body?.visitData || {};

    const apiKey =
      process.env.FASTROUTER_API_KEY ||
      process.env.AI_SUMMARY_API_KEY ||
      process.env.TAMBO_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing FASTROUTER_API_KEY on server." },
        { status: 500 },
      );
    }

    const promptPayload = {
      patient: visitData?.patient || {},
      complaint: visitData?.complaint || null,
      diagnosis: visitData?.diagnosis || visitData?.inferredDiagnosis || null,
      vitals: visitData?.vitals || null,
      symptoms: visitData?.symptoms || [],
      bodyRegion: visitData?.bodyRegion || null,
      labsOrdered: visitData?.labsOrdered || [],
      score: visitData?.score || null,
      plan: visitData?.plan || null,
      conversationHistory: Array.isArray(visitData?.conversationHistory)
        ? visitData.conversationHistory.slice(-20)
        : [],
    };

    const prompt = `${SUMMARY_SYSTEM_PROMPT.trim()}

Generate the final summary from this encounter data:
${JSON.stringify(promptPayload, null, 2)}`;

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

    const summary = extractMessageText(completion?.choices?.[0]?.message?.content);

    if (!summary) {
      return NextResponse.json(
        { error: "FastRouter returned empty summary text." },
        { status: 502 },
      );
    }

    return NextResponse.json({ summary, generatedBy: "fastrouter" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate AI summary.", details: String(error) },
      { status: 500 },
    );
  }
}
