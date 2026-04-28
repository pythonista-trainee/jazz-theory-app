/**
 * Theory Engine — Chord utilities built on top of Tonal.js.
 * Tonal is a functional music theory library; we wrap it in typed helpers.
 */
import { Chord as TonalChord, Note as TonalNote } from "tonal";
import type {
  Chord,
  ChordQuality,
  NoteName,
  ChordProgression,
  ProgressionType,
} from "@/types/music";

// ── Normalisation ─────────────────────────────────────────────────────────────

/** Tonal may return e.g. "C#" or "Db". Keep as-is but cast to our type. */
function toNoteName(n: string): NoteName {
  return n as NoteName;
}

// ── Core chord builder ────────────────────────────────────────────────────────

/**
 * Build a typed Chord from a symbol like "Dm7", "G7", "Cmaj7".
 * Returns null if Tonal cannot parse the symbol.
 */
export function buildChord(symbol: string): Chord | null {
  const tonalChord = TonalChord.get(symbol);
  if (!tonalChord || !tonalChord.tonic) return null;

  const notes = tonalChord.notes.map(toNoteName);

  return {
    root: toNoteName(tonalChord.tonic),
    quality: tonalChord.aliases[0] as ChordQuality ?? (tonalChord.type as ChordQuality),
    symbol,
    notes,
  };
}

/**
 * Return all note names (without octave) for a chord symbol.
 * e.g. "Dm7" → ["D", "F", "A", "C"]
 */
export function getChordNotes(symbol: string): NoteName[] {
  return buildChord(symbol)?.notes ?? [];
}

// ── Distractor generation ─────────────────────────────────────────────────────

const COMMON_JAZZ_CHORDS: string[] = [
  "Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7b5",
  "Dbmaj7", "Ebm7", "Fm7", "Gbmaj7", "Ab7", "Bbm7",
  "Dm7b5", "G7", "Cm7", "F7", "Bbmaj7",
  "Am7b5", "D7", "Gm7", "C7", "Fmaj7",
  "Bdim7", "Ebdim7", "Abdim7", "Dbdim7",
];

/**
 * Pick `count` chord symbols that differ from `correct`.
 * Used to generate wrong-answer choices in the quiz.
 */
export function generateDistractors(correct: string, count = 3): string[] {
  const pool = COMMON_JAZZ_CHORDS.filter((c) => c !== correct);
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Shuffle an array (Fisher-Yates).
 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Chord-to-notes verification ───────────────────────────────────────────────

/**
 * Check whether a user's note selection matches the chord's tones.
 * Order-insensitive, enharmonic-aware via Tonal.
 */
export function verifyChordNotes(
  symbol: string,
  userNotes: NoteName[]
): boolean {
  const correct = getChordNotes(symbol).map(simplify).sort();
  const user = userNotes.map(simplify).sort();
  if (correct.length !== user.length) return false;
  return correct.every((n, i) => n === user[i]);
}

/** Simplify enharmonics: Db → C#, etc. via Tonal */
function simplify(note: string): string {
  return TonalNote.simplify(note) ?? note;
}

// ── II-V-I builder ────────────────────────────────────────────────────────────

const MAJOR_2_5_1: Record<NoteName, [string, string, string]> = {
  C: ["Dm7", "G7", "Cmaj7"],
  "C#": ["D#m7", "G#7", "C#maj7"],
  Db: ["Ebm7", "Ab7", "Dbmaj7"],
  D: ["Em7", "A7", "Dmaj7"],
  "D#": ["E#m7", "A#7", "D#maj7"],
  Eb: ["Fm7", "Bb7", "Ebmaj7"],
  E: ["F#m7", "B7", "Emaj7"],
  F: ["Gm7", "C7", "Fmaj7"],
  "F#": ["G#m7", "C#7", "F#maj7"],
  Gb: ["Abm7", "Db7", "Gbmaj7"],
  G: ["Am7", "D7", "Gmaj7"],
  "G#": ["A#m7", "D#7", "G#maj7"],
  Ab: ["Bbm7", "Eb7", "Abmaj7"],
  A: ["Bm7", "E7", "Amaj7"],
  "A#": ["B#m7", "E#7", "A#maj7"],
  Bb: ["Cm7", "F7", "Bbmaj7"],
  B: ["C#m7", "F#7", "Bmaj7"],
};

export function buildProgression(
  type: ProgressionType,
  key: NoteName
): ChordProgression {
  const symbols = MAJOR_2_5_1[key] ?? MAJOR_2_5_1["C"];
  const chords = symbols
    .map((s) => buildChord(s))
    .filter(Boolean) as Chord[];

  return { type, key, chords };
}

// ── Random chord picker ───────────────────────────────────────────────────────

export function randomChord(): Chord {
  const symbol =
    COMMON_JAZZ_CHORDS[Math.floor(Math.random() * COMMON_JAZZ_CHORDS.length)];
  return buildChord(symbol) ?? buildChord("Cmaj7")!;
}
