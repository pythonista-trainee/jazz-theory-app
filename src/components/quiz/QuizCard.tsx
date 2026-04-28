"use client";

import { type QuizQuestion, type QuizResult } from "@/types/music";
import { Button } from "@/components/ui/Button";
import { clsx } from "clsx";

interface Props {
  question: QuizQuestion;
  phase: "active" | "answer";
  selectedAnswer: string | null;
  lastResult: QuizResult | null;
  onAnswer: (choice: string) => void;
  onNext: () => void;
  progress: { current: number; total: number; score: number };
}

export function QuizCard({
  question,
  phase,
  selectedAnswer,
  lastResult,
  onAnswer,
  onNext,
  progress,
}: Props) {
  const isAnswer = phase === "answer";

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-jazz-muted mb-2">
          <span>
            {progress.current} / {progress.total}
          </span>
          <span className="text-jazz-gold font-semibold">
            Score: {progress.score}
          </span>
        </div>
        <div className="h-1.5 bg-jazz-teal rounded-full overflow-hidden">
          <div
            className="h-full bg-jazz-accent transition-all duration-300"
            style={{
              width: `${((progress.current - 1) / progress.total) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-jazz-card border border-white/10 rounded-2xl p-8 mb-6 shadow-xl">
        <p className="text-jazz-muted text-sm uppercase tracking-widest mb-3">
          {question.mode === "chord-to-notes"
            ? "このコードの構成音は？"
            : "この構成音のコード名は？"}
        </p>

        {question.mode === "chord-to-notes" ? (
          <div className="text-center">
            <span className="text-6xl font-bold text-jazz-gold tracking-tight">
              {question.chord.symbol}
            </span>
            <p className="text-jazz-muted mt-3 text-sm">
              Root: <span className="text-jazz-text">{question.chord.root}</span>
              &nbsp;|&nbsp;Quality:{" "}
              <span className="text-jazz-text">{question.chord.quality}</span>
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {question.presentedNotes?.map((n) => (
                <span
                  key={n}
                  className="text-3xl font-bold text-jazz-gold bg-jazz-teal/40 px-4 py-2 rounded-xl border border-jazz-teal"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Choices */}
      <div className="grid grid-cols-1 gap-3">
        {question.choices.map((choice) => {
          const isSelected = selectedAnswer === choice;
          const isCorrect = choice === question.correctAnswer;

          let variant: "primary" | "secondary" | "correct" | "wrong" | "ghost" =
            "secondary";
          if (isAnswer) {
            if (isCorrect) variant = "correct";
            else if (isSelected) variant = "wrong";
            else variant = "ghost";
          }

          return (
            <button
              key={choice}
              disabled={isAnswer}
              onClick={() => onAnswer(choice)}
              className={clsx(
                "w-full text-left px-5 py-4 rounded-xl border font-mono text-sm transition-all duration-150",
                "disabled:cursor-default",
                !isAnswer &&
                  "bg-jazz-card border-white/10 text-jazz-text hover:border-jazz-accent hover:bg-jazz-accent/10 active:scale-[0.99]",
                isAnswer && isCorrect &&
                  "bg-emerald-700/30 border-emerald-400 text-emerald-200",
                isAnswer && isSelected && !isCorrect &&
                  "bg-red-700/30 border-red-400 text-red-200",
                isAnswer && !isSelected && !isCorrect &&
                  "bg-jazz-surface/50 border-white/5 text-jazz-muted"
              )}
            >
              <span className="flex items-center gap-3">
                {isAnswer && isCorrect && (
                  <span className="text-emerald-400 text-lg">✓</span>
                )}
                {isAnswer && isSelected && !isCorrect && (
                  <span className="text-red-400 text-lg">✗</span>
                )}
                {choice}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation after answer */}
      {isAnswer && lastResult && (
        <div
          className={clsx(
            "mt-5 p-4 rounded-xl border text-sm",
            lastResult.isCorrect
              ? "bg-emerald-900/20 border-emerald-700 text-emerald-300"
              : "bg-red-900/20 border-red-700 text-red-300"
          )}
        >
          <p className="font-semibold mb-1">
            {lastResult.isCorrect ? "正解！" : "不正解"}
          </p>
          <p className="text-jazz-muted">
            正解:&nbsp;
            <span className="text-jazz-text font-mono">
              {question.correctAnswer}
            </span>
            &nbsp;|&nbsp;{(lastResult.timeMs / 1000).toFixed(1)}秒
          </p>
        </div>
      )}

      {isAnswer && (
        <div className="mt-5 flex justify-center">
          <Button onClick={onNext} variant="primary" size="lg">
            次の問題 →
          </Button>
        </div>
      )}
    </div>
  );
}
