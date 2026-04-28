"use client";

import { useState } from "react";
import type { QuizMode } from "@/types/music";
import { useQuiz } from "@/hooks/useQuiz";
import { QuizStart } from "@/components/quiz/QuizStart";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizComplete } from "@/components/quiz/QuizComplete";

export default function ChordMasterPage() {
  const [config, setConfig] = useState<{
    count: number;
    mode: QuizMode | "mixed";
  } | null>(null);

  const { phase, session, currentQuestion, lastResult, selectedAnswer, progress, start, answer, next, reset } =
    useQuiz(config?.count ?? 10, config?.mode ?? "mixed");

  function handleStart(count: number, mode: QuizMode | "mixed") {
    setConfig({ count, mode });
    start();
  }

  function handleRestart() {
    reset();
    setConfig(null);
  }

  return (
    <div className="flex flex-col items-center min-h-[70vh] justify-center">
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
  );
}
