// ── Primitive note names ──────────────────────────────────────────────────────
export type NoteName =
  | "C" | "C#" | "Db" | "D" | "D#" | "Eb" | "E" | "F"
  | "F#" | "Gb" | "G" | "G#" | "Ab" | "A" | "A#" | "Bb" | "B";

export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Note {
  name: NoteName;
  octave: Octave;
  /** e.g. "C4", "F#3" */
  scientific: string;
  /** MIDI note number 0-127 */
  midi: number;
}

// ── Chord ─────────────────────────────────────────────────────────────────────
export type ChordQuality =
  | "maj7" | "m7" | "7" | "m7b5" | "dim7"
  | "maj9" | "m9" | "9" | "6" | "m6"
  | "sus2" | "sus4" | "7sus4" | "aug" | "dim";

export interface Chord {
  root: NoteName;
  quality: ChordQuality;
  /** Full symbol, e.g. "Dm7" */
  symbol: string;
  /** Ordered note names without octave */
  notes: NoteName[];
  /** Roman numeral function in context, if known */
  function?: "I" | "II" | "III" | "IV" | "V" | "VI" | "VII";
}

// ── Scale ─────────────────────────────────────────────────────────────────────
export type ScaleName =
  | "major" | "minor" | "dorian" | "phrygian" | "lydian"
  | "mixolydian" | "locrian" | "melodic minor"
  | "lydian dominant" | "altered" | "half-whole diminished"
  | "whole-half diminished" | "whole tone"
  | "bebop dominant" | "bebop major";

export interface Scale {
  root: NoteName;
  name: ScaleName;
  notes: NoteName[];
  /** 1-5 stars: theoretical fit for the paired chord */
  fitScore: 1 | 2 | 3 | 4 | 5;
  description: string;
}

// ── Progression ───────────────────────────────────────────────────────────────
export type ProgressionType = "II-V-I" | "I-VI-II-V" | "III-VI-II-V" | "blues";

export interface ChordProgression {
  type: ProgressionType;
  key: NoteName;
  chords: Chord[];
}

// ── Lick ──────────────────────────────────────────────────────────────────────
export type Duration = "whole" | "half" | "quarter" | "eighth" | "sixteenth";

export interface LickNote {
  note: NoteName;
  octave: Octave;
  duration: Duration;
}

export interface Lick {
  id: string;
  title: string;
  targetChord: Chord;
  scale: Scale;
  notes: LickNote[];
  /** ABC notation string for VexFlow / rendering */
  abc: string;
  bpm: number;
}

// ── Quiz ──────────────────────────────────────────────────────────────────────
export type QuizMode = "chord-to-notes" | "notes-to-chord";

export interface QuizQuestion {
  id: string;
  mode: QuizMode;
  chord: Chord;
  /** For notes-to-chord: the 3-4 notes presented */
  presentedNotes?: NoteName[];
  /** All answer choices (includes correct + distractors) */
  choices: string[];
  correctAnswer: string;
}

export interface QuizResult {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeMs: number;
}

export interface QuizSession {
  questions: QuizQuestion[];
  results: QuizResult[];
  currentIndex: number;
  score: number;
  startedAt: Date;
}
