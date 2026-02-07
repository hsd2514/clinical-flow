import { DM_Sans, JetBrains_Mono, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import TamboRootClient from "./tambo-root-client";

// Premium font pairing: DM Sans for UI, Playfair for display, JetBrains Mono for data
const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "ClinicalFlow | AI-Powered EHR",
  description:
    "The Self-Building EHR - Generative UI for Medical Records that adapts in real-time",
  keywords: "EHR, Electronic Health Records, AI, Healthcare, Medical",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body
          className={`${dmSans.variable} ${playfair.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        >
          <TamboRootClient>{children}</TamboRootClient>
        </body>
      </html>
    </ClerkProvider>
  );
}
