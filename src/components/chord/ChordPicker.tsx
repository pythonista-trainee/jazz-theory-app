"use client";

import { useState } from "react";
import { formatNote } from "@/lib/theory/noteFormat";
import type { NoteName } from "@/types/music";

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
];

const ROOTS: NoteName[] = [
  "C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B",
];

interface Props {
  value: string;
  onChange: (symbol: string) => void;
}

export function ChordPicker({ value, onChange }: Props) {
  // Derive initial quality and root from value
  const initQuality = QUALITY_GROUPS.flatMap(g => g.items).find(
    it => value.endsWith(it.value)
  )?.value ?? "m7";
  const initRoot = ROOTS.find(r => value.startsWith(r)) ?? "D";

  const [quality, setQuality] = useState<string>(initQuality);
  const [root, setRoot] = useState<NoteName>(initRoot);

  function selectQuality(q: string) {
    setQuality(q);
    onChange(`${root}${q}`);
  }

  function selectRoot(r: NoteName) {
    setRoot(r);
    onChange(`${r}${quality}`);
  }

  return (
    <div className="space-y-3">
      {/* Quality groups */}
      {QUALITY_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-xs uppercase tracking-widest text-jazz-muted mb-1.5">{group.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {group.items.map((item) => (
              <button
                key={item.value}
                onClick={() => selectQuality(item.value)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all ${
                  quality === item.value
                    ? "bg-jazz-accent border-jazz-accent text-white"
                    : "bg-jazz-surface border-white/10 text-jazz-muted hover:border-white/30"
                }`}
              >
                {item.display}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Root note grid */}
      <div>
        <p className="text-xs uppercase tracking-widest text-jazz-muted mb-1.5">ルート音</p>
        <div className="grid grid-cols-6 gap-1.5">
          {ROOTS.map((r) => (
            <button
              key={r}
              onClick={() => selectRoot(r)}
              className={`py-1.5 rounded-lg font-mono text-xs font-bold border transition-all ${
                root === r
                  ? "bg-jazz-gold/20 border-jazz-gold text-jazz-gold"
                  : "bg-jazz-surface border-white/10 text-jazz-muted hover:border-white/30"
              }`}
            >
              {formatNote(r)}
            </button>
          ))}
        </div>
      </div>

      {/* Current chord display */}
      <div className="text-center py-2">
        <span className="text-jazz-gold font-mono font-black text-2xl">
          {formatNote(`${root}${quality}`)}
        </span>
      </div>
    </div>
  );
}
