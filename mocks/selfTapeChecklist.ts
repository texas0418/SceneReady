export interface ChecklistItem {
  id: string;
  category: string;
  items: { label: string; tip: string }[];
}

export const selfTapeChecklist: ChecklistItem[] = [
  {
    id: '1',
    category: 'Before You Record',
    items: [
      { label: 'Review sides thoroughly', tip: 'Know your lines cold before hitting record. If you\'re still memorizing, you\'re not acting.' },
      { label: 'Make strong character choices', tip: 'Don\'t play it safe. Casting wants to see YOUR interpretation, not a generic read.' },
      { label: 'Research the project', tip: 'Know the tone, genre, and style. A Marvel audition is different from an A24 film.' },
      { label: 'Prepare your slate', tip: 'Name, agency (if repped), role, and a brief, confident delivery. No need to be cute.' },
    ],
  },
  {
    id: '2',
    category: 'Technical Setup',
    items: [
      { label: 'Camera at eye level', tip: 'Place your camera/phone at eye level. Avoid looking down or up at the lens.' },
      { label: 'Frame: medium close-up', tip: 'Standard framing is from the chest up. Casting needs to see your face and subtle expressions.' },
      { label: 'Clean, neutral background', tip: 'A solid-colored wall or simple backdrop. No distracting posters, mirrors, or clutter.' },
      { label: 'Stable camera/tripod', tip: 'No handheld shakiness. Use a tripod, stack of books, or phone mount.' },
    ],
  },
  {
    id: '3',
    category: 'Lighting',
    items: [
      { label: 'Key light positioned correctly', tip: 'Main light should be in front of you, slightly to one side and above eye level for dimension.' },
      { label: 'No harsh shadows on face', tip: 'Use diffused light (softbox, ring light, or window with a sheer curtain). Avoid overhead-only lighting.' },
      { label: 'Fill light to reduce contrast', tip: 'A second softer light or a white poster board to bounce light and fill shadows on the opposite side.' },
      { label: 'Check for mixed color temperatures', tip: 'Don\'t mix warm lamps with cool daylight. Stick to one color temperature for a clean look.' },
    ],
  },
  {
    id: '4',
    category: 'Audio',
    items: [
      { label: 'Use an external microphone if possible', tip: 'Even a $20 lav mic dramatically improves audio over your phone\'s built-in mic.' },
      { label: 'Eliminate background noise', tip: 'Turn off AC, fans, and appliances. Close windows. Record a test and listen for any ambient noise.' },
      { label: 'Consistent audio levels', tip: 'Don\'t whisper then shout. If the scene has dynamic range, position the mic to handle both.' },
      { label: 'Do a sound check first', tip: 'Record 10 seconds, play it back, and adjust before doing your actual takes.' },
    ],
  },
  {
    id: '5',
    category: 'Performance',
    items: [
      { label: 'Eye-line just off camera', tip: 'Look just past the lens, not directly into it (unless directed otherwise). Your reader should sit right next to the camera.' },
      { label: 'Keep it intimate', tip: 'Film acting is about subtlety. What feels small to you reads perfectly on camera.' },
      { label: 'Multiple takes with different choices', tip: 'Don\'t just do the same thing three times. Give casting options to champion you.' },
      { label: 'Watch playback before sending', tip: 'Review your best takes. Check framing, audio, and performance. Sleep on it if the deadline allows.' },
    ],
  },
];

export const framingGuides = [
  {
    id: 'close-up',
    name: 'Close-Up (CU)',
    description: 'From the shoulders up. Used for emotional, intimate scenes.',
    when: 'Dramatic scenes, emotional beats, casting requests "close-up"',
    tips: 'Keep movements subtle. Eyes do the heavy lifting.',
  },
  {
    id: 'medium-close',
    name: 'Medium Close-Up (MCU)',
    description: 'From the chest up. The standard self-tape framing.',
    when: 'Default for most auditions unless specified otherwise.',
    tips: 'Most versatile. Allows some gesture without losing facial detail.',
  },
  {
    id: 'medium',
    name: 'Medium Shot (MS)',
    description: 'From the waist up. Good for physical scenes.',
    when: 'Comedy, physical scenes, or when blocking matters.',
    tips: 'Make sure your gestures are purposeful, not just nervous energy.',
  },
  {
    id: 'wide',
    name: 'Wide Shot (WS)',
    description: 'Full body visible. Rarely requested for self-tapes.',
    when: 'Dance auditions, stunt work, or specific casting requests.',
    tips: 'You\'ll need more space. Make sure the whole body is in frame.',
  },
];
