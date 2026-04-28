"use client";

import { useState } from "react";
import type { NoteName } from "@/types/music";
import { buildProgression } from "@/lib/theory/chordEngine";
import { getProgressionScales } from "@/lib/theory/scaleEngine";
import { formatNote } from "@/lib/theory/noteFormat";
import { ChordScoreViewer } from "@/components/score/ChordScoreViewer";
import { PlayButton } from "@/components/ui/PlayButton";

const KEYS: NoteName[] = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const FIT_STARS: Record<number, string> = {
  5: "★★★★★", 4: "★★★★☆", 3: "★★★☆☆", 2: "★★☆☆☆", 1: "★☆☆☆☆",
};
const FIT_COLOR: Record<number, string> = {
  5: "text-yellow-300", 4: "text-emerald-400", 3: "text-blue-400",
  2: "text-orange-400", 1: "text-jazz-muted",
};

export default function ScaleMatcherPage() {
  const [key, setKey] = useState<NoteName>("C");
  const [expanded, setExpanded] = useState<number | null>(null);

  const progression = buildProgression("II-V-I", key);
  const scaleMaps = getProgressionScales(progression.chords);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-jazz-gold mb-2">Scale Matcher</h2>
        <p className="text-jazz-muted text-sm">
          II-V-I進行に対する推奨スケールと理論的根拠を確認しよう
        </p>
      </div>

      {/* Key picker */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {KEYS.map((k) => (
          <button
            key={k}
            onClick={() => { setKey(k); setExpanded(null); }}
            className={`w-12 h-12 rounded-xl font-bold text-sm border transition-all ${
              key === k
                ? "bg-jazz-accent border-jazz-accent text-white shadow-lg"
                : "bg-jazz-card border-white/10 text-jazz-muted hover:border-white/30"
            }`}
          >
            {formatNote(k)}
          </button>
        ))}
      </div>

      {/* Progression display */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {progression.chords.map((chord, i) => {
          const role = ["II", "V", "I"][i];
          return (
            <div key={chord.symbol} className="bg-jazz-card border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-jazz-muted text-xs uppercase mb-1">{role}</p>
              <p className="text-2xl font-black text-jazz-gold mb-2">
                {formatNote(chord.symbol)}
              </p>
              <div className="flex justify-center mb-3">
                <ChordScoreViewer notes={chord.notes} mode="chord" width={130} height={110} />
              </div>
              <div className="flex flex-wrap justify-center gap-1 mb-3">
                {chord.notes.map((n) => (
                  <span key={n} className="text-xs font-mono text-jazz-muted">
                    {formatNote(n)}
                  </span>
                ))}
              </div>
              <PlayButton notes={chord.notes} type="chord" label="再生" />
            </div>
          );
        })}
      </div>

      {/* Scale recommendations */}
      <div className="space-y-4">
        {scaleMaps.map((map, i) => (
          <div key={map.chordSymbol} className="bg-jazz-card border border-white/10 rounded-2xl overflow-hidden">
            <button
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-all text-left"
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <span className="text-xl font-black text-jazz-gold w-24">
                {formatNote(map.chordSymbol)}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-jazz-text">
                  {formatNote(map.primaryScale.root)} {map.primaryScale.name}
                </p>
                <p className="text-jazz-muted text-xs font-mono">
                  {map.primaryScale.notes.map(formatNote).join(" · ")}
                </p>
              </div>
              <span className={`font-mono text-sm ${FIT_COLOR[map.primaryScale.fitScore]}`}>
                {FIT_STARS[map.primaryScale.fitScore]}
              </span>
              <span className="text-jazz-muted text-sm">{expanded === i ? "▲" : "▼"}</span>
            </button>

            {expanded === i && (
              <div className="px-6 pb-6 border-t border-white/5">
                <p className="text-jazz-muted text-sm mt-4 mb-4">
                  {map.primaryScale.description}
                </p>

                {/* Scale staff + play */}
                <div className="flex flex-col items-start gap-3 mb-5">
                  <ChordScoreViewer
                    notes={map.primaryScale.notes}
                    mode="scale"
                    width={Math.min(80 + map.primaryScale.notes.length * 50, 520)}
                    height={130}
                  />
                  <PlayButton notes={map.primaryScale.notes} type="scale" label="スケールを聴く" />
                </div>

                <p className="text-xs uppercase tracking-widest text-jazz-muted mb-3">代替スケール</p>
                <div className="space-y-2">
                  {map.alternatives.map((alt) => (
                    <div key={alt.name} className="flex items-center gap-3 bg-jazz-surface rounded-lg px-4 py-2.5">
                      <span className="font-semibold text-jazz-text text-sm w-44">
                        {formatNote(alt.root)} {alt.name}
                      </span>
                      <span className={`text-xs ${FIT_COLOR[alt.fitScore]}`}>
                        {FIT_STARS[alt.fitScore]}
                      </span>
                      <span className="text-jazz-muted text-xs flex-1">{alt.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
