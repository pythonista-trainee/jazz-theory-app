"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { type InstrumentId, DEFAULT_INSTRUMENT_ID } from "@/lib/audio/instruments";

interface InstrumentContextValue {
  instrumentId: InstrumentId;
  setInstrumentId: (id: InstrumentId) => void;
}

const InstrumentContext = createContext<InstrumentContextValue>({
  instrumentId: DEFAULT_INSTRUMENT_ID,
  setInstrumentId: () => {},
});

export function InstrumentProvider({ children }: { children: ReactNode }) {
  const [instrumentId, setInstrumentId] = useState<InstrumentId>(DEFAULT_INSTRUMENT_ID);
  return (
    <InstrumentContext.Provider value={{ instrumentId, setInstrumentId }}>
      {children}
    </InstrumentContext.Provider>
  );
}

export function useInstrument() {
  return useContext(InstrumentContext);
}
