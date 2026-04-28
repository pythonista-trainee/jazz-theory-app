"use client";

import { useState } from "react";
import type { NoteName } from "@/types/music";
import { buildProgression } from "@/lib/theory/chordEngine";
import { getProgressionScales } from "@/lib/theory/scaleEngine";
import { Button } from "@/components/ui/Button";

const KEYS: NoteName[] = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const FIT_STARS: Record<number, string> = {
  5: "★★★★★",
  4: "★★★★☆",
  3: "★★★☆☆",
  2: "★★☆☆☆",
  1: "★☆☆☆☆",
};

const FIT_COLOR: Record<number, string> = {
  5: "text-yellow-300",
  4: "text-emerald-400",
  3: "text-blue-400",
  2: "text-orange-400",
  1: "text-jazz-muted",
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
            {k}
          </button>
        ))}
      </div>

      {/* Progression display */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {progression.chords.map((chord, i) => {
          const role = ["II", "V", "I"][i];
          return (
            <div
              key={chord.symbol}
              className="bg-jazz-card border border-white/10 rounded-2xl p-5 text-center"
            >
              <p className="text-jazz-muted text-xs uppercase mb-1">{role}</p>
              <p className="text-3xl font-black text-jazz-gold">{chord.symbol}</p>
              <p className="text-jazz-muted text-xs mt-1 font-mono">
                {chord.notes.join(" · ")}
              </p>
            </div>
          );
        })}
      </div>

      {/* Scale recommendations */}
      <div className="space-y-4">
        {scaleMaps.map((map, i) => (
          <div
            key={map.chordSymbol}
            className="bg-jazz-card border border-white/10 rounded-2xl overflow-hidden"
          >
            <button
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-all text-left"
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <span className="text-xl font-black text-jazz-gold w-20">
                {map.chordSymbol}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-jazz-text">
                  {map.primaryScale.root} {map.primaryScale.name}
                </p>
                <p className="text-jazz-muted text-xs font-mono">
                  {map.primaryScale.notes.join(" · ")}
                </p>
              </div>
              <span className={`font-mono text-sm ${FIT_COLOR[map.primaryScale.fitScore]}`}>
                {FIT_STARS[map.primaryScale.fitScore]}
              </span>
              <span className="text-jazz-muted text-sm">{expanded === i ? "▲" : "▼"}</span>
            </button>

            {expanded === i && (
              <div className="px-6 pb-5 border-t border-white/5">
                <p className="text-jazz-muted text-sm mt-4 mb-4">
                  {map.primaryScale.description}
                </p>
                <p className="text-xs uppercase tracking-widest text-jazz-muted mb-3">
                  代替スケール
                </p>
                <div className="space-y-2">
                  {map.alternatives.map((alt) => (
                    <div
                      key={alt.name}
                      className="flex items-center gap-3 bg-jazz-surface rounded-lg px-4 py-2.5"
                    >
                      <span className="font-semibold text-jazz-text text-sm w-40">
                        {alt.root} {alt.name}
                      </span>
                      <span className={`text-xs ${FIT_COLOR[alt.fitScore]}`}>
                        {FIT_STARS[alt.fitScore]}
                      </span>
                      <span className="text-jazz-muted text-xs flex-1">
                        {alt.description}
                      </span>
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
