"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
// Tambo AI Hooks for dynamic component generation
import { useTamboThread, useTamboThreadInput } from "@tambo-ai/react";
// Clinical Context for component data collection
import { ClinicalContextProvider } from "../contexts/ClinicalContext";
// Markdown rendering
import { Streamdown } from "streamdown";
import { markdownComponents } from "../components/tambo/markdown-components";
import {
  Send,
  Sparkles,
  Activity,
  History,
  Stethoscope,
  LayoutDashboard,
  User,
  Heart,
  Clock,
  Pill,
  AlertCircle,
  MessageSquare,
  Bot,
  Trash2,
  Save,
  ChevronRight,
  Zap,
  ThermometerSun,
  Syringe,
  FileText,
  Brain,
  Wind,
  Baby,
  Bone,
  Eye,
  Droplets,
  X,
} from "lucide-react";

// Registry Imports
import AlertCard from "../components/registry/AlertCard";
import LineChart from "../components/registry/LineChart";
import VitalsForm from "../components/registry/VitalsForm";
import BodyMap from "../components/registry/BodyMap";
import BodyMapAbdomen from "../components/registry/BodyMapAbdomen";
import SymptomToggles from "../components/registry/SymptomToggles";
import ScoreCalculator from "../components/registry/ScoreCalculator";
import ReferralLetter from "../components/registry/ReferralLetter";
import LabsOrder from "../components/registry/LabsOrder";
import ActionToggle from "../components/registry/ActionToggle";
import ConsentForm from "../components/registry/ConsentForm";
import AutoScribeModal from "../components/registry/AutoScribeModal";
import PatientSidebar from "../components/registry/PatientSidebar";
import TimeMachineSlider from "../components/registry/TimeMachineSlider";
import AutoScribeSummary from "../components/registry/AutoScribeSummary";
import FinalizeDiagnosisButton from "../components/registry/FinalizeDiagnosisButton";
import AppendicitisRiskCard from "../components/registry/AppendicitisRiskCard";
import LabsChecklist from "../components/registry/LabsChecklist";
import NPOOrderToggle from "../components/registry/NPOOrderToggle";
import ConsentSummaryCard from "../components/registry/ConsentSummaryCard";
import ReferralLetterCard from "../components/registry/ReferralLetterCard";
import PrescriptionForm from "../components/registry/PrescriptionForm";

// Complete Component Map - All registry components available
const COMPONENT_MAP = {
  AlertCard,
  LineChart,
  VitalsForm,
  BodyMap,
  BodyMapAbdomen,
  SymptomToggles,
  ScoreCalculator,
  ReferralLetter,
  LabsOrder,
  ActionToggle,
  ConsentForm,
  TimeMachineSlider,
  AutoScribeSummary,
  FinalizeDiagnosisButton,
  AppendicitisRiskCard,
  LabsChecklist,
  NPOOrderToggle,
  ConsentSummaryCard,
  ReferralLetterCard,
  PrescriptionForm,
};

// Dynamic contextual suggestions based on scenario
const SUGGESTION_CATEGORIES = {
  initial: [
    { icon: ThermometerSun, text: "Check vitals", color: "text-blue-500" },
    { icon: Activity, text: "Patient has chest pain", color: "text-red-500" },
    {
      icon: Bone,
      text: "Patient has abdominal pain",
      color: "text-orange-500",
    },
    { icon: Wind, text: "Difficulty breathing", color: "text-purple-500" },
  ],
  respiratory: [
    { icon: Wind, text: "Assess oxygen saturation", color: "text-blue-500" },
    { icon: Syringe, text: "Order respiratory panel", color: "text-green-500" },
    { icon: FileText, text: "Get chest X-ray", color: "text-purple-500" },
    { icon: ThermometerSun, text: "Check for fever", color: "text-red-500" },
  ],
  cardiac: [
    { icon: Heart, text: "Order ECG", color: "text-red-500" },
    { icon: Droplets, text: "Troponin levels", color: "text-blue-500" },
    { icon: Activity, text: "Monitor rhythm", color: "text-green-500" },
    { icon: Syringe, text: "Start IV access", color: "text-purple-500" },
  ],
  abdominal: [
    { icon: Bone, text: "Calculate Alvarado score", color: "text-orange-500" },
    { icon: Eye, text: "Physical examination", color: "text-blue-500" },
    { icon: Syringe, text: "Order CBC and CMP", color: "text-green-500" },
    { icon: FileText, text: "Request CT abdomen", color: "text-purple-500" },
  ],
  pediatric: [
    { icon: Baby, text: "Pediatric assessment", color: "text-pink-500" },
    { icon: ThermometerSun, text: "Check temperature", color: "text-red-500" },
    { icon: Droplets, text: "Hydration status", color: "text-blue-500" },
    { icon: Brain, text: "Developmental screen", color: "text-purple-500" },
  ],
  neuro: [
    { icon: Brain, text: "Neuro exam", color: "text-purple-500" },
    { icon: Eye, text: "Pupil response", color: "text-blue-500" },
    { icon: Activity, text: "GCS scoring", color: "text-red-500" },
    { icon: FileText, text: "Order CT head", color: "text-green-500" },
  ],
};

// Quick clinical action buttons
const QUICK_ACTIONS = [
  { id: "vitals", label: "Vitals", icon: ThermometerSun },
  { id: "labs", label: "Labs", icon: Syringe },
  { id: "imaging", label: "Imaging", icon: FileText },
  { id: "consult", label: "Consult", icon: User },
];

export default function ClinicalFlowDashboard() {
  const [input, setInput] = useState("");
  // Toggle between Tambo AI and Convex rule-based generation
  const [useTamboAI, setUseTamboAI] = useState(true);
  // Fallback: Custom messages for rule-based mode
  const [customMessages, setCustomMessages] = useState([]);
  const [context, setContext] = useState({});
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [showAutoScribe, setShowAutoScribe] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [scribeContent, setScribeContent] = useState("");
  const [isScribeLoading, setIsScribeLoading] = useState(false);
  const [scribeRequestedAt, setScribeRequestedAt] = useState(null);
  const [savedEncounters, setSavedEncounters] = useState([]);
  const [currentScenario, setCurrentScenario] = useState("initial");
  const [sidebarTab, setSidebarTab] = useState("patient"); // "patient" | "history" | "scribe"

  // ============ TAMBO AI HOOKS ============
  const {
    thread,
    generationStage,
    startNewThread,
    isIdle: tamboIsIdle,
  } = useTamboThread();

  const {
    value: tamboInput,
    setValue: setTamboInput,
    submit: tamboSubmit,
    isPending: tamboIsPending,
    error: tamboError,
  } = useTamboThreadInput();

  // Sync our local input with Tambo input
  useEffect(() => {
    if (useTamboAI) {
      setTamboInput(input);
    }
  }, [input, useTamboAI, setTamboInput]);

  const isGenerating = useTamboAI ? tamboIsPending : isGeneratingCustom;
  const tamboMessages = thread?.messages || [];

  // Data Fetching
  const patients = useQuery(api.queries.getPatients) || [];

  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0]._id);
    }
  }, [patients, selectedPatientId]);

  // Load saved encounters from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("clinicalflow_encounters");
      if (saved) {
        setSavedEncounters(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load saved encounters:", e);
    }
  }, []);

  const activePatient =
    patients.find((p) => p._id === selectedPatientId) || patients[0];

  const history =
    useQuery(
      api.queries.getHistory,
      selectedPatientId ? { patientId: selectedPatientId } : "skip",
    ) || [];

  const changePatient = (id) => {
    setSelectedPatientId(id);
    setCustomMessages([]);
    setContext({});
    setInput("");

    // Start a fresh Tambo thread for new patient
    if (useTamboAI && startNewThread) {
      startNewThread();
    }

    setTimeout(() => {
      if (!useTamboAI) {
        autoTrigger("init", id);
      }
    }, 100);
  };

  const generate = useAction(api.actions.generateUI);
  const saveConsultation = useMutation(api.mutations.saveConsultation);
  const messagesEndRef = useRef(null);

  // Scroll when messages change (either Tambo or custom)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tamboMessages, customMessages]);

  const handleSend = async () => {
    if (!input.trim() || !activePatient) return;

    // ============ TAMBO AI MODE ============
    if (useTamboAI) {
      console.group("🤖 Tambo AI Engine");
      console.log("Input:", input);
      console.log("Patient Context:", activePatient.name);
      console.groupEnd();

      // Add context about the patient for better component selection
      const enhancedInput = `[Patient: ${activePatient.name}, Age: ${activePatient.age}, Medications: ${activePatient.medications?.join(", ") || "none"}, Allergies: ${activePatient.allergies?.join(", ") || "none"}] ${input}`;

      setTamboInput(enhancedInput);
      setInput("");

      try {
        await tamboSubmit({
          streamResponse: true,
          contextKey: `patient-${activePatient._id}`,
        });
      } catch (e) {
        console.error("Tambo generation failed:", e);
      }
      return;
    }

    // ============ FALLBACK: RULE-BASED MODE ============
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setCustomMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGeneratingCustom(true);

    try {
      const plan = await generate({
        patientId: activePatient._id,
        input: input,
        context,
      });

      console.group("🏥 ClinicalFlow Rule Engine");
      console.log("Input:", input);
      console.log("Context:", context);
      console.log("Generated UI Plan:", plan);
      console.groupEnd();

      const assistantMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content: getAssistantResponse(plan),
        components: plan,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setCustomMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      console.error("Generation failed:", e);
      const errorMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content:
          "I encountered an error processing your request. Please try again.",
        components: [],
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setCustomMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  // Generate contextual response text based on components
  const getAssistantResponse = (plan) => {
    if (!plan || plan.length === 0) {
      return "I couldn't find specific tools for that request. Could you provide more details about the patient's condition?";
    }

    const componentTypes = plan.map((p) => p.type);

    if (componentTypes.includes("AlertCard")) {
      return "⚠️ I've detected important clinical considerations. Please review the alerts below:";
    }
    if (componentTypes.includes("VitalsForm")) {
      return "Let's capture the patient's vital signs. Please fill in the measurements:";
    }
    if (
      componentTypes.includes("BodyMap") ||
      componentTypes.includes("BodyMapAbdomen")
    ) {
      return "I've prepared a body map for pain localization. Tap the affected areas:";
    }
    if (
      componentTypes.includes("ScoreCalculator") ||
      componentTypes.includes("AppendicitisRiskCard")
    ) {
      return "Based on your description, I recommend calculating a clinical score:";
    }
    if (
      componentTypes.includes("LabsOrder") ||
      componentTypes.includes("LabsChecklist")
    ) {
      return "Here are the recommended laboratory tests for this presentation:";
    }
    if (componentTypes.includes("LineChart")) {
      return "I'm showing relevant historical trends for this patient:";
    }

    return `I've prepared ${plan.length} clinical tool${plan.length > 1 ? "s" : ""} based on your input:`;
  };

  // Detect scenario from input text to show contextual suggestions
  const detectScenario = (text) => {
    const lower = text.toLowerCase();
    if (
      lower.includes("breath") ||
      lower.includes("lung") ||
      lower.includes("respiratory") ||
      lower.includes("cough") ||
      lower.includes("wheez")
    ) {
      return "respiratory";
    }
    if (
      lower.includes("chest") ||
      lower.includes("heart") ||
      lower.includes("cardiac") ||
      lower.includes("palpitation")
    ) {
      return "cardiac";
    }
    if (
      lower.includes("abdom") ||
      lower.includes("stomach") ||
      lower.includes("belly") ||
      lower.includes("appendic") ||
      lower.includes("nausea")
    ) {
      return "abdominal";
    }
    if (
      lower.includes("child") ||
      lower.includes("infant") ||
      lower.includes("pediatric") ||
      lower.includes("baby") ||
      lower.includes("kid")
    ) {
      return "pediatric";
    }
    if (
      lower.includes("head") ||
      lower.includes("neuro") ||
      lower.includes("dizz") ||
      lower.includes("stroke") ||
      lower.includes("conscious")
    ) {
      return "neuro";
    }
    return "initial";
  };

  // Update scenario when input changes
  useEffect(() => {
    if (input.length > 5) {
      const detected = detectScenario(input);
      if (detected !== currentScenario) {
        setCurrentScenario(detected);
      }
    }
  }, [input, currentScenario]);

  // Get contextual suggestions based on current scenario
  const currentSuggestions = useMemo(() => {
    return (
      SUGGESTION_CATEGORIES[currentScenario] || SUGGESTION_CATEGORIES.initial
    );
  }, [currentScenario]);

  const handleContextUpdate = (type, data) => {
    setContext((prev) => ({ ...prev, [type]: data }));

    if (!useTamboAI && (type === "BodyMap" || type === "BodyMapAbdomen")) {
      autoTrigger(`Body region selected: ${data}`);
    }
  };

  // Auto-trigger for rule-based mode only
  const autoTrigger = async (text, overrideId = null) => {
    if (useTamboAI) return; // Skip in Tambo mode

    const pId = overrideId || activePatient?._id;
    if (!pId) return;

    setIsGeneratingCustom(true);
    try {
      const plan = await generate({ patientId: pId, input: text, context });

      const assistantMessage = {
        id: Date.now(),
        type: "assistant",
        content: getAssistantResponse(plan),
        components: plan,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setCustomMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      console.error(e);
    }
    setIsGeneratingCustom(false);
  };

  // Get current messages based on mode
  const currentMessages = useTamboAI ? tamboMessages : customMessages;

  const buildDetailedScribeFallback = (visitData, serverText, isAiGenerated) => {
    if (isAiGenerated && typeof serverText === "string" && serverText.trim()) {
      return serverText.trim();
    }

    const dateLabel = new Date().toLocaleString();
    const diagnosis = visitData?.diagnosis || visitData?.inferredDiagnosis;
    const doctorMessages = (visitData?.conversationHistory || [])
      .filter((entry) => entry?.role === "user" && entry?.content)
      .map((entry) => String(entry.content).trim())
      .filter(Boolean);

    const highlights = doctorMessages.slice(0, 4);
    const lines = [];

    lines.push("CLINICAL ENCOUNTER SUMMARY");
    lines.push(`${visitData?.patient?.name || "Unknown Patient"} | ${dateLabel}`);
    lines.push("");

    lines.push("SUMMARY");
    lines.push(
      `${visitData?.complaint || "Clinical evaluation performed."}${diagnosis ? ` Final impression: ${diagnosis}.` : ""}`,
    );
    lines.push("");

    lines.push("ASSESSMENT");
    lines.push(`Diagnosis: ${diagnosis || "Pending clinical confirmation"}`);
    if (visitData?.score?.score != null) {
      lines.push(
        `Clinical Score: ${visitData.score.score}/${visitData.score.maxScore || 10}`,
      );
    }
    lines.push("");

    if (visitData?.vitals) {
      lines.push("VITALS");
      lines.push(
        `Temp: ${visitData.vitals.temperature ?? "N/A"} F | BP: ${visitData.vitals.bloodPressure || "N/A"} | HR: ${visitData.vitals.heartRate ?? "N/A"} bpm`,
      );
      lines.push("");
    }

    if (visitData?.symptoms?.length) {
      lines.push("SYMPTOMS");
      lines.push(visitData.symptoms.join(", "));
      lines.push("");
    }

    if (visitData?.labsOrdered?.length) {
      lines.push("ORDERS / LABS");
      visitData.labsOrdered.forEach((lab) => lines.push(`- ${lab}`));
      lines.push("");
    }

    if (highlights.length) {
      lines.push("CONVERSATION HIGHLIGHTS");
      highlights.forEach((h, idx) => lines.push(`${idx + 1}. ${h}`));
      lines.push("");
    }

    if (visitData?.plan) {
      lines.push("PLAN");
      lines.push(visitData.plan);
      lines.push("");
    }

    const looksLikeTemplateSummary =
      typeof serverText === "string" &&
      (serverText.includes("════════") ||
        serverText.includes("PATIENT INFORMATION") ||
        serverText.includes("SESSION SUMMARY") ||
        serverText.includes("History: Patient presented with"));

    if (
      typeof serverText === "string" &&
      serverText.trim() &&
      !looksLikeTemplateSummary
    ) {
      lines.push("AI DETAIL");
      lines.push(serverText.trim());
      lines.push("");
    }

    return lines.join("\n").trim();
  };

  const generateAIScribeViaApi = async (visitData) => {
    const response = await fetch("/api/scribe-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitData }),
    });

    if (!response.ok) {
      let details = "";
      try {
        const data = await response.json();
        details = data?.error || data?.details || "";
      } catch {
        details = await response.text();
      }
      throw new Error(details || `AI summary request failed (${response.status})`);
    }

    const data = await response.json();
    return data?.summary || "";
  };

  const handleEndVisit = async () => {
    if (!activePatient) return;

    setSidebarTab("scribe");
    setShowAutoScribe(true);
    setIsScribeLoading(true);
    setScribeRequestedAt(Date.now());
    setScribeContent("");

    // DEBUG: Log the context state
    console.log("=== handleEndVisit DEBUG ===");
    console.log("Full context:", JSON.stringify(context, null, 2));

    // Map component context keys to scribe-friendly format
    const vitals = context.VitalsForm || context.vitals || null;
    const symptoms = context.SymptomToggles || context.symptoms || [];
    const bodyRegion = context.BodyMapAbdomen || context.BodyMap || null;
    const labsOrdered = context.LabsOrder || context.LabsChecklist || [];
    const score = context.ScoreCalculator || null;

    console.log("Mapped vitals:", vitals);
    console.log("Mapped symptoms:", symptoms);
    console.log("Mapped bodyRegion:", bodyRegion);
    console.log("Mapped labsOrdered:", labsOrdered);
    console.log("Mapped score:", score);

    const extractMessageText = (message) => {
      const content = message?.content ?? message?.text ?? "";
      if (typeof content === "string") return content;
      if (Array.isArray(content)) {
        return content
          .filter((part) => part?.type === "text")
          .map((part) => part?.text || "")
          .join(" ")
          .trim();
      }
      if (content && typeof content === "object") {
        if (typeof content.text === "string") return content.text;
        if (typeof content.content === "string") return content.content;
      }
      return "";
    };

    const stripPatientPrefix = (text = "") =>
      text.replace(/^\s*\[Patient:[^\]]+\]\s*/i, "").trim();

    // Extract chief complaint from normalized user conversation
    const userMessages = currentMessages.filter(
      (m) => (m.role || m.type) === "user",
    );
    const cleanedUserTexts = userMessages
      .map((m) => stripPatientPrefix(extractMessageText(m)))
      .filter(Boolean);

    console.log("User messages count:", userMessages.length);
    console.log("First user message:", userMessages[0]);

    const complaint = cleanedUserTexts[0] || null;
    const inferredDiagnosis =
      context?.ReferralLetterCard?.diagnosis ||
      context?.ReferralLetter?.diagnosis ||
      cleanedUserTexts
        .filter((text) =>
          /(diagnos|impression|likely|issue of|suspect|consistent with)/i.test(
            text,
          ),
        )
        .slice(-1)[0] ||
      null;

    console.log("Extracted complaint:", complaint);

    // Collect all conversation data for comprehensive scribe
    const conversationData = {
      ...context,
      vitals,
      symptoms: Array.isArray(symptoms) ? symptoms : [],
      bodyRegion,
      labsOrdered: Array.isArray(labsOrdered) ? labsOrdered : [],
      score,
      complaint,
      diagnosis: inferredDiagnosis,
      inferredDiagnosis,
      messageCount: currentMessages.length,
      conversationHistory: currentMessages.map((m) => ({
        role: m.role || m.type || "unknown",
        content: stripPatientPrefix(extractMessageText(m)),
        components:
          m.uiComponents?.map((c) => c.type) ||
          m.components?.map((c) => c.type) ||
          [],
      })),
      patient: {
        name: activePatient.name,
        age: activePatient.age,
        gender: activePatient.gender,
        bloodType: activePatient.bloodType,
        medications: activePatient.medications,
        allergies: activePatient.allergies,
        chronicConditions: activePatient.chronicConditions,
      },
      timestamp: new Date().toISOString(),
    };

    try {
      let detailedSummary = "";
      try {
        detailedSummary = await generateAIScribeViaApi(conversationData);
      } catch (e) {
        console.error("AI scribe API failed, using fallback summary:", e);
        detailedSummary = buildDetailedScribeFallback(conversationData, "", false);
      }

      if (!detailedSummary.trim()) {
        detailedSummary = buildDetailedScribeFallback(conversationData, "", false);
      }

      try {
        await saveConsultation({
          patientId: activePatient._id,
          date: new Date().toISOString(),
          chiefComplaint: complaint || "Clinical evaluation",
          diagnosis: inferredDiagnosis || undefined,
          notes: detailedSummary,
          vitals: vitals || undefined,
        });
      } catch (e) {
        console.error("Failed to save consultation:", e);
      }

      setScribeContent(detailedSummary);
    } finally {
      setIsScribeLoading(false);
    }
  };

  const handleSaveEncounter = () => {
    const encounter = {
      id: Date.now(),
      patientId: activePatient._id,
      patientName: activePatient.name,
      messages: useTamboAI ? tamboMessages : customMessages,
      context: context,
      savedAt: new Date().toISOString(),
    };
    setSavedEncounters((prev) => [...prev, encounter]);
    // Could persist to localStorage or Convex here
    localStorage.setItem(
      "clinicalflow_encounters",
      JSON.stringify([...savedEncounters, encounter]),
    );
  };

  const handleClearChat = () => {
    if (useTamboAI && startNewThread) {
      startNewThread();
    } else {
      setCustomMessages([]);
    }
    setContext({});
  };

  const handleRemoveMessage = (messageId) => {
    // Only works in custom mode - Tambo manages its own messages
    if (!useTamboAI) {
      setCustomMessages((prev) => prev.filter((m) => m.id !== messageId));
    }
  };

  if (!patients.length || !activePatient) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-clinical">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse-glow">
              <Stethoscope className="w-8 h-8 text-primary animate-float" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Initializing ClinicalFlow
            </h2>
            <p className="text-sm text-muted-foreground">
              Loading patient records...
            </p>
          </div>
          <div className="flex justify-center gap-1">
            <div
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClinicalContextProvider context={context} setContext={setContext}>
      <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary">
        {/* ZONE B: FIXED SIDEBAR (Left) - Patient Context */}
        <aside className="fixed top-0 left-0 w-[340px] h-screen border-r border-border bg-card flex flex-col z-50 shadow-xl">
          {/* Patient Header */}
          <div className="p-6 border-b border-border bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg shadow-primary/25">
                  <User size={24} strokeWidth={2} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-card animate-pulse" />
              </div>
              <div className="flex-1">
                <h1 className="font-bold text-lg leading-tight text-foreground">
                  {activePatient.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {activePatient.age} yo
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {activePatient.gender}
                  </span>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {activePatient.bloodType}
                  </span>
                </div>
              </div>
            </div>

            <PatientSidebar
              patients={patients}
              activePatientId={activePatient._id}
              onSelect={changePatient}
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setSidebarTab("patient")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-all ${
                sidebarTab === "patient"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <User className="w-4 h-4" />
              Patient
            </button>
            <button
              onClick={() => setSidebarTab("history")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-all ${
                sidebarTab === "history"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
            <button
              onClick={() => setSidebarTab("scribe")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-all ${
                sidebarTab === "scribe"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <FileText className="w-4 h-4" />
              Scribe
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5">
            {/* PATIENT TAB */}
            {sidebarTab === "patient" && (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="card-clinical p-4 text-center">
                    <Heart className="w-5 h-5 text-destructive mx-auto mb-1" />
                    <p className="text-clinical text-muted-foreground">
                      Blood Type
                    </p>
                    <p className="text-xl font-bold text-data">
                      {activePatient.bloodType}
                    </p>
                  </div>
                  <div className="card-clinical p-4 text-center">
                    <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-clinical text-muted-foreground">Age</p>
                    <p className="text-xl font-bold text-data">
                      {activePatient.age}
                    </p>
                  </div>
                </div>

                {/* Medications Section */}
                <div className="card-clinical p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="w-4 h-4 text-accent" />
                    <h4 className="text-clinical text-muted-foreground">
                      Active Medications
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activePatient.medications?.map((m) => (
                      <span
                        key={m}
                        className="px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-xs font-semibold text-accent-foreground"
                      >
                        {m}
                      </span>
                    ))}
                    {(!activePatient.medications ||
                      activePatient.medications.length === 0) && (
                      <span className="text-xs text-muted-foreground italic">
                        No active medications
                      </span>
                    )}
                  </div>
                </div>

                {/* Allergies Warning */}
                {activePatient.allergies?.length > 0 && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <h4 className="text-clinical text-destructive">
                        Allergies
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activePatient.allergies.map((a) => (
                        <span
                          key={a}
                          className="px-3 py-1.5 bg-destructive/20 rounded-lg text-xs font-bold text-destructive"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chronic Conditions */}
                {activePatient.chronicConditions?.length > 0 && (
                  <div className="card-clinical p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-orange-500" />
                      <h4 className="text-clinical text-muted-foreground">
                        Chronic Conditions
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activePatient.chronicConditions.map((c) => (
                        <span
                          key={c}
                          className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-xs font-semibold text-orange-600"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* HISTORY TAB */}
            {sidebarTab === "history" && (
              <>
                <div className="text-sm text-muted-foreground mb-4">
                  Previous visits and medical records
                </div>

                {/* Medical History from Convex */}
                {history && history.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Medical Records
                    </h4>
                    <div className="space-y-3">
                      {history.map((record) => (
                        <div
                          key={record._id}
                          className="card-clinical p-4 hover:border-primary/50 cursor-pointer transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-accent" />
                              <span className="font-semibold text-sm text-foreground">
                                {record.title || record.condition}
                              </span>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              {record.type}
                            </span>
                          </div>
                          {record.insight && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {record.insight}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Saved Encounters */}
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Session History
                </h4>
                {savedEncounters.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No saved encounters yet
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Click &quot;Save&quot; during a session to keep records
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedEncounters.map((enc) => (
                      <div
                        key={enc.id}
                        className="card-clinical p-4 hover:border-primary/50 cursor-pointer transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-sm text-foreground">
                              {enc.patientName}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(enc.savedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {enc.messages.length} messages recorded
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick History Stats */}
                <div className="card-clinical p-4 mt-4">
                  <h4 className="text-clinical text-muted-foreground mb-3">
                    Patient History Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Visits
                      </span>
                      <span className="font-semibold text-foreground">
                        {
                          savedEncounters.filter(
                            (e) => e.patientId === activePatient._id,
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Visit</span>
                      <span className="font-semibold text-foreground">
                        {savedEncounters.length > 0
                          ? new Date(
                              savedEncounters[savedEncounters.length - 1]
                                .savedAt,
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* SCRIBE TAB */}
            {sidebarTab === "scribe" && (
              <>
                <div className="text-sm text-muted-foreground mb-4">
                  AI-generated clinical documentation
                </div>

                {isScribeLoading ? (
                  <div className="space-y-4">
                    <div className="card-clinical p-4 border-primary/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                        <h4 className="text-clinical text-foreground font-semibold">
                          Preparing Doctor Note
                        </h4>
                      </div>
                      <div className="space-y-3">
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full w-1/2 bg-gradient-to-r from-primary to-accent animate-pulse" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Generating structured clinical summary from the visit
                          transcript...
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          This can take 10-30 seconds depending on note length.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : scribeContent ? (
                  <div className="space-y-4">
                    <div className="card-clinical p-4 border-primary/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <h4 className="text-clinical text-foreground font-semibold">
                          Latest Scribe
                        </h4>
                      </div>
                      <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto">
                        {scribeContent}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAutoScribe(true)}
                        className="btn-clinical btn-primary flex-1 gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Full
                      </button>
                      <button
                        onClick={() => setShowPrescription(true)}
                        className="btn-clinical btn-ghost flex-1 gap-2"
                      >
                        <Pill className="w-4 h-4" />
                        Prescribe
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No scribe generated yet
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Click &quot;End Visit & Scribe&quot; to generate
                    </p>
                    <button
                      onClick={handleEndVisit}
                      disabled={currentMessages.length === 0 || isScribeLoading}
                      className="btn-clinical btn-primary mt-4 gap-2 disabled:opacity-50"
                    >
                      {isScribeLoading ? (
                        <>
                          <div className="loading-spinner" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Scribe
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="ml-[340px] relative min-h-screen flex flex-col bg-dots-pattern bg-gradient-radial">
          {/* Top Header - Sticky */}
          <header className="sticky top-0 h-16 flex items-center justify-between px-8 border-b border-border glass z-40">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
                <Stethoscope className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-clinical text-muted-foreground">
                  ClinicalFlow
                </span>
                <h2 className="text-sm font-semibold text-foreground -mt-0.5">
                  Generative Workspace
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* AI Mode Toggle */}
              <button
                onClick={() => setUseTamboAI(!useTamboAI)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  useTamboAI
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                title={
                  useTamboAI
                    ? "Using Tambo AI (Dynamic)"
                    : "Using Rule-based Engine"
                }
              >
                <Zap
                  className={`w-3.5 h-3.5 ${useTamboAI ? "animate-pulse" : ""}`}
                />
                <span>{useTamboAI ? "Tambo AI" : "Rules"}</span>
              </button>

              {/* Generation Stage Indicator */}
              {useTamboAI && generationStage && generationStage !== "IDLE" && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                  <span>
                    {generationStage.replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-data">{currentMessages.length}</span>
                <span>messages</span>
              </div>

              <button
                onClick={handleSaveEncounter}
                disabled={currentMessages.length === 0}
                className="btn-clinical btn-ghost gap-2 disabled:opacity-50"
                title="Save Encounter"
              >
                <Save className="w-4 h-4" />
              </button>

              <button
                onClick={handleClearChat}
                disabled={currentMessages.length === 0}
                className="btn-clinical btn-ghost gap-2 disabled:opacity-50"
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleEndVisit}
                disabled={isScribeLoading || !activePatient}
                className="btn-clinical btn-primary gap-2 disabled:opacity-60 disabled:cursor-wait"
              >
                {isScribeLoading ? (
                  <>
                    <div className="loading-spinner" />
                    <span>Generating Scribe...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>End Visit & Scribe</span>
                  </>
                )}
              </button>
            </div>
          </header>

          {/* Chat Interface */}
          <div className="flex-1 overflow-y-auto p-6 pb-44">
            {currentMessages.length === 0 && (
              <div className="h-[60vh] flex flex-col items-center justify-center select-none">
                {/* Animated Hero */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center animate-float backdrop-blur-sm border border-primary/10">
                    {useTamboAI ? (
                      <Zap className="w-12 h-12 text-primary animate-pulse" />
                    ) : (
                      <Stethoscope className="w-12 h-12 text-primary" />
                    )}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-accent to-primary flex items-center justify-center shadow-lg">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* Title with patient context */}
                <h3 className="text-display text-2xl text-foreground mb-2">
                  {activePatient?.name
                    ? `Caring for ${activePatient.name}`
                    : "Start Clinical Session"}
                </h3>
                <p className="text-muted-foreground text-sm max-w-md text-center leading-relaxed mb-8">
                  {useTamboAI
                    ? "Tambo AI generates clinical tools dynamically based on your conversation. Try describing symptoms, ordering tests, or documenting findings."
                    : "Rule-based engine active. Describe symptoms to generate relevant clinical tools."}
                </p>

                {/* Quick Actions Row */}
                <div className="flex items-center gap-3 mb-6">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      onClick={() =>
                        setInput(`Order ${action.label.toLowerCase()}`)
                      }
                      className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Contextual Suggestions */}
                <div className="flex flex-wrap gap-3 justify-center max-w-xl">
                  {currentSuggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(suggestion.text)}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-card border border-border text-sm font-medium hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                    >
                      <suggestion.icon
                        className={`w-4 h-4 ${suggestion.color} group-hover:scale-110 transition-transform`}
                      />
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                        {suggestion.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="max-w-3xl mx-auto space-y-6">
              {/* TAMBO AI MODE: Render from thread.messages */}
              {useTamboAI &&
                tamboMessages.map((message, idx) => {
                  const isUser = message.role === "user";

                  // Extract text content from Tambo message
                  const textContent = Array.isArray(message.content)
                    ? message.content
                        .filter((part) => part.type === "text")
                        .map((part) => part.text)
                        .join("")
                    : String(message.content || "");

                  return (
                    <div
                      key={message.id || idx}
                      className={`animate-fade-in-up group ${isUser ? "flex justify-end" : ""}`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      {isUser ? (
                        // User Message Bubble
                        <div className="relative max-w-[80%]">
                          <div className="bg-primary text-primary-foreground px-5 py-3 rounded-2xl rounded-br-md shadow-lg">
                            <p className="text-sm">{textContent}</p>
                          </div>
                        </div>
                      ) : (
                        // Assistant Message with Tambo-rendered Component
                        <div className="relative">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                              <Zap className="w-5 h-5" />
                            </div>
                            <div className="flex-1 space-y-3">
                              {textContent && (
                                <div className="bg-card border border-border px-5 py-3 rounded-2xl rounded-tl-md shadow-sm prose prose-sm max-w-none">
                                  <Streamdown components={markdownComponents}>
                                    {textContent}
                                  </Streamdown>
                                </div>
                              )}

                              {/* Tambo AI Rendered Component */}
                              {message.renderedComponent && (
                                <div className="animate-fade-in-up">
                                  {message.renderedComponent}
                                </div>
                              )}

                              {/* Follow-up suggestions after AI response */}
                              {idx === tamboMessages.length - 1 &&
                                !isGenerating && (
                                  <div className="flex flex-wrap gap-2 pt-2">
                                    {currentSuggestions
                                      .slice(0, 3)
                                      .map((s, i) => (
                                        <button
                                          key={i}
                                          onClick={() => setInput(s.text)}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                                        >
                                          <s.icon className="w-3 h-3" />
                                          <span>{s.text}</span>
                                        </button>
                                      ))}
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* RULE-BASED MODE: Render from customMessages */}
              {!useTamboAI &&
                customMessages.map((message, idx) => (
                  <div
                    key={message.id}
                    className={`animate-fade-in-up group ${message.type === "user" ? "flex justify-end" : ""}`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {message.type === "user" ? (
                      // User Message Bubble
                      <div className="relative max-w-[80%]">
                        <div className="bg-primary text-primary-foreground px-5 py-3 rounded-2xl rounded-br-md shadow-lg">
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 block text-right">
                          {message.timestamp}
                        </span>
                        <button
                          onClick={() => handleRemoveMessage(message.id)}
                          className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                          title="Remove message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      // Assistant Message with Components
                      <div className="relative">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                            <Stethoscope className="w-5 h-5" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="bg-card border border-border px-5 py-3 rounded-2xl rounded-tl-md shadow-sm prose prose-sm max-w-none">
                              <Streamdown components={markdownComponents}>
                                {message.content}
                              </Streamdown>
                              <span className="text-[10px] text-muted-foreground mt-2 block not-prose">
                                {message.timestamp}
                              </span>
                            </div>

                            {/* Render Components - Grid for multiple, single for one */}
                            {message.components?.length > 0 && (
                              <div
                                className={`${message.components.length > 1 ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}`}
                              >
                                {message.components.map((c, i) => {
                                  const Comp = COMPONENT_MAP[c.type];
                                  if (!Comp) {
                                    console.warn(
                                      `Component ${c.type} not found in registry`,
                                    );
                                    return null;
                                  }

                                  return (
                                    <div
                                      key={i}
                                      className="animate-fade-in-up"
                                      style={{ animationDelay: `${i * 100}ms` }}
                                    >
                                      <Comp
                                        {...c.props}
                                        onChange={(data) =>
                                          handleContextUpdate(c.type, data)
                                        }
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Follow-up actions for rule-based mode */}
                            {idx === customMessages.length - 1 &&
                              !isGenerating && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                  {currentSuggestions
                                    .slice(0, 3)
                                    .map((s, i) => (
                                      <button
                                        key={i}
                                        onClick={() => setInput(s.text)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                                      >
                                        <s.icon className="w-3 h-3" />
                                        <span>{s.text}</span>
                                      </button>
                                    ))}
                                </div>
                              )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMessage(message.id)}
                          className="absolute -right-8 top-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                          title="Remove message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

              {/* Typing Indicator */}
              {isGenerating && (
                <div className="flex items-start gap-3 animate-fade-in">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shrink-0">
                    {useTamboAI ? (
                      <Zap className="w-5 h-5" />
                    ) : (
                      <Stethoscope className="w-5 h-5" />
                    )}
                  </div>
                  <div className="bg-card border border-border px-5 py-4 rounded-2xl rounded-tl-md">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div
                          className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {useTamboAI ? "AI generating..." : "Processing..."}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-8" />
            </div>
          </div>

          {/* FLOATING INPUT BAR - Properly Centered */}
          <div className="fixed bottom-6 left-[340px] right-0 px-8 z-40">
            <div className="max-w-2xl mx-auto">
              <div
                className={`
                    bg-card/95 backdrop-blur-xl p-3 rounded-2xl 
                    shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)]
                    dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]
                    flex items-center gap-3 transition-all duration-300
                    ${isGenerating ? "ring-4 ring-primary/20" : "hover:shadow-[0_12px_48px_rgba(0,0,0,0.16)]"}
                `}
              >
                <input
                  className="flex-1 bg-transparent outline-none text-base font-medium placeholder:text-muted-foreground py-2 pl-3"
                  placeholder="Describe symptoms or clinical intent..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  autoFocus
                />

                <button
                  onClick={handleSend}
                  disabled={isGenerating || !input.trim()}
                  className={`
                            px-6 py-3 rounded-xl font-semibold flex items-center gap-2.5 transition-all duration-200 flex-shrink-0
                            ${
                              isGenerating
                                ? "bg-muted text-muted-foreground cursor-wait"
                                : input.trim()
                                  ? "btn-primary shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                                  : "bg-muted text-muted-foreground cursor-not-allowed"
                            }
                        `}
                >
                  {isGenerating ? (
                    <>
                      <div className="loading-spinner" />
                      <span className="text-sm">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span className="text-sm">Generate</span>
                    </>
                  )}
                </button>
              </div>

              {/* Keyboard hint */}
              <p className="text-center text-xs text-muted-foreground mt-3 opacity-60">
                Press{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">
                  Enter
                </kbd>{" "}
                to generate
              </p>
            </div>
          </div>
        </main>

        <AutoScribeModal
          isOpen={showAutoScribe}
          onClose={() => setShowAutoScribe(false)}
          summary={scribeContent}
          isLoading={isScribeLoading}
          loadingStartedAt={scribeRequestedAt}
          patientName={activePatient?.name || "Patient"}
          onAction={(action) => {
            if (action === "prescription") {
              setShowPrescription(true);
            } else if (action === "referral") {
              // Add referral component to active workspace
              setCustomMessages((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  role: "assistant",
                  content: null,
                  uiComponents: [
                    {
                      zone: "active",
                      type: "ReferralLetter",
                      props: {
                        diagnosis: "Post-visit referral",
                        medications: context.patient?.medications || [],
                      },
                    },
                  ],
                },
              ]);
            } else if (action === "followup") {
              // Show follow-up scheduling UI
              setCustomMessages((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  role: "assistant",
                  content:
                    "📅 **Follow-Up Scheduling**\n\nPlease set the follow-up appointment for this patient.",
                  uiComponents: [],
                },
              ]);
            }
          }}
        />

        {/* Prescription Modal */}
        {showPrescription && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in-scale">
            <div className="bg-card w-full max-w-4xl rounded-3xl shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h2 className="text-display text-xl text-foreground">
                  E-Prescription
                </h2>
                <button
                  onClick={() => setShowPrescription(false)}
                  className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="p-6">
                <PrescriptionForm
                  patientName={context.patient?.name || "Unknown Patient"}
                  patientAllergies={context.patient?.allergies || []}
                  onSubmit={(data) => {
                    console.log("Prescription submitted:", data);
                    setShowPrescription(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ClinicalContextProvider>
  );
}
