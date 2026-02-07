"use client";

import { useMemo } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { TamboProvider } from "@tambo-ai/react";
import { components } from "@/lib/tambo";

export default function TamboRootClient({ children }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const tamboApiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;

  const convex = useMemo(() => {
    if (!convexUrl) return null;
    return new ConvexReactClient(convexUrl);
  }, [convexUrl]);

  if (!convex) {
    return <>{children}</>;
  }

  return (
    <ConvexProvider client={convex}>
      {tamboApiKey ? (
        <TamboProvider apiKey={tamboApiKey} components={components} tools={[]}>
          {children}
        </TamboProvider>
      ) : (
        children
      )}
    </ConvexProvider>
  );
}

