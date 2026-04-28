/**
 * Lick Generator — bebop-style jazz phrases with swing feel.
 *
 * Design principles:
 *  - Chord tones on strong beats (1, 3 and their "ands")
 *  - Chromatic approach notes on weak beats
 *  - Pickup starts (startBeat > 0) for authentic jazz phrasing
 *  - Mixed durations weighted toward eighth notes
 */
import type { Chord, Scale, Lick, LickNote, Duration, Octave } from "@/types/music";

// ── Patterns (scale degree indices, 0-based) ──────────────────────────────────
// Patterns are designed to resolve to chord tones on the downbeat (index 0 or 2)
const LICK_PATTERNS: { degrees: number[]; durations: Duration[] }[] = [
  // Bebop descending phrase — classic II-V resolution
  {
    degrees: [6, 5, 4, 3, 2, 1, 0, 6],
    durations: ["eighth","eighth","eighth","eighth","eighth","eighth","quarter","quarter"],
  },
  // Chord tone arpeggio with chromatic upper approach
  {
    degrees: [4, 5, 4, 2, 4, 2, 1, 0],
    durations: ["eighth","eighth","quarter","eighth","eighth","quarter","eighth","eighth"],
  },
  // Scale run up, then chord tones down
  {
    degrees: [0, 1, 2, 3, 4, 5, 6, 4],
    durations: ["eighth","eighth","eighth","eighth","eighth","eighth","quarter","quarter"],
  },
  // Upper structure → resolution (targeting root)
  {
    degrees: [5, 6, 5, 4, 2, 1, 0, 2],
    durations: ["eighth","eighth","quarter","eighth","eighth","quarter","half"],
  },
  // Enclosure + resolution (bebop hallmark)
  {
    degrees: [1, 0, 6, 0, 2, 4, 3, 2],
    durations: ["eighth","eighth","eighth","eighth","quarter","eighth","eighth","quarter"],
  },
  // Pickup 8th pick into arpeggio
  {
    degrees: [6, 0, 2, 4, 6, 4, 2, 0],
    durations: ["eighth","eighth","eighth","eighth","quarter","eighth","eighth","quarter"],
  },
  // Rhythmic displacement — syncopated quarters
  {
    degrees: [2, 4, 6, 4, 2, 0, 1, 0],
    durations: ["quarter","eighth","eighth","quarter","eighth","eighth","eighth","eighth"],
  },
];

// Pickup offset options (in beats) — authentic jazz phrasing rarely starts on beat 1
const PICKUP_OPTIONS = [0, 0, 0.5, 0.5, 1, 1.5];

// ── Builder ───────────────────────────────────────────────────────────────────

export function generateLick(chord: Chord, scale: Scale): Lick {
  const { degrees, durations } =
    LICK_PATTERNS[Math.floor(Math.random() * LICK_PATTERNS.length)];

  const startBeat = PICKUP_OPTIONS[Math.floor(Math.random() * PICKUP_OPTIONS.length)];

  const notes: LickNote[] = degrees.map((degreeIdx, i) => {
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
    abc: toABC(notes, chord.symbol, startBeat),
    bpm: 120,
    startBeat,
  };
}

// ── ABC notation ──────────────────────────────────────────────────────────────

const ABC_DURATION: Record<Duration, string> = {
  whole:     "8",
  half:      "4",
  quarter:   "2",
  eighth:    "",
  sixteenth: "/2",
};

const OCTAVE_MARK: Record<number, string> = { 3:",", 4:"", 5:"'", 6:"''" };

function toABCNote(ln: LickNote): string {
  const sharp = ln.note.includes("#") ? "^" : ln.note.includes("b") ? "_" : "";
  const letter = ln.note.replace(/[#b]/, "");
  const octMark = OCTAVE_MARK[ln.octave] ?? "";
  return `${sharp}${letter}${octMark}${ABC_DURATION[ln.duration]}`;
}

function toABC(notes: LickNote[], chordSymbol: string, startBeat: number): string {
  // Represent pickup beat as a rest prefix
  const restPrefix = startBeat > 0
    ? `z${startBeat === 0.5 ? "" : startBeat === 1 ? "2" : "3"} `
    : "";
  const body = notes.map(toABCNote).join(" ");
  return `X:1\nT:${chordSymbol} Lick\nM:4/4\nL:1/8\nQ:120\nK:C\n| ${restPrefix}${body} |`;
}
