"use client";

import { InstrumentProvider } from "@/context/InstrumentContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <InstrumentProvider>{children}</InstrumentProvider>;
}
