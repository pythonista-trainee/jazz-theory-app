"use client";

import { useEffect, useRef } from "react";

interface Props {
  abc: string;
  width?: number;
  height?: number;
}

/**
 * Renders a musical score from an ABC-notation string using VexFlow.
 * VexFlow is loaded dynamically to avoid SSR issues.
 */
export function ScoreViewer({ abc, width = 600, height = 150 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    async function render() {
      const VF = await import("vexflow").then((m) => m.default ?? m);
      if (cancelled || !containerRef.current) return;

      // Clear previous render
      containerRef.current.innerHTML = "";

      try {
        const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } = VF;

        const renderer = new Renderer(
          containerRef.current,
          Renderer.Backends.SVG
        );
        renderer.resize(width, height);
        const ctx = renderer.getContext();
        ctx.setFont("Arial", 10, "").setBackgroundFillStyle("#0f0f1a");

        // Parse ABC into VexFlow stave notes (simplified parser)
        const notes = parseABCToVexNotes(abc, VF);
        if (!notes.length) return;

        const stave = new Stave(10, 20, width - 20);
        stave.addClef("treble").addTimeSignature("4/4");
        stave.setContext(ctx).draw();

        const voice = new Voice({ num_beats: 4, beat_value: 4 });
        voice.setMode(Voice.Mode.SOFT);
        voice.addTickables(notes);

        new Formatter().joinVoices([voice]).format([voice], width - 60);
        voice.draw(ctx, stave);
      } catch (err) {
        // Render fallback text if VexFlow fails
        if (containerRef.current) {
          containerRef.current.innerHTML = `<p style="color:#6b7280;font-size:12px;padding:8px">楽譜プレビュー (ABC): ${abc.slice(0, 80)}...</p>`;
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [abc, width, height]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden bg-jazz-surface border border-white/10"
      style={{ minHeight: height }}
    />
  );
}

// ── Minimal ABC→VexFlow parser ────────────────────────────────────────────────

function parseABCToVexNotes(abc: string, VF: any): any[] {
  // Extract the note line (after K: header)
  const bodyMatch = abc.match(/\|([^|]+)\|/);
  if (!bodyMatch) return [];

  const { StaveNote, Accidental } = VF;
  const tokens = bodyMatch[1].trim().split(/\s+/);
  const notes: any[] = [];

  for (const token of tokens) {
    try {
      const parsed = parseABCToken(token);
      if (!parsed) continue;

      const { pitch, octave, duration } = parsed;
      const staveNote = new StaveNote({
        keys: [`${pitch.toLowerCase()}/${octave}`],
        duration,
      });

      if (pitch.includes("#")) {
        staveNote.addModifier(new Accidental("#"), 0);
      } else if (pitch.includes("b") && pitch.length > 1) {
        staveNote.addModifier(new Accidental("b"), 0);
      }

      notes.push(staveNote);
    } catch {
      /* skip unparseable tokens */
    }
  }

  return notes;
}

function parseABCToken(
  token: string
): { pitch: string; octave: number; duration: string } | null {
  // Matches: optional accidental (^/_), letter, optional octave mark (,/')
  const match = token.match(/^(\^|_)?([A-Ga-g])(,+|'+)?(\d+|\/\d+)?$/);
  if (!match) return null;

  const [, acc, letter, octMark] = match;
  const isUpper = letter === letter.toUpperCase();
  const basePitch =
    (acc === "^" ? `${letter.toUpperCase()}#` :
     acc === "_" ? `${letter.toUpperCase()}b` :
     letter.toUpperCase());
  const baseOctave = isUpper ? 4 : 5;
  const octave =
    octMark === ","  ? baseOctave - 1 :
    octMark === ",," ? baseOctave - 2 :
    octMark === "'"  ? baseOctave + 1 :
    octMark === "''" ? baseOctave + 2 :
    baseOctave;

  return { pitch: basePitch, octave, duration: "8" };
}
