"use client";

import { useEffect, useRef } from "react";
import type { LickNote } from "@/types/music";

interface Props {
  notes: LickNote[];
  width?: number;
  height?: number;
}

// Duration型 → VexFlow duration文字列
const VF_DUR: Record<string, string> = {
  whole: "w",
  half: "h",
  quarter: "q",
  eighth: "8",
  sixteenth: "16",
};

export function LickScoreViewer({ notes, width = 560, height = 160 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || notes.length === 0) return;
    let cancelled = false;

    async function render() {
      const VF = await import("vexflow").then((m) => m.default ?? m);
      if (cancelled || !containerRef.current) return;

      containerRef.current.innerHTML = "";

      try {
        const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Beam } = VF;

        const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
        renderer.resize(width, height);
        const ctx = renderer.getContext();

        const staveNotes = notes.map((ln) => {
          const pitch = ln.note.replace(/[#b]/, "").toLowerCase();
          const key = `${pitch}/${ln.octave}`;
          const dur = VF_DUR[ln.duration] ?? "8";
          const sn = new StaveNote({ keys: [key], duration: dur });

          if (ln.note.includes("#")) {
            sn.addModifier(new Accidental("#"), 0);
          } else if (ln.note.length > 1 && ln.note.endsWith("b")) {
            sn.addModifier(new Accidental("b"), 0);
          }
          return sn;
        });

        const stave = new Stave(10, 20, width - 20);
        stave.addClef("treble").addTimeSignature("4/4");
        stave.setContext(ctx).draw();

        const voice = new Voice({ num_beats: 4, beat_value: 4 });
        voice.setMode(Voice.Mode.SOFT);
        voice.addTickables(staveNotes);

        // 連符記号（ビーム）を自動生成
        const beams = Beam.generateBeams(staveNotes);

        new Formatter().joinVoices([voice]).format([voice], width - 60);
        voice.draw(ctx, stave);
        beams.forEach((b: any) => b.setContext(ctx).draw());
      } catch {
        if (containerRef.current) {
          containerRef.current.innerHTML =
            `<p style="color:#666;padding:8px;font-size:12px">楽譜描画エラー</p>`;
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [notes, width, height]);

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden bg-white"
      style={{ minHeight: height, width: "100%", maxWidth: width }}
    />
  );
}
