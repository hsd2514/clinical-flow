"use client";
import { createContext, useContext, useCallback } from "react";

/**
 * ClinicalContext - Shared context for clinical data collection
 *
 * This context allows registry components to report their state changes
 * directly, regardless of how they're rendered (rule-based or Tambo AI).
 *
 * Components rendered by Tambo AI don't receive onChange handlers, so they
 * need a way to report their data "upward". This context provides that bridge.
 */

const ClinicalContext = createContext({
  updateContext: () => {},
  getContext: () => ({}),
});

/**
 * Hook for registry components to report their data
 * @returns {Object} { updateContext, getContext }
 */
export function useClinicalContext() {
  return useContext(ClinicalContext);
}

/**
 * Provider component - wrap around your app/page
 */
export function ClinicalContextProvider({ children, context, setContext }) {
  const updateContext = useCallback(
    (type, data) => {
      setContext((prev) => ({ ...prev, [type]: data }));
    },
    [setContext],
  );

  const getContext = useCallback(() => context, [context]);

  return (
    <ClinicalContext.Provider value={{ updateContext, getContext }}>
      {children}
    </ClinicalContext.Provider>
  );
}

export default ClinicalContext;
