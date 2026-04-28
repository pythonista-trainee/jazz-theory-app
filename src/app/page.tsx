"use client";

import { useState } from "react";
import type { QuizMode } from "@/types/music";
import { useQuiz } from "@/hooks/useQuiz";
import { QuizStart } from "@/components/quiz/QuizStart";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizComplete } from "@/components/quiz/QuizComplete";
import { ChordStudy } from "@/components/chord/ChordStudy";

type Tab = "study" | "quiz";

export default function ChordMasterPage() {
  const [tab, setTab] = useState<Tab>("study");
  const [config, setConfig] = useState<{
    count: number;
    mode: QuizMode | "mixed";
  } | null>(null);

  const { phase, session, currentQuestion, lastResult, selectedAnswer, progress, start, answer, next, reset } =
    useQuiz(config?.count ?? 10, config?.mode ?? "mixed");

  function handleStart(count: number, mode: QuizMode | "mixed") {
    setConfig({ count, mode });
    start(count, mode);
  }

  function handleRestart() {
    reset();
    setConfig(null);
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab switcher */}
      <div className="flex gap-2 mb-8 justify-center">
        {(["study", "quiz"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); if (t === "quiz" && phase !== "idle") reset(); }}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm border transition-all ${
              tab === t
                ? "bg-jazz-accent border-jazz-accent text-white shadow-lg"
                : "bg-jazz-card border-white/10 text-jazz-muted hover:border-white/30"
            }`}
          >
            {t === "study" ? "コード学習" : "クイズ"}
          </button>
        ))}
      </div>

      {/* Study tab */}
      {tab === "study" && <ChordStudy />}

      {/* Quiz tab */}
      {tab === "quiz" && (
        <div className="flex flex-col items-center min-h-[60vh] justify-center">
          {phase === "idle" && <QuizStart onStart={handleStart} />}

          {(phase === "active" || phase === "answer") &&
            currentQuestion &&
            progress && (
              <QuizCard
                question={currentQuestion}
                phase={phase}
                selectedAnswer={selectedAnswer}
                lastResult={lastResult}
                onAnswer={answer}
                onNext={next}
                progress={progress}
              />
            )}

          {phase === "complete" && session && (
            <QuizComplete session={session} onRestart={handleRestart} />
          )}
        </div>
      )}
    </div>
  );
}
