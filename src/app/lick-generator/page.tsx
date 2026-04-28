"use client";

import { useState, useCallback } from "react";
import type { NoteName, Chord } from "@/types/music";
import type { Lick } from "@/types/music";
import { buildChord } from "@/lib/theory/chordEngine";
import { getScalesForChord } from "@/lib/theory/scaleEngine";
import { generateLick } from "@/lib/lick/lickGenerator";
import { ScoreViewer } from "@/components/score/ScoreViewer";
import { Button } from "@/components/ui/Button";

const CHORD_PRESETS = [
  "Dm7", "G7", "Cmaj7", "Am7", "Fm7", "Bb7", "Ebmaj7",
  "Bm7b5", "E7", "Am7", "Bdim7", "C7",
];

export default function LickGeneratorPage() {
  const [chordSymbol, setChordSymbol] = useState("Dm7");
  const [lick, setLick] = useState<Lick | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const chord = buildChord(chordSymbol);
  const scales = chord ? getScalesForChord(chord) : [];

  const generate = useCallback(() => {
    if (!chord || !scales.length) return;
    setLick(generateLick(chord, scales[0]));
  }, [chord, scales]);

  async function playLick() {
    if (!lick) return;
    setIsPlaying(true);
    try {
      const Tone = await import("tone");
      await Tone.start();
      const synth = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.5 },
      }).toDestination();

      const durationMap: Record<string, string> = {
        whole: "1n", half: "2n", quarter: "4n",
        eighth: "8n", sixteenth: "16n",
      };

      const now = Tone.now();
      let t = now;
      const bps = lick.bpm / 60;
      const beatSec = 1 / bps;

      for (const n of lick.notes) {
        const dur = durationMap[n.duration] ?? "8n";
        const beats = dur === "1n" ? 4 : dur === "2n" ? 2 : dur === "4n" ? 1
          : dur === "8n" ? 0.5 : 0.25;
        synth.triggerAttackRelease(
          `${n.note}${n.octave}`,
          `${beats * beatSec}`,
          t
        );
        t += beats * beatSec;
      }

      const totalSec = (t - now) * 1000 + 200;
      setTimeout(() => setIsPlaying(false), totalSec);
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
        <p className="text-xs uppercase tracking-widest text-jazz-muted mb-3">
          コードを選択
        </p>
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
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Scale info */}
      {chord && scales.length > 0 && (
        <div className="bg-jazz-card border border-white/10 rounded-2xl p-5 mb-6">
          <p className="text-xs uppercase tracking-widest text-jazz-muted mb-3">
            推奨スケール ({chord.symbol})
          </p>
          <div className="flex items-center gap-4">
            <div>
              <p className="font-bold text-jazz-text">
                {scales[0].root} {scales[0].name}
              </p>
              <p className="text-jazz-muted text-xs font-mono mt-1">
                {scales[0].notes.join(" · ")}
              </p>
            </div>
            <p className="text-jazz-muted text-sm flex-1 hidden md:block">
              {scales[0].description}
            </p>
          </div>
        </div>
      )}

      {/* Generate button */}
      <div className="flex gap-3 mb-8">
        <Button size="lg" onClick={generate} className="flex-1">
          Lickを生成
        </Button>
        {lick && (
          <Button
            size="lg"
            variant="secondary"
            onClick={playLick}
            disabled={isPlaying}
          >
            {isPlaying ? "▶ 演奏中..." : "▶ 演奏"}
          </Button>
        )}
      </div>

      {/* Score viewer */}
      {lick && (
        <div className="space-y-4">
          <div className="bg-jazz-card border border-white/10 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-jazz-muted mb-4">
              {lick.title}
            </p>
            <ScoreViewer abc={lick.abc} width={560} height={160} />
            <details className="mt-4">
              <summary className="text-jazz-muted text-xs cursor-pointer hover:text-jazz-text">
                ABC記法を表示
              </summary>
              <pre className="mt-2 text-xs text-jazz-muted font-mono bg-jazz-surface rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                {lick.abc}
              </pre>
            </details>
          </div>

          {/* Note list */}
          <div className="bg-jazz-card border border-white/10 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-jazz-muted mb-3">
              音符一覧
            </p>
            <div className="flex flex-wrap gap-2">
              {lick.notes.map((n, i) => (
                <div
                  key={i}
                  className="bg-jazz-surface rounded-lg px-3 py-1.5 text-center"
                >
                  <p className="font-mono font-bold text-jazz-gold text-sm">
                    {n.note}{n.octave}
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
