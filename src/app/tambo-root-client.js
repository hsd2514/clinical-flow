"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { TamboProvider } from "@tambo-ai/react";
import { components } from "@/lib/tambo";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL ?? "",
);

export default function TamboRootClient({ children }) {
  return (
    <ConvexProvider client={convex}>
      <TamboProvider
        apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY}
        components={components}
        tools={[]}
      >
        {children}
      </TamboProvider>
    </ConvexProvider>
  );
}

