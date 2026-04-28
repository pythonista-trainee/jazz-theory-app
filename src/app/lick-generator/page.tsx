"use client";

import { useState, useCallback } from "react";
import type { Lick } from "@/types/music";
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
 * スウィング再生タイムテーブルを計算する。
 * 八分音符は表拍(long)・裏拍(short)の不均等な長さになる。
 * swingRatio=0.65 → 表:裏 = 65%:35%（ミディアムスウィング）
 */
function computeSwingSchedule(
  notes: { duration: string }[],
  bpm: number,
  startBeat: number,
  swingRatio = 0.65
): { startSec: number; durationSec: number }[] {
  const beatSec = 60 / bpm;
  const longSec  = beatSec * swingRatio;       // 表拍 8分音符
  const shortSec = beatSec * (1 - swingRatio); // 裏拍 8分音符

  // ピックアップ分のオフセット（ここで拍カウンターも揃える）
  let t = 0;
  let eighthCount = Math.round(startBeat * 2); // 開始位置の8分音符カウント

  const schedule: { startSec: number; durationSec: number }[] = [];

  for (const note of notes) {
    const advanceSec = (() => {
      if (note.duration === "eighth") {
        const isOnBeat = eighthCount % 2 === 0;
        eighthCount++;
        return isOnBeat ? longSec : shortSec;
      }
      const beats = DURATION_BEATS[note.duration] ?? 0.5;
      eighthCount += beats * 2;
      return beats * beatSec;
    })();
    schedule.push({ startSec: t, durationSec: advanceSec * 0.88 });
    t += advanceSec;
  }
  return schedule;
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

      const lastEntry = schedule[schedule.length - 1];
      const totalMs = (lastEntry.startSec + lastEntry.durationSec) * 1000 + 600;
      setTimeout(() => { synth.dispose(); setIsPlaying(false); }, totalMs);
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
          コード+スケールから常套句（Lick）を自動生成・演奏する
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
        <div className="space-y-4">
          <div className="bg-jazz-card border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-widest text-jazz-muted">
                {formatNote(lick.title)}
              </p>
              <div className="flex gap-2 text-xs text-jazz-muted">
                <span className="px-2 py-1 bg-jazz-surface rounded-md">
                  🎵 Swing
                </span>
                {lick.startBeat > 0 && (
                  <span className="px-2 py-1 bg-jazz-surface rounded-md">
                    ↩ Pickup +{lick.startBeat}拍
                  </span>
                )}
              </div>
            </div>
            <LickScoreViewer notes={lick.notes} width={560} height={160} />

            {/* Note badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {lick.notes.map((n, i) => (
                <div key={i} className="bg-jazz-surface rounded-lg px-3 py-1.5 text-center">
                  <p className="font-mono font-bold text-jazz-gold text-sm">
                    {formatNote(n.note)}{n.octave}
                  </p>
                  <p className="text-jazz-muted text-xs">{n.duration}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
