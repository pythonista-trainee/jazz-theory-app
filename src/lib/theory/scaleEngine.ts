/**
 * Scale Engine — maps chords to candidate scales with fit scores.
 */
import { Scale as TonalScale } from "tonal";
import type { Chord, Scale, ScaleName, NoteName } from "@/types/music";

interface ScaleRule {
  qualities: string[];
  scales: Array<{
    name: ScaleName;
    fitScore: 1 | 2 | 3 | 4 | 5;
    description: string;
  }>;
}

// Rule table: chord quality → recommended scales
const SCALE_RULES: ScaleRule[] = [
  {
    qualities: ["maj7", "maj9", "6"],
    scales: [
      {
        name: "major",
        fitScore: 5,
        description: "Ionian（長音階）。maj7コードの基本スケール。",
      },
      {
        name: "lydian",
        fitScore: 4,
        description: "♯4度が特徴。浮遊感のあるmaj7に最適。",
      },
      {
        name: "bebop major",
        fitScore: 3,
        description: "長音階に♭6を加えた8音スケール。スウィング感が出やすい。",
      },
    ],
  },
  {
    qualities: ["m7", "m9", "m6"],
    scales: [
      {
        name: "dorian",
        fitScore: 5,
        description: "♭3・♭7のマイナー。II-V-Iのルーツ。ジャズで最も頻出。",
      },
      {
        name: "minor",
        fitScore: 3,
        description: "ナチュラルマイナー。暗めのサウンド。",
      },
      {
        name: "melodic minor",
        fitScore: 4,
        description: "♭3のみのマイナー。明るさとマイナー感を両立。",
      },
    ],
  },
  {
    qualities: ["7", "9", "7sus4"],
    scales: [
      {
        name: "mixolydian",
        fitScore: 5,
        description: "♭7度の長音階。ドミナント7thの基本スケール。",
      },
      {
        name: "lydian dominant",
        fitScore: 4,
        description: "♯4・♭7。tritone substituteや解決前のテンションに。",
      },
      {
        name: "bebop dominant",
        fitScore: 5,
        description: "ミクソリディアンに♮7を加えた8音。スウィング必須スケール。",
      },
      {
        name: "altered",
        fitScore: 4,
        description: "♭9・♯9・♭5・♯5全テンション。緊張感最大のドミナントスケール。",
      },
    ],
  },
  {
    qualities: ["m7b5"],
    scales: [
      {
        name: "locrian",
        fitScore: 4,
        description: "ハーフディミニッシュに対応するロークリアン。",
      },
      {
        name: "half-whole diminished",
        fitScore: 5,
        description: "半音・全音交互の対称スケール。ハーフディミニッシュに鉄板。",
      },
    ],
  },
  {
    qualities: ["dim7"],
    scales: [
      {
        name: "whole-half diminished",
        fitScore: 5,
        description: "全音・半音交互の対称スケール。ディミニッシュコードに完全一致。",
      },
      {
        name: "half-whole diminished",
        fitScore: 4,
        description: "半音始まりのディミニッシュスケール。ドミナント的使用にも。",
      },
    ],
  },
];

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Get candidate scales for a chord, ordered by fitScore descending.
 */
export function getScalesForChord(chord: Chord): Scale[] {
  const rule = SCALE_RULES.find((r) => r.qualities.includes(chord.quality));
  if (!rule) return getScalesForChord({ ...chord, quality: "maj7" });

  return rule.scales
    .map((s) => buildScale(chord.root, s.name, s.fitScore, s.description))
    .sort((a, b) => b.fitScore - a.fitScore);
}

function buildScale(
  root: NoteName,
  name: ScaleName,
  fitScore: 1 | 2 | 3 | 4 | 5,
  description: string
): Scale {
  const tonalScale = TonalScale.get(`${root} ${name}`);
  const notes = (tonalScale.notes.length > 0
    ? tonalScale.notes
    : fallbackNotes(root, name)
  ).map((n) => n as NoteName);

  return { root, name, notes, fitScore, description };
}

/**
 * Fallback for scale types Tonal may not recognise by exact name.
 */
function fallbackNotes(root: NoteName, name: ScaleName): string[] {
  // For bebop / altered etc., use closest Tonal alias
  const aliasMap: Partial<Record<ScaleName, string>> = {
    "bebop dominant": "mixolydian",
    "bebop major": "major",
    "lydian dominant": "lydian dominant",
    altered: "altered",
    "half-whole diminished": "half-whole diminished",
    "whole-half diminished": "whole-half diminished",
  };
  const alias = aliasMap[name] ?? name;
  const s = TonalScale.get(`${root} ${alias}`);
  return s.notes.length > 0 ? s.notes : [root];
}

// ── II-V-I scale suggestion ───────────────────────────────────────────────────

export interface ProgressionScaleMap {
  chordSymbol: string;
  primaryScale: Scale;
  alternatives: Scale[];
}

export function getProgressionScales(
  chords: Chord[]
): ProgressionScaleMap[] {
  return chords.map((chord) => {
    const scales = getScalesForChord(chord);
    return {
      chordSymbol: chord.symbol,
      primaryScale: scales[0],
      alternatives: scales.slice(1),
    };
  });
}
