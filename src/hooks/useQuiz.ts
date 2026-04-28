"use client";

import { useState, useCallback, useRef } from "react";
import type { QuizQuestion, QuizResult, QuizSession, QuizMode } from "@/types/music";
import { buildQuizSession } from "@/lib/theory/quizFactory";

type QuizPhase = "idle" | "active" | "answer" | "complete";

export function useQuiz(count = 10, mode: QuizMode | "mixed" = "mixed") {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [phase, setPhase] = useState<QuizPhase>("idle");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentQuestion: QuizQuestion | null =
    session && session.currentIndex < session.questions.length
      ? session.questions[session.currentIndex]
      : null;

  const lastResult: QuizResult | null =
    session && session.results.length > 0
      ? session.results[session.results.length - 1]
      : null;

  const start = useCallback((overrideCount?: number, overrideMode?: QuizMode | "mixed") => {
    const questions = buildQuizSession(overrideCount ?? count, overrideMode ?? mode);
    setSession({
      questions,
      results: [],
      currentIndex: 0,
      score: 0,
      startedAt: new Date(),
    });
    setPhase("active");
    setSelectedAnswer(null);
    startTimeRef.current = Date.now();
  }, [count, mode]);

  const answer = useCallback(
    (choice: string) => {
      if (!session || !currentQuestion || phase !== "active") return;

      const timeMs = Date.now() - startTimeRef.current;
      const isCorrect = choice === currentQuestion.correctAnswer;

      const result: QuizResult = {
        questionId: currentQuestion.id,
        selectedAnswer: choice,
        isCorrect,
        timeMs,
      };

      setSelectedAnswer(choice);
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          results: [...prev.results, result],
          score: prev.score + (isCorrect ? 1 : 0),
        };
      });
      setPhase("answer");
    },
    [session, currentQuestion, phase]
  );

  const next = useCallback(() => {
    if (!session) return;
    const nextIndex = session.currentIndex + 1;
    if (nextIndex >= session.questions.length) {
      setPhase("complete");
    } else {
      setSession((prev) => prev && { ...prev, currentIndex: nextIndex });
      setPhase("active");
      setSelectedAnswer(null);
      startTimeRef.current = Date.now();
    }
  }, [session]);

  const reset = useCallback(() => {
    setSession(null);
    setPhase("idle");
    setSelectedAnswer(null);
  }, []);

  const progress =
    session
      ? {
          current: session.currentIndex + 1,
          total: session.questions.length,
          score: session.score,
          percent: Math.round(
            (session.results.filter((r) => r.isCorrect).length /
              session.questions.length) *
              100
          ),
        }
      : null;

  return {
    phase,
    session,
    currentQuestion,
    lastResult,
    selectedAnswer,
    progress,
    start,
    answer,
    next,
    reset,
  };
}
