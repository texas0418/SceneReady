// Plain-text formatters for the copy/share actions. Kept as pure functions so
// screen components stay under the CI line limits and stay easy to test.
import type { CharacterBreakdown } from '@/providers/CharacterBreakdownProvider';
import type { AnnotatedSide } from '@/providers/SidesAnnotationProvider';
import type { JournalEntry } from '@/providers/RehearsalJournalProvider';

function block(label: string, value: string | undefined): string | null {
  const v = (value || '').trim();
  return v ? `${label}\n${v}` : null;
}

function join(parts: (string | null)[]): string {
  return parts.filter((p): p is string => p !== null && p !== '').join('\n\n');
}

export function formatBreakdown(b: CharacterBreakdown): string {
  const title = b.projectName
    ? `${b.characterName} (${b.projectName})`
    : b.characterName || 'Character Breakdown';
  return join([
    title,
    block('OBJECTIVE', b.objective),
    block('OBSTACLES', b.obstacles),
    block('TACTICS', b.tactics),
    block('BACKSTORY', b.backstory),
    block('RELATIONSHIPS', b.relationships),
    block('SENSORY WORK', b.sensoryWork),
    block('INNER LIFE', b.innerLife),
    block('PHYSICALITY', b.physicality),
    block('VOICE', b.voiceNotes),
  ]);
}

export function formatSide(s: AnnotatedSide): string {
  const parts: (string | null)[] = [s.title || 'Untitled Side', s.scriptText || ''];
  if (s.annotations.length > 0) {
    const rows = s.annotations
      .slice()
      .sort((a, b) => a.startIndex - b.startIndex)
      .map((a) => {
        const excerpt = (s.scriptText || '').slice(a.startIndex, a.endIndex).trim();
        const note = a.text ? `: ${a.text}` : '';
        return `- [${a.type}] "${excerpt}"${note}`;
      });
    parts.push(['ANNOTATIONS', ...rows].join('\n'));
  }
  return join(parts);
}

export function formatJournalEntry(e: JournalEntry): string {
  return join([
    `${e.title || 'Journal Entry'} (${e.type})`,
    e.date ? `Date: ${e.date}` : null,
    `Mood: ${e.mood}/5`,
    block('WHAT WORKED', e.whatWorked),
    block('TO EXPLORE', e.toExplore),
    block('EMOTIONAL TRIGGERS', e.emotionalTriggers),
    block('NOTES', e.notes),
  ]);
}
