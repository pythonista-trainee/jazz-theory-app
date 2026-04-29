"use client";

import { useEffect, useRef } from "react";
import type { LickNote } from "@/types/music";
import { useContainerWidth } from "@/hooks/useContainerWidth";

interface Props {
  notes: LickNote[];
  /** Beat offset before phrase starts (0=downbeat, 0.5=off-beat). Renders as rest(s). */
  startBeat?: number;
  /** Total beats across the phrase (4 = 1 measure, 8 = 2 measures). */
  totalBeats?: number;
  height?: number;
}

const VF_DUR: Record<string, string> = {
  whole: "w", half: "h", quarter: "q", eighth: "8", sixteenth: "16",
};

const BEAT_VALUES: Record<string, number> = {
  whole: 4, half: 2, quarter: 1, eighth: 0.5, sixteenth: 0.25,
};

export function LickScoreViewer({ notes, startBeat = 0, totalBeats = 4, height = 160 }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const vfRef = useRef<HTMLDivElement>(null);
  const renderWidth = useContainerWidth(wrapperRef);

  const measures = Math.max(1, Math.round(totalBeats / 4));
  const totalHeight = measures > 1 ? height * measures : height;

  useEffect(() => {
    if (!vfRef.current || renderWidth < 50 || notes.length === 0) return;
    let cancelled = false;

    async function render() {
      const VF = await import("vexflow").then((m) => m.default ?? m);
      if (cancelled || !vfRef.current) return;

      vfRef.current.innerHTML = "";

      try {
        const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Beam, Tuplet } = VF;

        const renderer = new Renderer(vfRef.current, Renderer.Backends.SVG);
        renderer.resize(renderWidth, totalHeight);
        const ctx = renderer.getContext();

        // Split notes into per-measure buckets
        const measureData = buildMeasures(notes, startBeat, StaveNote, Accidental);

        const staveWidth = renderWidth - 20;

        for (let m = 0; m < measureData.length; m++) {
          const { restNotes: mRests, mainNotes: mMain, lickNotes: mLick } = measureData[m];
          const allNotes = [...mRests, ...mMain];

          const staveY = 20 + m * height;
          // First stave needs room for clef + time sig (~80px extra)
          const noteAreaWidth = m === 0 ? staveWidth - 80 : staveWidth - 30;

          const stave = new Stave(10, staveY, staveWidth);
          if (m === 0) stave.addClef("treble").addTimeSignature("4/4");
          stave.setContext(ctx).draw();

          const voice = new Voice({ num_beats: 4, beat_value: 4 });
          voice.setMode(Voice.Mode.SOFT);
          voice.addTickables(allNotes);

          // Beat-aligned beams
          const beams = createBeatAlignedBeams(mLick, mMain, Beam);
          // Tuplets for triplet groups
          const tuplets = buildTuplets(mLick, mMain, Tuplet);

          new Formatter().joinVoices([voice]).format([voice], noteAreaWidth);
          voice.draw(ctx, stave);
          beams.forEach((b: any) => b.setContext(ctx).draw());
          tuplets.forEach((t: any) => t.setContext(ctx).draw());
        }
      } catch {
        if (vfRef.current) {
          vfRef.current.innerHTML = `<p style="color:#666;padding:8px;font-size:12px">楽譜描画エラー</p>`;
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [notes, startBeat, totalBeats, renderWidth, height, totalHeight, measures]);

  return (
    <div ref={wrapperRef} className="w-full rounded-xl overflow-hidden bg-white" style={{ minHeight: totalHeight }}>
      <div ref={vfRef} />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface MeasureData {
  restNotes: any[];
  mainNotes: any[];
  lickNotes: LickNote[];
}

/** Split notes into per-measure buckets, prepending rests for pickup in measure 0. */
function buildMeasures(
  notes: LickNote[],
  startBeat: number,
  StaveNote: any,
  Accidental: any,
): MeasureData[] {
  const measures: MeasureData[] = [
    { restNotes: makeRests(startBeat, StaveNote), mainNotes: [], lickNotes: [] },
  ];
  let beatPos = startBeat;

  for (const ln of notes) {
    const beats = ln.triplet ? 1 / 3 : (BEAT_VALUES[ln.duration] ?? 0.5);
    const measureIdx = measures.length - 1;

    const sn = makeStaveNote(ln, StaveNote, Accidental);
    measures[measureIdx].mainNotes.push(sn);
    measures[measureIdx].lickNotes.push(ln);

    beatPos += beats;
    if (beatPos >= 4 - 0.001) {
      beatPos -= 4;
      measures.push({ restNotes: [], mainNotes: [], lickNotes: [] });
    }
  }

  // Remove trailing empty measure created at the exact boundary
  if (measures[measures.length - 1].mainNotes.length === 0 && measures.length > 1) {
    measures.pop();
  }

  return measures;
}

function makeStaveNote(ln: LickNote, StaveNote: any, Accidental: any): any {
  const pitch = ln.note.replace(/[#b]/, "").toLowerCase();
  const key = `${pitch}/${ln.octave}`;
  const dur = VF_DUR[ln.duration] ?? "8";
  const sn = new StaveNote({ keys: [key], duration: dur });
  if (ln.note.includes("#")) sn.addModifier(new Accidental("#"), 0);
  else if (ln.note.length > 1 && ln.note.endsWith("b")) sn.addModifier(new Accidental("b"), 0);
  return sn;
}

function makeRests(startBeat: number, StaveNote: any): any[] {
  const rests: any[] = [];
  let rem = startBeat;
  const restMap: [number, string][] = [[2,"h"],[1,"q"],[0.5,"8"],[0.25,"16"]];
  for (const [beats, dur] of restMap) {
    while (rem >= beats - 0.001) {
      rests.push(new StaveNote({ keys: ["b/4"], duration: `${dur}r` }));
      rem -= beats;
    }
  }
  return rests;
}

/**
 * Beam pairs of 8th/16th notes that start at on-beat (integer beat) positions.
 * Off-beat pickup notes are left as single flagged notes.
 */
function createBeatAlignedBeams(lickNotes: LickNote[], staveNotes: any[], Beam: any): any[] {
  const beams: any[] = [];
  let beatPos = 0;
  let i = 0;

  while (i < lickNotes.length) {
    const ln = lickNotes[i];
    const beats = ln.triplet ? 1 / 3 : (BEAT_VALUES[ln.duration] ?? 0.5);

    if ((ln.duration === "eighth" || ln.duration === "sixteenth") && !ln.triplet) {
      const frac = beatPos - Math.floor(beatPos);
      const isOnBeat = frac < 0.01 || frac > 0.99;

      if (isOnBeat) {
        // Beam up to 1 beat worth of 8th/16th notes
        const beamGroup: any[] = [];
        let j = i;
        let groupBeat = beatPos;
        const nextBeat = Math.floor(beatPos) + 1;
        while (
          j < lickNotes.length &&
          (lickNotes[j].duration === "eighth" || lickNotes[j].duration === "sixteenth") &&
          !lickNotes[j].triplet &&
          groupBeat < nextBeat - 0.01
        ) {
          beamGroup.push(staveNotes[j]);
          groupBeat += BEAT_VALUES[lickNotes[j].duration] ?? 0.5;
          j++;
        }
        if (beamGroup.length >= 2) {
          try { beams.push(new Beam(beamGroup)); } catch { /* skip */ }
          i = j;
          beatPos = groupBeat;
          continue;
        }
      }
    }

    beatPos += beats;
    i++;
  }

  return beams;
}

function buildTuplets(lickNotes: LickNote[], staveNotes: any[], Tuplet: any): any[] {
  const tuplets: any[] = [];
  let i = 0;
  while (i < lickNotes.length) {
    if (lickNotes[i].triplet) {
      const start = i;
      while (i < lickNotes.length && lickNotes[i].triplet) i++;
      const group = staveNotes.slice(start, i);
      for (let g = 0; g + 3 <= group.length; g += 3) {
        try {
          tuplets.push(new Tuplet(group.slice(g, g + 3), { num_notes: 3, notes_occupied: 2 }));
        } catch { /* skip */ }
      }
    } else {
      i++;
    }
  }
  return tuplets;
}
