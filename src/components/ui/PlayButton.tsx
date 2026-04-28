"use client";

import { useState, useCallback } from "react";
import { assignOctaves } from "@/lib/theory/noteFormat";
import { getInstrument } from "@/lib/audio/instruments";
import { useInstrument } from "@/context/InstrumentContext";

interface Props {
  notes: string[];
  type?: "chord" | "scale";
  bpm?: number;
  label?: string;
}

export function PlayButton({ notes, type = "chord", bpm = 120, label }: Props) {
  const [playing, setPlaying] = useState(false);
  const { instrumentId } = useInstrument();

  const play = useCallback(async () => {
    if (playing) return;
    setPlaying(true);
    try {
      const Tone = await import("tone");
      await Tone.start();

      const inst = getInstrument(instrumentId);
      const synth = inst.createSynth(Tone);

      // Bass instrument: drop an octave
      const startOctave = instrumentId === "bass" ? 3 : 4;
      const scientific = assignOctaves(notes, startOctave);
      const beatSec = 60 / bpm;

      if (type === "chord") {
        synth.triggerAttackRelease(scientific, inst.chordDuration);
        const durMs = durationToMs(inst.chordDuration, bpm) + 600;
        setTimeout(() => { synth.dispose(); setPlaying(false); }, durMs);
      } else {
        const now = Tone.now();
        // 音符の間隔を固定し、発音時間はその70%に制限して音が繋がらないようにする
        const noteIntervalSec = beatSec * 0.55;
        const noteDurSec = noteIntervalSec * 0.7;
        scientific.forEach((n, i) => {
          synth.triggerAttackRelease(n, noteDurSec, now + i * noteIntervalSec);
        });
        const totalMs = scientific.length * noteIntervalSec * 1000 + 800;
        setTimeout(() => { synth.dispose(); setPlaying(false); }, totalMs);
      }
    } catch {
      setPlaying(false);
    }
  }, [notes, type, bpm, playing, instrumentId]);

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

function durationToMs(dur: string, bpm: number): number {
  const beatMs = (60 / bpm) * 1000;
  const map: Record<string, number> = {
    "1n": beatMs * 4,
    "2n": beatMs * 2,
    "4n": beatMs,
    "8n": beatMs / 2,
  };
  return map[dur] ?? beatMs * 2;
}
