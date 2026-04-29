/**
 * Lick Generator — artist-attributed jazz phrases with triplets & swing.
 *
 * Each pattern's note beats + startBeat must equal totalBeats.
 */
import type { Chord, Scale, Lick, LickNote, Duration, Octave } from "@/types/music";

export type Difficulty = "easy" | "medium" | "hard";

interface NoteTemplate {
  degree: number;
  duration: Duration;
  triplet?: boolean;
}

interface LickPattern {
  artist: string;
  title: string;
  startBeat: number;
  totalBeats: number;
  difficulty: Difficulty;
  templates: NoteTemplate[];
}

// ── 1-measure patterns (totalBeats = 4) ──────────────────────────────────────
const PATTERNS_1M: LickPattern[] = [
  // ── John Coltrane ──────────────────────────────────────────────────────────
  {
    artist: "ジョン・コルトレーン",
    title: "シーツ・オブ・サウンド",
    startBeat: 0,
    totalBeats: 4,
    difficulty: "hard",
    // 12 triplet 8ths = 4 beats
    templates: [
      { degree:0, duration:"eighth", triplet:true },
      { degree:1, duration:"eighth", triplet:true },
      { degree:2, duration:"eighth", triplet:true },
      { degree:3, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth", triplet:true },
      { degree:5, duration:"eighth", triplet:true },
      { degree:6, duration:"eighth", triplet:true },
      { degree:5, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth", triplet:true },
      { degree:3, duration:"eighth", triplet:true },
      { degree:2, duration:"eighth", triplet:true },
      { degree:0, duration:"eighth", triplet:true },
    ],
  },
  {
    artist: "ジョン・コルトレーン",
    title: "アルペジオ・カスケード",
    startBeat: 0,
    totalBeats: 4,
    difficulty: "medium",
    // 6 triplet 8ths (2 beats) + 2 quarters (2 beats) = 4 beats
    templates: [
      { degree:0, duration:"eighth", triplet:true },
      { degree:2, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth", triplet:true },
      { degree:6, duration:"eighth", triplet:true },
      { degree:5, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth", triplet:true },
      { degree:2, duration:"quarter" },
      { degree:0, duration:"quarter" },
    ],
  },

  // ── Clifford Brown ─────────────────────────────────────────────────────────
  {
    artist: "クリフォード・ブラウン",
    title: "ビバップ・カデンツ",
    startBeat: 0.5,
    totalBeats: 4,
    difficulty: "easy",
    // 7 eighth notes = 3.5 beats  (+ 0.5 pickup = 4)
    templates: [
      { degree:6, duration:"eighth" },
      { degree:5, duration:"eighth" },
      { degree:4, duration:"eighth" },
      { degree:3, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:1, duration:"eighth" },
      { degree:0, duration:"eighth" },
    ],
  },
  {
    artist: "クリフォード・ブラウン",
    title: "コード・トーン・アウトライン",
    startBeat: 0,
    totalBeats: 4,
    difficulty: "easy",
    // 8 eighth notes = 4 beats
    templates: [
      { degree:4, duration:"eighth" },
      { degree:6, duration:"eighth" },
      { degree:4, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:4, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:1, duration:"eighth" },
      { degree:0, duration:"eighth" },
    ],
  },

  // ── Miles Davis ────────────────────────────────────────────────────────────
  {
    artist: "マイルス・デイヴィス",
    title: "リリカル・ステイトメント",
    startBeat: 1,
    totalBeats: 4,
    difficulty: "easy",
    // 3 quarters = 3 beats  (+ 1 pickup = 4)
    templates: [
      { degree:4, duration:"quarter" },
      { degree:2, duration:"quarter" },
      { degree:0, duration:"quarter" },
    ],
  },
  {
    artist: "マイルス・デイヴィス",
    title: "モーダル・スペース",
    startBeat: 1.5,
    totalBeats: 4,
    difficulty: "easy",
    // 5 eighth notes = 2.5 beats  (+ 1.5 pickup = 4)
    templates: [
      { degree:5, duration:"eighth" },
      { degree:4, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:1, duration:"eighth" },
      { degree:0, duration:"eighth" },
    ],
  },

  // ── Roy Hargrove ───────────────────────────────────────────────────────────
  {
    artist: "ロイ・ハーグローブ",
    title: "ハードバップ・グルーヴ",
    startBeat: 0.5,
    totalBeats: 4,
    difficulty: "medium",
    // 3 triplet 8ths (1 beat) + 5 eighths (2.5 beats) = 3.5 beats  (+ 0.5 = 4)
    templates: [
      { degree:0, duration:"eighth", triplet:true },
      { degree:1, duration:"eighth", triplet:true },
      { degree:2, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth" },
      { degree:3, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:1, duration:"eighth" },
      { degree:0, duration:"eighth" },
    ],
  },
  {
    artist: "ロイ・ハーグローブ",
    title: "シンコペーション・ライン",
    startBeat: 0,
    totalBeats: 4,
    difficulty: "medium",
    // quarter + 3 triplets + quarter + 3 triplets = 1+1+1+1 = 4 beats
    templates: [
      { degree:2, duration:"quarter" },
      { degree:4, duration:"eighth", triplet:true },
      { degree:3, duration:"eighth", triplet:true },
      { degree:2, duration:"eighth", triplet:true },
      { degree:0, duration:"quarter" },
      { degree:2, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth", triplet:true },
      { degree:6, duration:"eighth", triplet:true },
    ],
  },

  // ── Charlie Parker ─────────────────────────────────────────────────────────
  {
    artist: "チャーリー・パーカー",
    title: "エンクロージャー",
    startBeat: 0.5,
    totalBeats: 4,
    difficulty: "easy",
    // 7 eighth notes = 3.5 beats  (+ 0.5 = 4)
    templates: [
      { degree:1, duration:"eighth" },
      { degree:0, duration:"eighth" },
      { degree:6, duration:"eighth" },
      { degree:0, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:4, duration:"eighth" },
      { degree:3, duration:"eighth" },
    ],
  },

  // ── Freddie Hubbard ────────────────────────────────────────────────────────
  {
    artist: "フレディ・ハバード",
    title: "ポストバップ・トリプレット",
    startBeat: 0,
    totalBeats: 4,
    difficulty: "medium",
    // 3trip(1) + q(1) + 3trip(1) + q(1) = 4 beats
    templates: [
      { degree:2, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth", triplet:true },
      { degree:6, duration:"eighth", triplet:true },
      { degree:4, duration:"quarter" },
      { degree:0, duration:"eighth", triplet:true },
      { degree:2, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth", triplet:true },
      { degree:0, duration:"quarter" },
    ],
  },

  // ── Lee Morgan ─────────────────────────────────────────────────────────────
  {
    artist: "リー・モーガン",
    title: "ハードバップ・スウィング",
    startBeat: 0,
    totalBeats: 4,
    difficulty: "easy",
    // 8 eighth notes = 4 beats
    templates: [
      { degree:2, duration:"eighth" },
      { degree:4, duration:"eighth" },
      { degree:6, duration:"eighth" },
      { degree:5, duration:"eighth" },
      { degree:4, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:1, duration:"eighth" },
      { degree:0, duration:"eighth" },
    ],
  },
];

// ── 2-measure patterns (totalBeats = 8) ──────────────────────────────────────
const PATTERNS_2M: LickPattern[] = [
  {
    artist: "ジョン・コルトレーン",
    title: "コルトレーン・チェンジ",
    startBeat: 0,
    totalBeats: 8,
    difficulty: "hard",
    templates: [
      { degree:0, duration:"eighth", triplet:true },
      { degree:2, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth", triplet:true },
      { degree:6, duration:"eighth", triplet:true },
      { degree:5, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth", triplet:true },
      { degree:2, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth", triplet:true },
      { degree:6, duration:"eighth", triplet:true },
      { degree:5, duration:"eighth", triplet:true },
      { degree:3, duration:"eighth", triplet:true },
      { degree:1, duration:"eighth", triplet:true },
      { degree:0, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:4, duration:"eighth" },
      { degree:3, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:1, duration:"eighth" },
      { degree:0, duration:"quarter" },
    ],
  },
  {
    artist: "チャーリー・パーカー",
    title: "バップ・ライン",
    startBeat: 0.5,
    totalBeats: 8,
    difficulty: "hard",
    // 15 eighth notes = 7.5 beats  (+ 0.5 pickup = 8)
    templates: [
      { degree:6, duration:"eighth" },
      { degree:5, duration:"eighth" },
      { degree:4, duration:"eighth" },
      { degree:3, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:1, duration:"eighth" },
      { degree:0, duration:"eighth" },
      { degree:1, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:4, duration:"eighth" },
      { degree:3, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:1, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:0, duration:"eighth" },
    ],
  },
  {
    artist: "クリフォード・ブラウン",
    title: "ブルー・フレーズ",
    startBeat: 0,
    totalBeats: 8,
    difficulty: "hard",
    templates: [
      { degree:0, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:4, duration:"eighth" },
      { degree:6, duration:"eighth" },
      { degree:5, duration:"eighth" },
      { degree:4, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:1, duration:"eighth" },
      { degree:0, duration:"eighth", triplet:true },
      { degree:2, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth", triplet:true },
      { degree:2, duration:"quarter" },
      { degree:6, duration:"eighth", triplet:true },
      { degree:5, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth", triplet:true },
      { degree:0, duration:"quarter" },
    ],
  },
  {
    artist: "マイルス・デイヴィス",
    title: "カインド・オブ・ブルー",
    startBeat: 1,
    totalBeats: 8,
    difficulty: "hard",
    // quarter rest + 13 notes = 7 beats  (+ 1 pickup = 8)
    templates: [
      { degree:4, duration:"eighth" },
      { degree:5, duration:"eighth" },
      { degree:4, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:4, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:0, duration:"quarter" },
      { degree:2, duration:"eighth" },
      { degree:4, duration:"eighth" },
      { degree:6, duration:"eighth" },
      { degree:5, duration:"eighth" },
      { degree:4, duration:"eighth" },
      { degree:2, duration:"half" },
    ],
  },
  {
    artist: "フレディ・ハバード",
    title: "ハバード・ライド",
    startBeat: 0,
    totalBeats: 8,
    difficulty: "hard",
    templates: [
      { degree:2, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth", triplet:true },
      { degree:6, duration:"eighth", triplet:true },
      { degree:4, duration:"quarter" },
      { degree:0, duration:"eighth", triplet:true },
      { degree:2, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth", triplet:true },
      { degree:0, duration:"quarter" },
      { degree:4, duration:"eighth", triplet:true },
      { degree:5, duration:"eighth", triplet:true },
      { degree:6, duration:"eighth", triplet:true },
      { degree:2, duration:"eighth", triplet:true },
      { degree:3, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth", triplet:true },
      { degree:0, duration:"half" },
    ],
  },
  {
    artist: "ロイ・ハーグローブ",
    title: "ハーグローブ・グルーヴ",
    startBeat: 0.5,
    totalBeats: 8,
    difficulty: "hard",
    // 15 notes = 7.5 beats  (+ 0.5 pickup = 8)
    templates: [
      { degree:0, duration:"eighth", triplet:true },
      { degree:1, duration:"eighth", triplet:true },
      { degree:2, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth" },
      { degree:3, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:1, duration:"eighth" },
      { degree:0, duration:"quarter" },
      { degree:2, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth", triplet:true },
      { degree:6, duration:"eighth", triplet:true },
      { degree:4, duration:"eighth" },
      { degree:2, duration:"eighth" },
      { degree:1, duration:"eighth" },
      { degree:0, duration:"eighth" },
    ],
  },
];

const ALL_PATTERNS = [...PATTERNS_1M, ...PATTERNS_2M];

// ── Builder ───────────────────────────────────────────────────────────────────

export function generateLick(chord: Chord, scale: Scale, difficulty: Difficulty = "medium"): Lick {
  const candidates = ALL_PATTERNS.filter((p) => p.difficulty === difficulty);
  const pool = candidates.length > 0 ? candidates : ALL_PATTERNS;
  const pattern = pool[Math.floor(Math.random() * pool.length)];

  const notes: LickNote[] = pattern.templates.map(({ degree, duration, triplet }) => {
    const noteIndex = degree % scale.notes.length;
    const octaveBump = Math.floor(degree / scale.notes.length);
    return {
      note: scale.notes[noteIndex],
      octave: (4 + octaveBump) as Octave,
      duration,
      triplet,
    };
  });

  return {
    id: Math.random().toString(36).slice(2),
    artist: pattern.artist,
    title: pattern.title,
    targetChord: chord,
    scale,
    notes,
    abc: toABC(notes, chord.symbol, pattern.startBeat),
    bpm: 120,
    startBeat: pattern.startBeat,
    totalBeats: pattern.totalBeats,
  };
}

// ── ABC notation ──────────────────────────────────────────────────────────────

const ABC_DURATION: Record<Duration, string> = {
  whole: "8", half: "4", quarter: "2", eighth: "", sixteenth: "/2",
};
const OCTAVE_MARK: Record<number, string> = { 3:",", 4:"", 5:"'", 6:"''" };

function toABCNote(ln: LickNote): string {
  const acc = ln.note.includes("#") ? "^" : ln.note.includes("b") ? "_" : "";
  const letter = ln.note.replace(/[#b]/, "");
  return `${acc}${letter}${OCTAVE_MARK[ln.octave] ?? ""}${ABC_DURATION[ln.duration]}`;
}

function toABC(notes: LickNote[], sym: string, startBeat: number): string {
  const restMap: Record<number, string> = { 0.5:"z", 1:"z2", 1.5:"z3" };
  const prefix = startBeat > 0 ? `${restMap[startBeat] ?? "z"} ` : "";
  return `X:1\nT:${sym} Lick\nM:4/4\nL:1/8\nQ:120\nK:C\n| ${prefix}${notes.map(toABCNote).join(" ")} |`;
}
