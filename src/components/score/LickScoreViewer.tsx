"use client";

import { useEffect, useRef } from "react";
import type { LickNote } from "@/types/music";
import { useContainerWidth } from "@/hooks/useContainerWidth";

interface Props {
  notes: LickNote[];
  /** Beat offset before phrase starts (0=downbeat, 0.5=off-beat). Renders as rest(s). */
  startBeat?: number;
  height?: number;
}

const VF_DUR: Record<string, string> = {
  whole: "w", half: "h", quarter: "q", eighth: "8", sixteenth: "16",
};

export function LickScoreViewer({ notes, startBeat = 0, height = 160 }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const vfRef = useRef<HTMLDivElement>(null);
  const renderWidth = useContainerWidth(wrapperRef);

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
        renderer.resize(renderWidth, height);
        const ctx = renderer.getContext();

        // ── Pickup rests ────────────────────────────────────────────
        const restNotes = makeRests(startBeat, StaveNote);

        // ── Main note staves ────────────────────────────────────────
        const mainNotes = notes.map((ln) => {
          const pitch = ln.note.replace(/[#b]/, "").toLowerCase();
          const key = `${pitch}/${ln.octave}`;
          const dur = VF_DUR[ln.duration] ?? "8";
          const sn = new StaveNote({ keys: [key], duration: dur });
          if (ln.note.includes("#")) sn.addModifier(new Accidental("#"), 0);
          else if (ln.note.length > 1 && ln.note.endsWith("b")) sn.addModifier(new Accidental("b"), 0);
          return sn;
        });

        const allNotes = [...restNotes, ...mainNotes];

        const stave = new Stave(10, 20, renderWidth - 20);
        stave.addClef("treble").addTimeSignature("4/4");
        stave.setContext(ctx).draw();

        const voice = new Voice({ num_beats: 4, beat_value: 4 });
        voice.setMode(Voice.Mode.SOFT);
        voice.addTickables(allNotes);

        // ── Beams (eighth/sixteenth, non-triplet) ───────────────────
        const beamCandidates = mainNotes.filter((_, i) => {
          const d = notes[i].duration;
          return (d === "eighth" || d === "sixteenth") && !notes[i].triplet;
        });
        const beams = beamCandidates.length > 0 ? Beam.generateBeams(beamCandidates) : [];

        // ── Tuplets (groups of 3 consecutive triplet notes) ─────────
        const tuplets = buildTuplets(notes, mainNotes, Tuplet);

        new Formatter().joinVoices([voice]).format([voice], renderWidth - 60);
        voice.draw(ctx, stave);
        beams.forEach((b: any) => b.setContext(ctx).draw());
        tuplets.forEach((t: any) => t.setContext(ctx).draw());
      } catch {
        if (vfRef.current) {
          vfRef.current.innerHTML = `<p style="color:#666;padding:8px;font-size:12px">楽譜描画エラー</p>`;
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [notes, startBeat, renderWidth, height]);

  return (
    <div ref={wrapperRef} className="w-full rounded-xl overflow-hidden bg-white" style={{ minHeight: height }}>
      <div ref={vfRef} />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert startBeat offset into VexFlow rest StaveNotes */
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

/** Collect consecutive triplet notes and wrap them in Tuplet objects */
function buildTuplets(lickNotes: LickNote[], staveNotes: any[], Tuplet: any): any[] {
  const tuplets: any[] = [];
  let i = 0;
  while (i < lickNotes.length) {
    if (lickNotes[i].triplet) {
      // Collect run of triplet notes (groups of 3)
      const start = i;
      while (i < lickNotes.length && lickNotes[i].triplet) i++;
      const group = staveNotes.slice(start, i);
      // Create Tuplet for every 3 consecutive notes
      for (let g = 0; g + 3 <= group.length; g += 3) {
        try {
          tuplets.push(new Tuplet(group.slice(g, g + 3), { num_notes: 3, notes_occupied: 2 }));
        } catch { /* skip if Tuplet API differs */ }
      }
    } else {
      i++;
    }
  }
  return tuplets;
}
