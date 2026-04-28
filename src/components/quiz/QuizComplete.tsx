"use client";

import type { QuizSession } from "@/types/music";
import { Button } from "@/components/ui/Button";

interface Props {
  session: QuizSession;
  onRestart: () => void;
}

export function QuizComplete({ session, onRestart }: Props) {
  const total = session.questions.length;
  const correct = session.results.filter((r) => r.isCorrect).length;
  const pct = Math.round((correct / total) * 100);
  const avgTime =
    session.results.reduce((s, r) => s + r.timeMs, 0) / session.results.length;

  const grade =
    pct >= 90 ? "S" : pct >= 75 ? "A" : pct >= 60 ? "B" : pct >= 40 ? "C" : "D";

  const gradeColor: Record<string, string> = {
    S: "text-yellow-300",
    A: "text-emerald-400",
    B: "text-blue-400",
    C: "text-orange-400",
    D: "text-red-400",
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <div className="bg-jazz-card border border-white/10 rounded-2xl p-10 shadow-2xl">
        <p className="text-jazz-muted uppercase tracking-widest text-sm mb-4">
          クイズ完了
        </p>
        <div className={`text-8xl font-black mb-2 ${gradeColor[grade]}`}>
          {grade}
        </div>
        <p className="text-2xl font-bold text-jazz-text mb-1">
          {correct} / {total}
          <span className="text-jazz-muted text-lg font-normal ml-2">
            ({pct}%)
          </span>
        </p>
        <p className="text-jazz-muted text-sm mb-8">
          平均回答時間: {(avgTime / 1000).toFixed(1)}秒
        </p>

        {/* Per-question review */}
        <div className="text-left space-y-2 mb-8 max-h-60 overflow-y-auto">
          {session.results.map((r, i) => {
            const q = session.questions[i];
            return (
              <div
                key={r.questionId}
                className={`flex items-center gap-3 text-sm px-3 py-2 rounded-lg ${
                  r.isCorrect
                    ? "bg-emerald-900/20 text-emerald-300"
                    : "bg-red-900/20 text-red-300"
                }`}
              >
                <span>{r.isCorrect ? "✓" : "✗"}</span>
                <span className="font-mono text-jazz-gold">{q.chord.symbol}</span>
                <span className="text-jazz-muted flex-1 truncate">
                  {r.isCorrect ? "正解" : `✗ ${r.selectedAnswer}`}
                </span>
                <span className="text-jazz-muted text-xs">
                  {(r.timeMs / 1000).toFixed(1)}s
                </span>
              </div>
            );
          })}
        </div>

        <Button onClick={onRestart} size="lg" className="w-full">
          もう一度挑戦
        </Button>
      </div>
    </div>
  );
}
