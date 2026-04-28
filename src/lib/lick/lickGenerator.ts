/**
 * Lick Generator — creates musically valid jazz licks for a given chord/scale.
 * Uses note patterns derived from bebop tradition (chord tones + approach notes).
 */
import type { Chord, Scale, Lick, LickNote, Duration, NoteName, Octave } from "@/types/music";

const DURATIONS: Duration[] = ["eighth", "eighth", "eighth", "quarter", "sixteenth"];

// ── Pattern library (relative intervals from root) ───────────────────────────
// Each pattern is an array of scale degree indices (0-based)
const LICK_PATTERNS: number[][] = [
  [0, 2, 4, 6, 5, 4, 2, 0],       // Scale run up and back
  [0, 2, 1, 3, 2, 4, 3, 5],       // Bebop-style step motion
  [4, 2, 0, 2, 4, 6, 5, 4],       // Arpeggio descent into climb
  [0, 4, 2, 6, 4, 2, 4, 0],       // Chord tone outlining
  [2, 4, 6, 5, 4, 2, 1, 0],       // Upper structure descent
  [0, 1, 2, 4, 6, 5, 3, 2],       // Chromatic approach from below
];

const DURATION_PATTERNS: Duration[][] = [
  ["eighth","eighth","eighth","eighth","quarter","eighth","eighth","quarter"],
  ["quarter","eighth","eighth","eighth","eighth","eighth","eighth","quarter"],
  ["eighth","eighth","quarter","eighth","eighth","quarter","half"],
];

// ── Builder ───────────────────────────────────────────────────────────────────

export function generateLick(chord: Chord, scale: Scale): Lick {
  const pattern = LICK_PATTERNS[Math.floor(Math.random() * LICK_PATTERNS.length)];
  const durations = DURATION_PATTERNS[Math.floor(Math.random() * DURATION_PATTERNS.length)];

  const notes: LickNote[] = pattern.map((degreeIdx, i) => {
    const noteIndex = degreeIdx % scale.notes.length;
    const octaveBump = Math.floor(degreeIdx / scale.notes.length);
    return {
      note: scale.notes[noteIndex],
      octave: (4 + octaveBump) as Octave,
      duration: durations[i % durations.length],
    };
  });

  return {
    id: Math.random().toString(36).slice(2),
    title: `${chord.symbol} Lick (${scale.name})`,
    targetChord: chord,
    scale,
    notes,
    abc: toABC(notes, chord.symbol),
    bpm: 120,
  };
}

// ── ABC notation builder ──────────────────────────────────────────────────────

const ABC_DURATION: Record<Duration, string> = {
  whole: "8",
  half: "4",
  quarter: "2",
  eighth: "",
  sixteenth: "/2",
};

const OCTAVE_MARK: Record<number, string> = {
  3: ",",
  4: "",
  5: "'",
  6: "''",
};

function toABCNote(ln: LickNote): string {
  const sharp = ln.note.includes("#") ? "^" : ln.note.includes("b") ? "_" : "";
  const letter = ln.note.replace(/[#b]/, "");
  const octMark = OCTAVE_MARK[ln.octave] ?? "";
  const dur = ABC_DURATION[ln.duration];
  return `${sharp}${letter}${octMark}${dur}`;
}

function toABC(notes: LickNote[], chordSymbol: string): string {
  const body = notes.map(toABCNote).join(" ");
  return `X:1\nT:${chordSymbol} Lick\nM:4/4\nL:1/8\nQ:120\nK:C\n| ${body} |`;
}
