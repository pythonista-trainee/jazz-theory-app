"use client";

import { useState } from "react";
import type { QuizMode } from "@/types/music";
import { Button } from "@/components/ui/Button";

interface Props {
  onStart: (count: number, mode: QuizMode | "mixed") => void;
}

export function QuizStart({ onStart }: Props) {
  const [count, setCount] = useState(10);
  const [mode, setMode] = useState<QuizMode | "mixed">("mixed");

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="bg-jazz-card border border-white/10 rounded-2xl p-10 shadow-2xl">
        <div className="text-5xl mb-4">🎷</div>
        <h2 className="text-3xl font-black text-jazz-gold mb-2">Chord Master</h2>
        <p className="text-jazz-muted mb-8 text-sm">
          ジャズコードの構成音をマスターしよう
        </p>

        {/* Mode selector */}
        <div className="mb-6">
          <p className="text-jazz-muted text-xs uppercase tracking-widest mb-3">
            モード
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { value: "mixed", label: "ミックス" },
                { value: "chord-to-notes", label: "コード→音" },
                { value: "notes-to-chord", label: "音→コード" },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={`px-3 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                  mode === value
                    ? "bg-jazz-accent border-jazz-accent text-white"
                    : "bg-jazz-surface border-white/10 text-jazz-muted hover:border-white/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Count selector */}
        <div className="mb-8">
          <p className="text-jazz-muted text-xs uppercase tracking-widest mb-3">
            問題数: {count}問
          </p>
          <input
            type="range"
            min={5}
            max={20}
            step={5}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-jazz-accent"
          />
          <div className="flex justify-between text-xs text-jazz-muted mt-1">
            <span>5</span>
            <span>10</span>
            <span>15</span>
            <span>20</span>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={() => onStart(count, mode)}
        >
          スタート
        </Button>
      </div>
    </div>
  );
}
