"use client";

import { useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
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
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {tamboApiKey ? (
        <TamboProvider apiKey={tamboApiKey} components={components} tools={[]}>
          {children}
        </TamboProvider>
      ) : (
        children
      )}
    </ConvexProviderWithClerk>
  );
}

