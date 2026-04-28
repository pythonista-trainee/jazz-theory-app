"use client";

import { useState, useCallback } from "react";
import type { Lick, LickNote } from "@/types/music";
import { buildChord } from "@/lib/theory/chordEngine";
import { getScalesForChord } from "@/lib/theory/scaleEngine";
import { generateLick } from "@/lib/lick/lickGenerator";
import { LickScoreViewer } from "@/components/score/LickScoreViewer";
import { Button } from "@/components/ui/Button";
import { formatNote } from "@/lib/theory/noteFormat";
import { useInstrument } from "@/context/InstrumentContext";
import { getInstrument } from "@/lib/audio/instruments";

const CHORD_PRESETS = [
  "Dm7", "G7", "Cmaj7", "Am7", "Fm7", "Bb7", "Ebmaj7",
  "Bm7b5", "E7", "Bdim7", "C7", "Abmaj7",
];

const DURATION_BEATS: Record<string, number> = {
  whole: 4, half: 2, quarter: 1, eighth: 0.5, sixteenth: 0.25,
};

/**
 * スウィング＋三連符対応のタイムテーブル計算。
 *
 * - 八分音符: 表拍(long)・裏拍(short)を交互に割り当て（スウィング）
 * - 三連符: 1/3 拍を均等割り、スウィング適用なし
 * - 四分音符以上: ストレートタイミング
 *
 * `straightBeatPos` は on/off beat 判定用の直線的な拍位置。
 * `t` は実際のスウィング適用後の発音時刻。
 */
function computeSwingSchedule(
  notes: LickNote[],
  bpm: number,
  startBeat: number,
  swingRatio = 0.65
): { startSec: number; durationSec: number }[] {
  const beatSec = 60 / bpm;
  const longSec  = beatSec * swingRatio;
  const shortSec = beatSec * (1 - swingRatio);

  let t = 0;
  let straightBeatPos = startBeat; // 判定用の直線位置

  return notes.map((note) => {
    const startSec = t;
    let advanceSec: number;
    let straightAdvance: number;

    if (note.triplet) {
      // 三連符: スウィングなし、1/3拍均等
      advanceSec = beatSec / 3;
      straightAdvance = 1 / 3;
    } else if (note.duration === "eighth") {
      // オンビートかどうかは直線位置の小数部で判定
      const frac = straightBeatPos - Math.floor(straightBeatPos);
      const isOnBeat = frac < 0.12 || frac > 0.88;
      advanceSec = isOnBeat ? longSec : shortSec;
      straightAdvance = 0.5;
    } else {
      const beats = DURATION_BEATS[note.duration] ?? 0.5;
      advanceSec = beats * beatSec;
      straightAdvance = beats;
    }

    t += advanceSec;
    straightBeatPos += straightAdvance;
    return { startSec, durationSec: advanceSec * 0.88 };
  });
}

export default function LickGeneratorPage() {
  const [chordSymbol, setChordSymbol] = useState("Dm7");
  const [lick, setLick] = useState<Lick | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { instrumentId } = useInstrument();

  const chord = buildChord(chordSymbol);
  const scales = chord ? getScalesForChord(chord) : [];

  const generate = useCallback(() => {
    if (!chord || !scales.length) return;
    setLick(generateLick(chord, scales[0]));
  }, [chord, scales]);

  async function playLick() {
    if (!lick || isPlaying) return;
    setIsPlaying(true);
    try {
      const Tone = await import("tone");
      await Tone.start();
      const inst = getInstrument(instrumentId);
      const synth = inst.createSynth(Tone);
      const schedule = computeSwingSchedule(lick.notes, lick.bpm, lick.startBeat);
      const now = Tone.now();
      lick.notes.forEach((n, i) => {
        const { startSec, durationSec } = schedule[i];
        synth.triggerAttackRelease(`${n.note}${n.octave}`, durationSec, now + startSec);
      });
      const last = schedule[schedule.length - 1];
      setTimeout(() => { synth.dispose(); setIsPlaying(false); }, (last.startSec + last.durationSec) * 1000 + 600);
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-jazz-gold mb-2">Lick Generator</h2>
        <p className="text-jazz-muted text-sm">
          伝説のジャズマンが使うフレーズをコード別に生成・演奏する
        </p>
      </div>

      {/* Chord picker */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-jazz-muted mb-3">コードを選択</p>
        <div className="flex flex-wrap gap-2">
          {CHORD_PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => { setChordSymbol(c); setLick(null); }}
              className={`px-4 py-2 rounded-xl font-mono font-bold text-sm border transition-all ${
                chordSymbol === c
                  ? "bg-jazz-accent border-jazz-accent text-white"
                  : "bg-jazz-card border-white/10 text-jazz-muted hover:border-white/30"
              }`}
            >
              {formatNote(c)}
            </button>
          ))}
        </div>
      </div>

      {/* Scale info */}
      {chord && scales.length > 0 && (
        <div className="bg-jazz-card border border-white/10 rounded-2xl p-5 mb-6">
          <p className="text-xs uppercase tracking-widest text-jazz-muted mb-2">
            推奨スケール ({formatNote(chord.symbol)})
          </p>
          <div className="flex items-center gap-4">
            <div>
              <p className="font-bold text-jazz-text">
                {formatNote(scales[0].root)} {scales[0].name}
              </p>
              <p className="text-jazz-muted text-xs font-mono mt-1">
                {scales[0].notes.map(formatNote).join(" · ")}
              </p>
            </div>
            <p className="text-jazz-muted text-sm flex-1 hidden md:block">
              {scales[0].description}
            </p>
          </div>
        </div>
      )}

      {/* Generate + Play buttons */}
      <div className="flex gap-3 mb-8">
        <Button size="lg" onClick={generate} className="flex-1">
          Lickを生成
        </Button>
        {lick && (
          <Button size="lg" variant="secondary" onClick={playLick} disabled={isPlaying}>
            {isPlaying ? "⏸ 演奏中..." : "▶ 演奏"}
          </Button>
        )}
      </div>

      {/* Score */}
      {lick && (
        <div className="bg-jazz-card border border-white/10 rounded-2xl p-5 space-y-4">
          {/* Artist attribution */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-jazz-gold font-bold text-sm">
                {lick.artist} がよく使うフレーズ
              </p>
              <p className="text-jazz-muted text-xs mt-0.5">{lick.title}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-jazz-surface rounded-md text-jazz-muted">🎵 Swing</span>
              {lick.startBeat > 0 && (
                <span className="px-2 py-1 bg-jazz-surface rounded-md text-jazz-muted">
                  ↩ Pickup +{lick.startBeat}拍
                </span>
              )}
              {lick.notes.some((n) => n.triplet) && (
                <span className="px-2 py-1 bg-jazz-surface rounded-md text-jazz-muted">
                  3連符
                </span>
              )}
            </div>
          </div>

          {/* Responsive score — no fixed width needed */}
          <LickScoreViewer notes={lick.notes} startBeat={lick.startBeat} height={160} />

          {/* Note badges */}
          <div className="flex flex-wrap gap-2">
            {lick.notes.map((n, i) => (
              <div key={i} className="bg-jazz-surface rounded-lg px-3 py-1.5 text-center">
                <p className="font-mono font-bold text-jazz-gold text-sm">
                  {formatNote(n.note)}{n.octave}
                </p>
                <p className="text-jazz-muted text-xs">
                  {n.triplet ? "3連" : n.duration}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
