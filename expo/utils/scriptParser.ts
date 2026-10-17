// Generic script parser used by the line-memorization tool. Detects character
// cues ("NAME:" or a name on its own line) and groups the dialogue that
// follows. The AI Scene Partner keeps its own two-name fuzzy parser; this one
// is deliberately general so the actor can pick any detected character to drill.

export interface ScriptLine {
  character: string;
  line: string;
}

const CUE_LINE = /^[A-Z][A-Z0-9 .'’\-]{0,24}$/;

function extractCue(trimmed: string): { name: string; rest: string } | null {
  const colonIdx = trimmed.indexOf(':');
  if (colonIdx > 0 && colonIdx <= 30) {
    const namePart = trimmed.slice(0, colonIdx).trim();
    if (namePart.length > 0 && namePart === namePart.toUpperCase() && /[A-Z]/.test(namePart)) {
      return { name: namePart, rest: trimmed.slice(colonIdx + 1).trim() };
    }
  }
  if (CUE_LINE.test(trimmed)) {
    return { name: trimmed.replace(/:$/, '').trim(), rest: '' };
  }
  return null;
}

function isStageDirection(trimmed: string): boolean {
  return /^\(.*\)$/.test(trimmed);
}

export function parseScriptLines(scriptText: string): ScriptLine[] {
  const result: ScriptLine[] = [];
  let currentChar = '';
  let currentLine = '';

  const flush = () => {
    if (currentChar && currentLine.trim()) {
      result.push({ character: currentChar, line: currentLine.trim() });
    }
  };

  for (const raw of scriptText.split('\n')) {
    const trimmed = raw.trim();
    if (!trimmed || isStageDirection(trimmed)) continue;

    const cue = extractCue(trimmed);
    if (cue) {
      flush();
      currentChar = cue.name;
      currentLine = cue.rest;
    } else if (currentChar) {
      const cleaned = trimmed.replace(/\(.*?\)/g, '').trim();
      if (cleaned) currentLine += (currentLine ? ' ' : '') + cleaned;
    }
  }
  flush();
  return result;
}

export function extractCharacters(lines: ScriptLine[]): string[] {
  const seen: string[] = [];
  for (const l of lines) {
    if (!seen.includes(l.character)) seen.push(l.character);
  }
  return seen;
}

// Progressive memorization masking. level 0 shows the full line; level 1 keeps
// the first letter of each word; level 2 blanks every word to underscores.
export function maskLine(line: string, level: number): string {
  if (level <= 0) return line;
  return line.replace(/[A-Za-z0-9’']+/g, (word) => {
    if (level === 1) return word[0] + '_'.repeat(Math.max(0, word.length - 1));
    return '_'.repeat(word.length);
  });
}
