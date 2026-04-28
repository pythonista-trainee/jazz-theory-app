"use client";

import { useEffect, useRef } from "react";
import { assignOctaves } from "@/lib/theory/noteFormat";

interface Props {
  /** Note names without octave, e.g. ["D","F","A","C"] */
  notes: string[];
  /** "chord" = stacked, "scale" = sequential */
  mode?: "chord" | "scale";
  width?: number;
  height?: number;
}

export function ChordScoreViewer({
  notes,
  mode = "chord",
  width = 320,
  height = 140,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || notes.length === 0) return;
    let cancelled = false;

    async function render() {
      const VF = await import("vexflow").then((m) => m.default ?? m);
      if (cancelled || !containerRef.current) return;

      containerRef.current.innerHTML = "";

      try {
        const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } = VF;

        const renderer = new Renderer(
          containerRef.current,
          Renderer.Backends.SVG
        );
        renderer.resize(width, height);
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

        const stave = new Stave(10, 20, width - 20);
        stave.addClef("treble");
        stave.setContext(ctx).draw();

        const voice = new Voice({
          num_beats: mode === "chord" ? 4 : staveNotes.length,
          beat_value: 4,
        });
        voice.setMode(Voice.Mode.SOFT);
        voice.addTickables(staveNotes);

        new Formatter().joinVoices([voice]).format([voice], width - 60);
        voice.draw(ctx, stave);
      } catch (e) {
        if (containerRef.current) {
          containerRef.current.innerHTML = `<p style="color:#6b7280;padding:8px;font-size:12px">${notes.join(" ")}</p>`;
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [notes, mode, width, height]);

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden bg-white"
      style={{ minHeight: height, width }}
    />
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** "F#4" → "f#/4",  "Bb4" → "bb/4" */
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
