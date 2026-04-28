"use client";

import { useState, useCallback } from "react";
import type { Lick } from "@/types/music";
import { buildChord } from "@/lib/theory/chordEngine";
import { getScalesForChord } from "@/lib/theory/scaleEngine";
import { generateLick } from "@/lib/lick/lickGenerator";
import { LickScoreViewer } from "@/components/score/LickScoreViewer";
import { Button } from "@/components/ui/Button";
import { formatNote } from "@/lib/theory/noteFormat";
import { useInstrument } from "@/context/InstrumentContext";
import { getInstrument } from "@/lib/audio/instruments";

const CHORD_PRESETS = [
  "Dm7", "G7", "Cmaj7", "Am7", "Fm7", "Bb7", "Ebmaj7",
  "Bm7b5", "E7", "Bdim7", "C7", "Abmaj7",
];

const DURATION_BEATS: Record<string, number> = {
  whole: 4, half: 2, quarter: 1, eighth: 0.5, sixteenth: 0.25,
};

export default function LickGeneratorPage() {
  const [chordSymbol, setChordSymbol] = useState("Dm7");
  const [lick, setLick] = useState<Lick | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { instrumentId } = useInstrument();

  const chord = buildChord(chordSymbol);
  const scales = chord ? getScalesForChord(chord) : [];

  const generate = useCallback(() => {
    if (!chord || !scales.length) return;
    setLick(generateLick(chord, scales[0]));
  }, [chord, scales]);

  async function playLick() {
    if (!lick || isPlaying) return;
    setIsPlaying(true);
    try {
      const Tone = await import("tone");
      await Tone.start();

      const inst = getInstrument(instrumentId);
      const synth = inst.createSynth(Tone);

      const bps = lick.bpm / 60;
      const beatSec = 1 / bps;
      const now = Tone.now();
      let t = now;

      for (const n of lick.notes) {
        const beats = DURATION_BEATS[n.duration] ?? 0.5;
        const durSec = beats * beatSec;
        // 音が繋がらないよう発音時間を95%に抑える
        synth.triggerAttackRelease(`${n.note}${n.octave}`, durSec * 0.95, t);
        t += durSec;
      }

      const totalMs = (t - now) * 1000 + 500;
      setTimeout(() => { synth.dispose(); setIsPlaying(false); }, totalMs);
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-jazz-gold mb-2">Lick Generator</h2>
        <p className="text-jazz-muted text-sm">
          コード+スケールから常套句（Lick）を自動生成・演奏する
        </p>
      </div>

      {/* Chord picker */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-jazz-muted mb-3">コードを選択</p>
        <div className="flex flex-wrap gap-2">
          {CHORD_PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => { setChordSymbol(c); setLick(null); }}
              className={`px-4 py-2 rounded-xl font-mono font-bold text-sm border transition-all ${
                chordSymbol === c
                  ? "bg-jazz-accent border-jazz-accent text-white"
                  : "bg-jazz-card border-white/10 text-jazz-muted hover:border-white/30"
              }`}
            >
              {formatNote(c)}
            </button>
          ))}
        </div>
      </div>

      {/* Scale info */}
      {chord && scales.length > 0 && (
        <div className="bg-jazz-card border border-white/10 rounded-2xl p-5 mb-6">
          <p className="text-xs uppercase tracking-widest text-jazz-muted mb-2">
            推奨スケール ({formatNote(chord.symbol)})
          </p>
          <div className="flex items-center gap-4">
            <div>
              <p className="font-bold text-jazz-text">
                {formatNote(scales[0].root)} {scales[0].name}
              </p>
              <p className="text-jazz-muted text-xs font-mono mt-1">
                {scales[0].notes.map(formatNote).join(" · ")}
              </p>
            </div>
            <p className="text-jazz-muted text-sm flex-1 hidden md:block">
              {scales[0].description}
            </p>
          </div>
        </div>
      )}

      {/* Generate + Play buttons */}
      <div className="flex gap-3 mb-8">
        <Button size="lg" onClick={generate} className="flex-1">
          Lickを生成
        </Button>
        {lick && (
          <Button size="lg" variant="secondary" onClick={playLick} disabled={isPlaying}>
            {isPlaying ? "⏸ 演奏中..." : "▶ 演奏"}
          </Button>
        )}
      </div>

      {/* Score */}
      {lick && (
        <div className="space-y-4">
          <div className="bg-jazz-card border border-white/10 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-jazz-muted mb-4">
              {formatNote(lick.title)}
            </p>
            <LickScoreViewer notes={lick.notes} width={560} height={160} />

            {/* Note badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {lick.notes.map((n, i) => (
                <div key={i} className="bg-jazz-surface rounded-lg px-3 py-1.5 text-center">
                  <p className="font-mono font-bold text-jazz-gold text-sm">
                    {formatNote(n.note)}{n.octave}
                  </p>
                  <p className="text-jazz-muted text-xs">{n.duration}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
