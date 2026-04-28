/**
 * Instrument definitions — each maps to a Tone.js synth configuration.
 * "Realistic" timbres via synthesis (no external samples needed).
 */

export type InstrumentId =
  | "piano"
  | "saxophone"
  | "trumpet"
  | "guitar"
  | "strings"
  | "organ"
  | "flute"
  | "vibraphone"
  | "bass";

export interface InstrumentDef {
  id: InstrumentId;
  label: string;
  emoji: string;
  /** Note duration multiplier for chord vs scale playback */
  chordDuration: string;
  scaleDuration: string;
  /** Factory: receives the already-imported Tone module, returns a connected PolySynth */
  createSynth: (Tone: any) => any;
}

export const INSTRUMENTS: InstrumentDef[] = [
  {
    id: "piano",
    label: "ピアノ",
    emoji: "🎹",
    chordDuration: "2n",
    scaleDuration: "8n",
    createSynth: (Tone) =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.02, decay: 0.5, sustain: 0.3, release: 1.5 },
      }).toDestination(),
  },
  {
    id: "saxophone",
    label: "サックス",
    emoji: "🎷",
    chordDuration: "2n",
    scaleDuration: "4n",
    createSynth: (Tone) =>
      new Tone.PolySynth(Tone.AMSynth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.5 },
        modulation: { type: "square" },
        modulationEnvelope: { attack: 0.2, decay: 0.1, sustain: 1, release: 0.5 },
        harmonicity: 1.5,
      }).toDestination(),
  },
  {
    id: "trumpet",
    label: "トランペット",
    emoji: "🎺",
    chordDuration: "2n",
    scaleDuration: "4n",
    createSynth: (Tone) =>
      new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 2,
        modulationIndex: 3,
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.3 },
        modulation: { type: "square" },
        modulationEnvelope: { attack: 0.05, decay: 0.2, sustain: 0.5, release: 0.3 },
      }).toDestination(),
  },
  {
    id: "guitar",
    label: "ギター",
    emoji: "🎸",
    chordDuration: "4n",
    scaleDuration: "8n",
    createSynth: (Tone) =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.1, release: 0.8 },
      }).toDestination(),
  },
  {
    id: "strings",
    label: "ストリングス",
    emoji: "🎻",
    chordDuration: "1n",
    scaleDuration: "4n",
    createSynth: (Tone) =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.5, decay: 0.1, sustain: 0.8, release: 1.2 },
      }).toDestination(),
  },
  {
    id: "organ",
    label: "オルガン",
    emoji: "⛪",
    chordDuration: "2n",
    scaleDuration: "8n",
    createSynth: (Tone) =>
      new Tone.PolySynth(Tone.AMSynth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.01, sustain: 1.0, release: 0.15 },
        modulation: { type: "sine" },
        modulationEnvelope: { attack: 0.01, decay: 0.01, sustain: 1, release: 0.1 },
        harmonicity: 2,
      }).toDestination(),
  },
  {
    id: "flute",
    label: "フルート",
    emoji: "🪈",
    chordDuration: "2n",
    scaleDuration: "4n",
    createSynth: (Tone) =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.12, decay: 0.1, sustain: 0.8, release: 0.6 },
      }).toDestination(),
  },
  {
    id: "vibraphone",
    label: "ビブラフォン",
    emoji: "🎼",
    chordDuration: "2n",
    scaleDuration: "8n",
    createSynth: (Tone) =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.001, decay: 1.2, sustain: 0.05, release: 1.5 },
      }).toDestination(),
  },
  {
    id: "bass",
    label: "ベース",
    emoji: "🎵",
    chordDuration: "2n",
    scaleDuration: "4n",
    createSynth: (Tone) =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "square" },
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.6, release: 0.4 },
      }).toDestination(),
  },
];

export const DEFAULT_INSTRUMENT_ID: InstrumentId = "organ";

export function getInstrument(id: InstrumentId): InstrumentDef {
  return INSTRUMENTS.find((i) => i.id === id) ?? INSTRUMENTS[0];
}
