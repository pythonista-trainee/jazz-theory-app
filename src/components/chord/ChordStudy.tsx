"use client";

import { useState } from "react";
import { buildChord } from "@/lib/theory/chordEngine";
import { getScalesForChord } from "@/lib/theory/scaleEngine";
import { formatNote } from "@/lib/theory/noteFormat";
import { ChordScoreViewer } from "@/components/score/ChordScoreViewer";
import { PlayButton } from "@/components/ui/PlayButton";
import type { NoteName } from "@/types/music";

// ── Quality groups ─────────────────────────────────────────────────────────────
const QUALITY_GROUPS = [
  {
    label: "メジャー系",
    items: [
      { value: "maj7",  display: "maj7"  },
      { value: "maj9",  display: "maj9"  },
      { value: "6",     display: "6"     },
    ],
  },
  {
    label: "マイナー系",
    items: [
      { value: "m7",    display: "m7"    },
      { value: "m9",    display: "m9"    },
      { value: "m6",    display: "m6"    },
    ],
  },
  {
    label: "ドミナント系",
    items: [
      { value: "7",     display: "7"     },
      { value: "9",     display: "9"     },
      { value: "7b9",   display: "7♭9"  },
      { value: "7#9",   display: "7♯9"  },
      { value: "7#11",  display: "7♯11" },
      { value: "7b13",  display: "7♭13" },
    ],
  },
  {
    label: "特殊",
    items: [
      { value: "m7b5",  display: "m7♭5" },
      { value: "dim7",  display: "dim7"  },
      { value: "aug",   display: "aug"   },
      { value: "sus4",  display: "sus4"  },
    ],
  },
] as const;

const ROOTS: NoteName[] = [
  "C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B",
];

export function ChordStudy() {
  const [quality, setQuality] = useState<string>("maj7");
  const [root, setRoot] = useState<NoteName>("C");

  const symbol = `${root}${quality}`;
  const chord = buildChord(symbol);
  const scales = chord ? getScalesForChord(chord) : [];
  const primaryScale = scales[0];

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      {/* ── Left panel: quality + root selector ──────────────── */}
      <div className="lg:w-64 flex-shrink-0 space-y-5">
        {/* Quality groups */}
        {QUALITY_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-jazz-muted text-xs uppercase tracking-widest mb-2">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((q) => (
                <button
                  key={q.value}
                  onClick={() => setQuality(q.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-mono font-bold border transition-all ${
                    quality === q.value
                      ? "bg-jazz-accent border-jazz-accent text-white"
                      : "bg-jazz-card border-white/10 text-jazz-muted hover:border-white/30 hover:text-jazz-text"
                  }`}
                >
                  {q.display}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Root note picker */}
        <div>
          <p className="text-jazz-muted text-xs uppercase tracking-widest mb-2">
            ルート音
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {ROOTS.map((r) => (
              <button
                key={r}
                onClick={() => setRoot(r)}
                className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                  root === r
                    ? "bg-jazz-gold border-jazz-gold text-jazz-bg"
                    : "bg-jazz-card border-white/10 text-jazz-muted hover:border-white/30 hover:text-jazz-text"
                }`}
              >
                {formatNote(r)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel: chord detail ───────────────────────── */}
      {chord ? (
        <div className="flex-1 space-y-5">
          {/* Chord info */}
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
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-jazz-surface border border-white/10 font-mono text-sm text-jazz-text">
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
        <div className="flex-1 flex items-center justify-center text-jazz-muted py-20">
          コードが見つかりません
        </div>
      )}
    </div>
  );
}
