"use client";

import { useState } from "react";
import { buildChord } from "@/lib/theory/chordEngine";
import { getScalesForChord } from "@/lib/theory/scaleEngine";
import { formatNote } from "@/lib/theory/noteFormat";
import { ChordScoreViewer } from "@/components/score/ChordScoreViewer";
import { PlayButton } from "@/components/ui/PlayButton";

const CHORD_LIST = [
  // Major keys
  "Cmaj7", "Fmaj7", "Bbmaj7", "Ebmaj7", "Abmaj7", "Dbmaj7",
  "Gmaj7", "Dmaj7", "Amaj7", "Emaj7", "Bmaj7",
  // Minor 7
  "Dm7", "Gm7", "Cm7", "Fm7", "Bbm7", "Am7", "Em7", "Bm7",
  // Dominant 7
  "G7", "C7", "F7", "Bb7", "Eb7", "Ab7", "D7", "A7", "E7", "B7",
  // Half diminished
  "Bm7b5", "Em7b5", "Am7b5", "Dm7b5",
  // Diminished
  "Bdim7", "Ddim7", "Fdim7", "Abdim7",
];

export function ChordStudy() {
  const [selected, setSelected] = useState("Cmaj7");
  const [search, setSearch] = useState("");

  const chord = buildChord(selected);
  const scales = chord ? getScalesForChord(chord) : [];
  const primaryScale = scales[0];

  const filtered = CHORD_LIST.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      {/* Chord list */}
      <div className="lg:w-56 flex-shrink-0">
        <input
          type="text"
          placeholder="コードを検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-3 px-3 py-2 text-sm rounded-lg bg-jazz-surface border border-white/10 text-jazz-text placeholder-jazz-muted outline-none focus:border-jazz-accent"
        />
        <div className="flex flex-wrap lg:flex-col gap-1.5 max-h-[400px] overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c}
              onClick={() => setSelected(c)}
              className={`px-3 py-2 rounded-lg text-sm font-mono font-bold text-left transition-all ${
                selected === c
                  ? "bg-jazz-accent text-white"
                  : "bg-jazz-card border border-white/10 text-jazz-muted hover:border-white/30 hover:text-jazz-text"
              }`}
            >
              {formatNote(c)}
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {chord ? (
        <div className="flex-1 space-y-5">
          {/* Header */}
          <div className="bg-jazz-card border border-white/10 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-jazz-muted text-xs uppercase tracking-widest mb-1">コード</p>
                <h3 className="text-4xl font-black text-jazz-gold">
                  {formatNote(chord.symbol)}
                </h3>
                <p className="text-jazz-muted text-sm mt-1">
                  Root: <span className="text-jazz-text">{formatNote(chord.root)}</span>
                  &nbsp;·&nbsp;
                  Quality: <span className="text-jazz-text">{formatNote(chord.quality)}</span>
                </p>
              </div>
              <PlayButton notes={chord.notes} type="chord" label="コードを聴く" />
            </div>

            {/* Notes as badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {chord.notes.map((n, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-jazz-teal/40 border border-jazz-teal font-mono font-bold text-jazz-gold text-sm"
                >
                  {formatNote(n)}
                </span>
              ))}
            </div>

            {/* Staff */}
            <div className="flex justify-center">
              <ChordScoreViewer notes={chord.notes} mode="chord" width={300} height={130} />
            </div>
          </div>

          {/* Primary scale */}
          {primaryScale && (
            <div className="bg-jazz-card border border-white/10 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-jazz-muted text-xs uppercase tracking-widest mb-1">推奨スケール</p>
                  <h4 className="text-xl font-bold text-jazz-text">
                    {formatNote(primaryScale.root)} {primaryScale.name}
                  </h4>
                  <p className="text-jazz-muted text-sm mt-1">{primaryScale.description}</p>
                </div>
                <PlayButton notes={primaryScale.notes} type="scale" label="スケールを聴く" />
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {primaryScale.notes.map((n, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-jazz-surface border border-white/10 font-mono text-sm text-jazz-text"
                  >
                    {formatNote(n)}
                  </span>
                ))}
              </div>

              <div className="flex justify-center">
                <ChordScoreViewer
                  notes={primaryScale.notes}
                  mode="scale"
                  width={Math.min(80 + primaryScale.notes.length * 50, 500)}
                  height={130}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-jazz-muted">
          コードを選択してください
        </div>
      )}
    </div>
  );
}
