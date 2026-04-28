"use client";

import { useState, useCallback } from "react";
import { assignOctaves } from "@/lib/theory/noteFormat";

interface Props {
  /** Note names without octave e.g. ["C","E","G","B"] */
  notes: string[];
  /** "chord" plays simultaneously, "scale" plays sequentially */
  type?: "chord" | "scale";
  bpm?: number;
  label?: string;
}

export function PlayButton({ notes, type = "chord", bpm = 120, label }: Props) {
  const [playing, setPlaying] = useState(false);

  const play = useCallback(async () => {
    if (playing) return;
    setPlaying(true);
    try {
      const Tone = await import("tone");
      await Tone.start();

      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.6, release: 0.8 },
      }).toDestination();

      const scientific = assignOctaves(notes);
      const beatSec = 60 / bpm;

      if (type === "chord") {
        synth.triggerAttackRelease(scientific, "2n");
        setTimeout(() => { synth.dispose(); setPlaying(false); }, 1500);
      } else {
        const now = Tone.now();
        scientific.forEach((n, i) => {
          synth.triggerAttackRelease(n, "8n", now + i * beatSec * 0.5);
        });
        const totalMs = scientific.length * beatSec * 0.5 * 1000 + 500;
        setTimeout(() => { synth.dispose(); setPlaying(false); }, totalMs);
      }
    } catch {
      setPlaying(false);
    }
  }, [notes, type, bpm, playing]);

  return (
    <button
      onClick={play}
      disabled={playing}
      title={label ?? (type === "chord" ? "コードを再生" : "スケールを再生")}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-jazz-teal border border-blue-700 text-jazz-text text-sm font-semibold hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="text-base">{playing ? "⏸" : "▶"}</span>
      <span>{playing ? "再生中..." : (label ?? "再生")}</span>
    </button>
  );
}
