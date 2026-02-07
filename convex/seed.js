import { mutation } from "./_generated/server";

export const seed = mutation({
  handler: async (ctx) => {
    // 0. Clear existing data (optional, but good for clean slate during dev)
    // For now, we'll just check if *any* exist to avoid double-seeding if not cleared.
    // 0. Clear existing data to ensure fresh start with new schema/patients
    const existingPatients = await ctx.db.query("patients").collect();
    for (const p of existingPatients) {
      await ctx.db.delete(p._id);
    }
    const existingHistory = await ctx.db.query("medicalHistory").collect();
    for (const h of existingHistory) {
      await ctx.db.delete(h._id);
    }
    console.log("Cleared existing data.");

    // 1. Define Patients
    const patientsData = [
      {
        name: "Harsh Dange",
        age: 32,
        gender: "Male",
        bloodType: "O+",
        medications: ["Warfarin"],
        allergies: ["Penicillin"],
        chronicConditions: ["Asthma"],
      },
      {
        name: "Sarah Connor",
        age: 55,
        gender: "Female",
        bloodType: "A-",
        medications: ["Lisinopril", "Atorvastatin"],
        allergies: ["Sulfa Drugs"],
        chronicConditions: ["Hypertension", "Hyperlipidemia"],
        metadata: {
            baselineBP: "155/95", // Sarah's personal baseline
            riskLevel: "High (Cardiac)"
        }
      },
      {
        name: "John Wick",
        age: 45,
        gender: "Male",
        bloodType: "AB+",
        medications: ["Ibuprofen"],
        allergies: [],
        chronicConditions: ["Chronic Back Pain", "Multiple Fractures"],
        metadata: {
            hardware: ["Distal Tibia Rod (Right)", "L5-S1 Spinal Plate"], // Hardware data
            lastPainScore: 7
        }
      }
    ];

    const patientMap = {}; // name -> id

    // 2. Insert Patients
    for (const p of patientsData) {
      const id = await ctx.db.insert("patients", p);
      patientMap[p.name] = id;
      console.log(`Created patient: ${p.name}`);
    }

    // 3. Insert Medical History for Harsh (The Standard Demo)
    const harshId = patientMap["Harsh Dange"];
    await ctx.db.insert("medicalHistory", {
      patientId: harshId,
      type: "chart",
      title: "Asthma Control (PEF)",
      condition: "Asthma", // Added required field
      insight: "Peak flow improved by 15% over 6 months.",
      date: "2023-10-01",
      data: { values: [350, 360, 340, 380, 390, 400] }
    });
    await ctx.db.insert("medicalHistory", {
      patientId: harshId,
      type: "text",
      title: "Surgical History",
      condition: "Surgery",
      insight: "Cholecystectomy (2019). No complications.",
      date: "2019-05-15",
      data: {}
    });

    // 4. Insert Medical History for Sarah (The Cardiac Case)
    const sarahId = patientMap["Sarah Connor"];
    await ctx.db.insert("medicalHistory", {
      patientId: sarahId,
      type: "chart",
      title: "Blood Pressure (Systolic)",
      condition: "Hypertension", // Added required field
      insight: "BP stabilizing but still elevated in mornings.",
      date: "2024-01-10",
      data: { values: [160, 155, 150, 148, 142, 138] }
    });

    // 5. Insert Medical History for John (The Trauma Case)
    const johnId = patientMap["John Wick"];
    await ctx.db.insert("medicalHistory", {
      patientId: johnId,
      type: "text",
      title: "Orthopedic Summary",
      condition: "Trauma", // Added required field
      insight: "History of multiple high-impact fractures. Metal rods in tibia.",
      date: "2021-08-20",
      data: {}
    });

    return "Seeding Complete with 3 Patients!";
  },
});
