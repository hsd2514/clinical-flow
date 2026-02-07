<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Convex-Backend-FF6B6B?style=for-the-badge&logo=convex" alt="Convex" />
  <img src="https://img.shields.io/badge/Tambo_AI-Generative_UI-7C3AED?style=for-the-badge" alt="Tambo AI" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
</p>

<h1 align="center">🏥 ClinicalFlow</h1>

<p align="center">
  <strong>The Self-Building EHR — A Generative UI for Medical Records</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-hackathon-brightgreen" alt="Status" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
  <img src="https://img.shields.io/badge/PRs-welcome-orange" alt="PRs Welcome" />
</p>

---

## 🎯 The Problem

Doctors suffer from **"Click Fatigue"** — navigating through endless static forms, dropdown menus, and rigid interfaces that don't adapt to the patient's actual condition. Current EHR systems are built for billing, not for care.

## 💡 The Solution

**ClinicalFlow** generates the perfect UI in real-time based on what the doctor is actually doing. No more hunting for forms — describe the patient's condition, and the right tools appear automatically.

---

## ✨ Features

| Feature                        | Description                                                 |
| ------------------------------ | ----------------------------------------------------------- |
| 🧠 **Generative UI**           | AI generates clinical tools based on natural language input |
| 🔄 **Hybrid Mode**             | Toggle between Tambo AI and rule-based engine               |
| 📋 **Smart Components**        | 20+ medical-grade UI components                             |
| 🔬 **Drug Interaction Alerts** | Real-time safety warnings                                   |
| 📊 **Medical History**         | Track patient conditions over time                          |
| ✍️ **Auto-Scribe**             | FastRouter AI summaries (`z-ai/glm-4.7`)                    |
| 💊 **E-Prescription**          | Post-visit prescription workflow                            |
| 👥 **Multi-Patient**           | Switch between patients seamlessly                          |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLINICALFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐   │
│  │   Zone A      │  │   Zone B      │  │      Zone C       │   │
│  │   (Input)     │  │  (Sidebar)    │  │  (Active Work)    │   │
│  │               │  │               │  │                   │   │
│  │  Doctor types │  │  Patient +    │  │  Generated UI     │   │
│  │  symptoms     │  │  History +    │  │  components       │   │
│  │               │  │  Scribe       │  │  appear here      │   │
│  └───────────────┘  └───────────────┘  └───────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      TAMBO AI / CONVEX                          │
│                   (Generative Component Engine)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/clinicalflow.git
cd clinicalflow

# Install dependencies
npm install

# Configure environment
# .env.local
# FASTROUTER_API_KEY=your_key_here
# ENABLE_AI_SUMMARY=true
# (Keep TAMBO_API_KEY/NEXT_PUBLIC_TAMBO_API_KEY for frontend Tambo features)

# Start Convex backend
npx convex dev

# In another terminal, start the frontend
npm run dev
```

### Seed the Database

```bash
# Run the seed script to add demo patients
npx convex run seed:seed
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🧩 Component Registry

ClinicalFlow includes 20+ specialized medical components:

| Component           | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `AlertCard`         | Drug interaction and safety warnings       |
| `VitalsForm`        | Temperature, BP, heart rate input          |
| `BodyMapAbdomen`    | Interactive abdominal quadrant selector    |
| `SymptomToggles`    | Quick-tap symptom selection                |
| `ScoreCalculator`   | Alvarado, HEART, and other clinical scores |
| `LineChart`         | Trend visualization for metrics            |
| `LabsOrder`         | Order laboratory tests                     |
| `ReferralLetter`    | Generate specialist referrals              |
| `ConsentForm`       | Digital consent documentation              |
| `PrescriptionForm`  | E-prescription with common medications     |
| `AutoScribeSummary` | AI-generated visit summary                 |

---

## 🛠️ Tech Stack

| Layer         | Technology                                |
| ------------- | ----------------------------------------- |
| **Frontend**  | Next.js 16 (App Router), React 19         |
| **Styling**   | Tailwind CSS 4.0                          |
| **Backend**   | Convex (Real-time BaaS)                   |
| **AI Engine** | Tambo AI (generative UI) + FastRouter (scribe summaries) |
| **Icons**     | Lucide React                              |
| **Fonts**     | DM Sans, Playfair Display, JetBrains Mono |

---

## 📁 Project Structure

```
clinicalflow/
├── src/
│   ├── app/
│   │   ├── page.js          # Main dashboard
│   │   ├── layout.js        # Root layout
│   │   └── globals.css      # Design system
│   ├── components/
│   │   └── registry/        # 20+ medical components
│   └── lib/
│       └── tambo.ts         # Tambo component registry
├── convex/
│   ├── schema.js            # Database schema
│   ├── actions.js           # Server actions
│   ├── queries.js           # Data queries
│   └── seed.js              # Demo data
└── public/
```

---

## 🎮 Demo Scenarios

Try these inputs to see the generative UI in action:

| Input                                    | Generated Components                            |
| ---------------------------------------- | ----------------------------------------------- |
| `"Patient has abdominal pain"`           | BodyMapAbdomen, SymptomToggles, ScoreCalculator |
| `"Check vitals"`                         | VitalsForm                                      |
| `"Prescribe aspirin"` + Warfarin patient | AlertCard (drug interaction warning!)           |
| `"Order CBC and BMP"`                    | LabsOrder                                       |
| `"Refer to cardiology"`                  | ReferralLetter                                  |

---

## ⚙️ AI Summary Config

Scribe generation uses an OpenAI-compatible client pointed at FastRouter:

- `baseURL`: `https://go.fastrouter.ai/api/v1`
- `model`: `z-ai/glm-4.7`
- env var: `FASTROUTER_API_KEY`

Optional toggle for backend-generated discharge summary path:

- `ENABLE_AI_SUMMARY=true`

---

## 📌 Current Gaps

- `PainSlider` is generated by backend rules but not yet wired in the dashboard component map.
- Scribe modal `Export` and `Print` buttons are currently UI-only.
- Some post-scribe actions (`Referral`/`Follow-Up`) still use inconsistent message shape and need wiring cleanup.

---

## 🔐 Safety Features

- ⚠️ **Drug Interaction Alerts** — Real-time warnings when prescribing conflicting medications
- 🔴 **Allergy Warnings** — Visual indicators for patient allergies
- ✅ **Consent Tracking** — Digital consent with signature capture
- 📝 **Audit Trail** — All actions logged for compliance

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Tambo AI](https://tambo.co) — Generative UI Framework
- [Convex](https://convex.dev) — Real-time Backend
- [Next.js](https://nextjs.org) — React Framework
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [Lucide](https://lucide.dev) — Icons

---

<p align="center">
  <strong>Built with ❤️ for the healthcare community</strong>
</p>

<p align="center">
  <a href="#top">⬆️ Back to Top</a>
</p>
