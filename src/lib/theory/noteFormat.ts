/**
 * Display formatting utilities for note/chord symbols.
 * Internal data stays as ASCII ("Bb", "F#") while UI shows "B♭", "F♯".
 */

/** Convert ASCII accidentals to Unicode music symbols for display. */
export function formatNote(note: string): string {
  return note
    .replace(/([A-G])b/g, "$1♭")   // Bb → B♭, Ab → A♭
    .replace(/#/g, "♯")             // F# → F♯
    .replace(/b(\d)/g, "♭$1");      // b5 → ♭5, b7 → ♭7, b9 → ♭9
}

/** Assign ascending octaves to an unordered list of note names.
 *  e.g. ["D","F","A","C"] → ["D4","F4","A4","C5"]
 */
export function assignOctaves(notes: string[], startOctave = 4): string[] {
  const CHROMATIC = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const enharmonic: Record<string,string> = {
    Db:"C#", Eb:"D#", Gb:"F#", Ab:"G#", Bb:"A#",
  };

  let octave = startOctave;
  let prevIndex = -1;
  return notes.map((n) => {
    const base = enharmonic[n] ?? n;
    const idx = CHROMATIC.indexOf(base);
    if (idx <= prevIndex) octave++;
    prevIndex = idx;
    return `${n}${octave}`;
  });
}
