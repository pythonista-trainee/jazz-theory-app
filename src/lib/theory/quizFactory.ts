/**
 * Quiz Factory — generates typed QuizQuestion objects.
 */
import type { QuizQuestion, QuizMode, NoteName } from "@/types/music";
import {
  randomChord,
  buildChord,
  generateDistractors,
  shuffle,
  getChordNotes,
} from "./chordEngine";

// Polyfill-friendly uuid (no crypto.randomUUID on all envs)
function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── chord-to-notes ────────────────────────────────────────────────────────────

/**
 * "Which notes are in Dm7?"
 * Correct answer: "D, F, A, C"
 * Distractors: strings representing other chord's notes
 */
export function makeChordToNotesQuestion(): QuizQuestion {
  const chord = randomChord();
  const correctAnswer = chord.notes.join(", ");

  const distractorSymbols = generateDistractors(chord.symbol, 3);
  const distractorAnswers = distractorSymbols.map((sym) =>
    getChordNotes(sym).join(", ")
  );

  const choices = shuffle([correctAnswer, ...distractorAnswers]);

  return {
    id: uid(),
    mode: "chord-to-notes",
    chord,
    choices,
    correctAnswer,
  };
}

// ── notes-to-chord ────────────────────────────────────────────────────────────

/**
 * "D, F, A, C — what chord is this?"
 * Correct answer: the chord symbol
 */
export function makeNotesToChordQuestion(): QuizQuestion {
  const chord = randomChord();

  const distractorSymbols = generateDistractors(chord.symbol, 3);
  const choices = shuffle([chord.symbol, ...distractorSymbols]);

  return {
    id: uid(),
    mode: "notes-to-chord",
    chord,
    presentedNotes: chord.notes as NoteName[],
    choices,
    correctAnswer: chord.symbol,
  };
}

// ── Session builder ───────────────────────────────────────────────────────────

export function buildQuizSession(
  count = 10,
  mode: QuizMode | "mixed" = "mixed"
): QuizQuestion[] {
  return Array.from({ length: count }, (_, i) => {
    if (mode === "chord-to-notes") return makeChordToNotesQuestion();
    if (mode === "notes-to-chord") return makeNotesToChordQuestion();
    return i % 2 === 0
      ? makeChordToNotesQuestion()
      : makeNotesToChordQuestion();
  });
}
