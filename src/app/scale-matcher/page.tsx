"use client";

import { useState } from "react";
import type { NoteName } from "@/types/music";
import type { Scale } from "@/types/music";
import { buildProgression } from "@/lib/theory/chordEngine";
import { getProgressionScales } from "@/lib/theory/scaleEngine";
import { formatNote } from "@/lib/theory/noteFormat";
import { ChordScoreViewer } from "@/components/score/ChordScoreViewer";
import { PlayButton } from "@/components/ui/PlayButton";

const KEYS: NoteName[] = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];

const FIT_STARS: Record<number, string> = {
  5:"★★★★★", 4:"★★★★☆", 3:"★★★☆☆", 2:"★★☆☆☆", 1:"★☆☆☆☆",
};
const FIT_COLOR: Record<number, string> = {
  5:"text-yellow-300", 4:"text-emerald-400", 3:"text-blue-400",
  2:"text-orange-400", 1:"text-jazz-muted",
};

export default function ScaleMatcherPage() {
  const [key, setKey] = useState<NoteName>("C");
  const [expanded, setExpanded] = useState<number | null>(null);
  // 各コードに対して選択中のスケールインデックス
  const [selectedScaleIdx, setSelectedScaleIdx] = useState<number[]>([0, 0, 0]);

  const progression = buildProgression("II-V-I", key);
  const scaleMaps = getProgressionScales(progression.chords);

  function getActiveScale(i: number): Scale {
    const map = scaleMaps[i];
    const idx = selectedScaleIdx[i] ?? 0;
    return idx === 0 ? map.primaryScale : map.alternatives[idx - 1];
  }

  function setScaleIdx(chordIdx: number, scaleIdx: number) {
    setSelectedScaleIdx((prev) => {
      const next = [...prev];
      next[chordIdx] = scaleIdx;
      return next;
    });
  }

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
            onClick={() => { setKey(k); setExpanded(null); setSelectedScaleIdx([0,0,0]); }}
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

      {/* Progression */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {progression.chords.map((chord, i) => {
          const role = ["II","V","I"][i];
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
                  <span key={n} className="text-xs font-mono text-jazz-muted">{formatNote(n)}</span>
                ))}
              </div>
              <PlayButton notes={chord.notes} type="chord" label="再生" />
            </div>
          );
        })}
      </div>

      {/* Scale recommendations */}
      <div className="space-y-4">
        {scaleMaps.map((map, i) => {
          const activeScale = getActiveScale(i);
          const allScales = [map.primaryScale, ...map.alternatives];

          return (
            <div key={map.chordSymbol} className="bg-jazz-card border border-white/10 rounded-2xl overflow-hidden">
              {/* Header row */}
              <button
                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-all text-left"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <span className="text-xl font-black text-jazz-gold w-24">
                  {formatNote(map.chordSymbol)}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-jazz-text">
                    {formatNote(activeScale.root)} {activeScale.name}
                  </p>
                  <p className="text-jazz-muted text-xs font-mono">
                    {activeScale.notes.map(formatNote).join(" · ")}
                  </p>
                </div>
                <span className={`font-mono text-sm hidden sm:inline ${FIT_COLOR[activeScale.fitScore]}`}>
                  {FIT_STARS[activeScale.fitScore]}
                </span>
                <span className="text-jazz-muted text-sm">{expanded === i ? "▲" : "▼"}</span>
              </button>

              {expanded === i && (
                <div className="px-6 pb-6 border-t border-white/5">
                  {/* Scale selector tabs */}
                  <div className="flex flex-wrap gap-2 mt-4 mb-4">
                    {allScales.map((sc, si) => (
                      <button
                        key={sc.name}
                        onClick={() => setScaleIdx(i, si)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          selectedScaleIdx[i] === si
                            ? "bg-jazz-accent border-jazz-accent text-white"
                            : "bg-jazz-surface border-white/10 text-jazz-muted hover:border-white/30 hover:text-jazz-text"
                        }`}
                      >
                        <span>{formatNote(sc.root)} {sc.name}</span>
                        <span className={`ml-1.5 ${FIT_COLOR[sc.fitScore]}`}>
                          {"★".repeat(sc.fitScore)}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Active scale detail */}
                  <p className="text-jazz-muted text-sm mb-4">{activeScale.description}</p>

                  <div className="flex flex-col items-start gap-3">
                    <ChordScoreViewer
                      notes={activeScale.notes}
                      mode="scale"
                      width={Math.min(80 + activeScale.notes.length * 50, 520)}
                      height={130}
                    />
                    <PlayButton notes={activeScale.notes} type="scale" label="スケールを聴く" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
