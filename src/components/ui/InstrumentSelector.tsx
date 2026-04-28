"use client";

import { useState } from "react";
import { INSTRUMENTS } from "@/lib/audio/instruments";
import { useInstrument } from "@/context/InstrumentContext";

export function InstrumentSelector() {
  const { instrumentId, setInstrumentId } = useInstrument();
  const [open, setOpen] = useState(false);

  const current = INSTRUMENTS.find((i) => i.id === instrumentId)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-jazz-card border border-white/10 text-jazz-text text-sm hover:border-white/30 transition-all"
      >
        <span>{current.emoji}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <span className="text-jazz-muted text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-20 w-48 bg-jazz-card border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            {INSTRUMENTS.map((inst) => (
              <button
                key={inst.id}
                onClick={() => { setInstrumentId(inst.id); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all hover:bg-white/5 ${
                  inst.id === instrumentId
                    ? "text-jazz-gold bg-jazz-accent/10 border-l-2 border-jazz-accent"
                    : "text-jazz-text"
                }`}
              >
                <span className="text-base">{inst.emoji}</span>
                <span>{inst.label}</span>
                {inst.id === instrumentId && (
                  <span className="ml-auto text-jazz-accent text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
