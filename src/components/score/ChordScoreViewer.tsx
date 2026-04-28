"use client";

import { useEffect, useRef } from "react";
import { assignOctaves } from "@/lib/theory/noteFormat";
import { useContainerWidth } from "@/hooks/useContainerWidth";

interface Props {
  notes: string[];
  mode?: "chord" | "scale";
  /** Optional max-width cap (pixels). Component fills container up to this value. */
  width?: number;
  height?: number;
}

export function ChordScoreViewer({
  notes,
  mode = "chord",
  width: maxWidth,
  height = 140,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const vfRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(wrapperRef);

  // Clamp to maxWidth if provided
  const renderWidth = maxWidth ? Math.min(containerWidth, maxWidth) : containerWidth;

  useEffect(() => {
    if (!vfRef.current || renderWidth < 50 || notes.length === 0) return;
    let cancelled = false;

    async function render() {
      const VF = await import("vexflow").then((m) => m.default ?? m);
      if (cancelled || !vfRef.current) return;

      vfRef.current.innerHTML = "";

      try {
        const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } = VF;

        const renderer = new Renderer(vfRef.current, Renderer.Backends.SVG);
        renderer.resize(renderWidth, height);
        const ctx = renderer.getContext();

        const scientific = assignOctaves(notes);
        const vfKeys = scientific.map(toVFKey);

        let staveNotes: any[];
        if (mode === "chord") {
          const sn = new StaveNote({ keys: vfKeys, duration: "w" });
          addAccidentals(sn, notes, Accidental);
          staveNotes = [sn];
        } else {
          staveNotes = vfKeys.map((key, i) => {
            const sn = new StaveNote({ keys: [key], duration: "q" });
            addAccidentals(sn, [notes[i]], Accidental);
            return sn;
          });
        }

        const stave = new Stave(10, 20, renderWidth - 20);
        stave.addClef("treble");
        stave.setContext(ctx).draw();

        const voice = new Voice({
          num_beats: mode === "chord" ? 4 : staveNotes.length,
          beat_value: 4,
        });
        voice.setMode(Voice.Mode.SOFT);
        voice.addTickables(staveNotes);

        new Formatter().joinVoices([voice]).format([voice], renderWidth - 60);
        voice.draw(ctx, stave);
      } catch {
        if (vfRef.current) {
          vfRef.current.innerHTML = `<p style="color:#666;padding:8px;font-size:12px">${notes.join(" ")}</p>`;
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [notes, mode, renderWidth, height]);

  return (
    <div ref={wrapperRef} className="w-full rounded-xl overflow-hidden bg-white" style={{ minHeight: height }}>
      <div ref={vfRef} />
    </div>
  );
}

function toVFKey(scientific: string): string {
  const match = scientific.match(/^([A-G][#b]?)(\d)$/);
  if (!match) return "c/4";
  return `${match[1].toLowerCase()}/${match[2]}`;
}

function addAccidentals(staveNote: any, noteNames: string[], Accidental: any) {
  noteNames.forEach((n, i) => {
    if (n.includes("#")) staveNote.addModifier(new Accidental("#"), i);
    else if (n.endsWith("b") && n.length > 1) staveNote.addModifier(new Accidental("b"), i);
  });
}
