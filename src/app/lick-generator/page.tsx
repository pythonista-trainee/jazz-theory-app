"use client";

import { useState, useCallback } from "react";
import type { Lick, LickNote } from "@/types/music";
import { buildChord } from "@/lib/theory/chordEngine";
import { getScalesForChord } from "@/lib/theory/scaleEngine";
import { generateLick, type Difficulty } from "@/lib/lick/lickGenerator";
import { LickScoreViewer } from "@/components/score/LickScoreViewer";
import { ChordPicker } from "@/components/chord/ChordPicker";
import { Button } from "@/components/ui/Button";
import { formatNote } from "@/lib/theory/noteFormat";
import { useInstrument } from "@/context/InstrumentContext";
import { getInstrument } from "@/lib/audio/instruments";

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; desc: string }[] = [
  { value: "easy",   label: "初級", desc: "8分音符中心・三連符なしか1グループ" },
  { value: "medium", label: "中級", desc: "三連符あり・1小節" },
  { value: "hard",   label: "上級", desc: "複雑な三連符・2小節フレーズ" },
];

const DURATION_BEATS: Record<string, number> = {
  whole: 4, half: 2, quarter: 1, eighth: 0.5, sixteenth: 0.25,
};

function computeSwingSchedule(
  notes: LickNote[],
  bpm: number,
  startBeat: number,
  swingRatio = 0.65,
): { startSec: number; durationSec: number }[] {
  const beatSec = 60 / bpm;
  const longSec  = beatSec * swingRatio;
  const shortSec = beatSec * (1 - swingRatio);

  let t = 0;
  let straightBeatPos = startBeat;

  return notes.map((note) => {
    const startSec = t;
    let advanceSec: number;
    let straightAdvance: number;

    if (note.triplet) {
      advanceSec = beatSec / 3;
      straightAdvance = 1 / 3;
    } else if (note.duration === "eighth") {
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
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [lick, setLick] = useState<Lick | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { instrumentId } = useInstrument();

  const chord = buildChord(chordSymbol);
  const scales = chord ? getScalesForChord(chord) : [];

  const generate = useCallback(() => {
    if (!chord || !scales.length) return;
    setLick(generateLick(chord, scales[0], difficulty));
  }, [chord, scales, difficulty]);

  async function playLick() {
    if (!lick || isPlaying) return;
    setIsPlaying(true);
    try {
      const Tone = await import("tone");
      await Tone.start();
      const inst = getInstrument(instrumentId);
      const synth = inst.createSynth(Tone);

      const schedule = computeSwingSchedule(lick.notes, lick.bpm, lick.startBeat);
      const beatSec = 60 / lick.bpm;
      const countInBeats = 4;
      const countInSec = countInBeats * beatSec;
      const now = Tone.now();

      // Click synth (shared for count-in and lick)
      const clickSynth = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 },
        volume: -10,
      }).toDestination();

      // 4-beat count-in (beat 1 slightly higher pitch)
      for (let beat = 0; beat < countInBeats; beat++) {
        const pitch = beat === 0 ? "C6" : "G5";
        clickSynth.triggerAttackRelease(pitch, "32n", now + beat * beatSec);
      }

      // Lick melody (offset by count-in)
      lick.notes.forEach((n, i) => {
        const { startSec, durationSec } = schedule[i];
        synth.triggerAttackRelease(
          `${n.note}${n.octave}`,
          durationSec,
          now + countInSec + startSec,
        );
      });

      // Quarter-note click track during lick
      const totalBeats = lick.totalBeats ?? 4;
      for (let beat = 0; beat < totalBeats; beat++) {
        const pitch = beat === 0 ? "C6" : "G5";
        clickSynth.triggerAttackRelease(pitch, "32n", now + countInSec + beat * beatSec);
      }

      const last = schedule[schedule.length - 1];
      const totalSec = countInSec + last.startSec + last.durationSec;
      setTimeout(() => {
        synth.dispose();
        clickSynth.dispose();
        setIsPlaying(false);
      }, totalSec * 1000 + 600);
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

      {/* Difficulty selector */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-jazz-muted mb-3">難易度</p>
        <div className="flex gap-2">
          {DIFFICULTY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setDifficulty(opt.value); setLick(null); }}
              className={`flex-1 py-3 px-2 rounded-xl border text-center transition-all ${
                difficulty === opt.value
                  ? "bg-jazz-accent border-jazz-accent text-white"
                  : "bg-jazz-card border-white/10 text-jazz-muted hover:border-white/30"
              }`}
            >
              <p className="font-bold text-sm">{opt.label}</p>
              <p className="text-xs mt-0.5 opacity-70 hidden sm:block">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chord picker */}
      <div className="bg-jazz-card border border-white/10 rounded-2xl p-5 mb-6">
        <p className="text-xs uppercase tracking-widest text-jazz-muted mb-3">コードを選択</p>
        <ChordPicker value={chordSymbol} onChange={(s) => { setChordSymbol(s); setLick(null); }} />
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
            {isPlaying ? "⏸ 演奏中..." : "▶ 演奏 (4拍カウント)"}
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
              {(lick.totalBeats ?? 4) > 4 && (
                <span className="px-2 py-1 bg-jazz-surface rounded-md text-jazz-muted">2小節</span>
              )}
              {lick.startBeat > 0 && (
                <span className="px-2 py-1 bg-jazz-surface rounded-md text-jazz-muted">
                  ↩ Pickup +{lick.startBeat}拍
                </span>
              )}
              {lick.notes.some((n) => n.triplet) && (
                <span className="px-2 py-1 bg-jazz-surface rounded-md text-jazz-muted">3連符</span>
              )}
            </div>
          </div>

          <LickScoreViewer
            notes={lick.notes}
            startBeat={lick.startBeat}
            totalBeats={lick.totalBeats ?? 4}
            height={160}
          />

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
