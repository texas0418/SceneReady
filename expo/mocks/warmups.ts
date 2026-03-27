export interface WarmUp {
  id: string;
  title: string;
  category: 'voice' | 'body' | 'emotional' | 'focus';
  duration: string;
  steps: { instruction: string; duration: string }[];
  description: string;
}

export const warmups: WarmUp[] = [
  {
    id: '1',
    title: 'Vocal Resonance',
    category: 'voice',
    duration: '5 min',
    description: 'Open up your vocal resonators and find your full voice.',
    steps: [
      { instruction: 'Stand with feet shoulder-width apart. Take 5 deep diaphragmatic breaths — in through the nose for 4 counts, out through the mouth for 6 counts.', duration: '1 min' },
      { instruction: 'Hum gently, starting low and gradually rising. Feel the vibration move from your chest to your head. Repeat 5 times.', duration: '1 min' },
      { instruction: 'Open from the hum to "MMMM-AAHHH" — let the sound fill the room. Vary the pitch each time.', duration: '1 min' },
      { instruction: 'Practice lip trills (motorboat lips) while sliding up and down your range. Keep the breath steady.', duration: '1 min' },
      { instruction: 'Speak a few lines of text using your full, resonant voice. Notice the difference from your everyday speaking voice.', duration: '1 min' },
    ],
  },
  {
    id: '2',
    title: 'Tongue Twisters',
    category: 'voice',
    duration: '5 min',
    description: 'Sharpen your articulation and diction for clear delivery.',
    steps: [
      { instruction: 'Slowly: "Red leather, yellow leather" — focus on clear L and R sounds. Repeat 5 times, getting slightly faster each time.', duration: '1 min' },
      { instruction: '"Unique New York, unique New York, you know you need unique New York." Start slow, build speed. 5 repetitions.', duration: '1 min' },
      { instruction: '"She sells seashells by the seashore." Focus on the SH vs S distinction. Over-articulate first, then naturalize.', duration: '1 min' },
      { instruction: '"Whether the weather is cold, or whether the weather is hot, we\'ll weather the weather whatever the weather, whether we like it or not." Work the TH sounds.', duration: '1 min' },
      { instruction: 'Pick any piece of text and read it aloud with exaggerated mouth movements, then again naturally. Notice the improved clarity.', duration: '1 min' },
    ],
  },
  {
    id: '3',
    title: 'Physical Release',
    category: 'body',
    duration: '7 min',
    description: 'Release tension from your body to free your instrument.',
    steps: [
      { instruction: 'Shake out your entire body — start with your hands, then arms, shoulders, torso, legs, feet. Shake everything for one full minute.', duration: '1 min' },
      { instruction: 'Ragdoll: Slowly roll down your spine, vertebra by vertebra, until you\'re hanging from the waist. Let your head and arms dangle. Breathe. Slowly roll back up.', duration: '2 min' },
      { instruction: 'Neck rolls: Gently drop your chin to your chest, then slowly roll your head to the right, back, left, and around. 3 times each direction.', duration: '1 min' },
      { instruction: 'Shoulder isolation: Lift both shoulders to your ears, hold for 5 seconds, then DROP them. Repeat 5 times. Feel the release.', duration: '1 min' },
      { instruction: 'Cat-cow stretches: On all fours, arch your back up (cat), then dip it down (cow). Sync with your breath. 8 repetitions.', duration: '1 min' },
      { instruction: 'Stand tall. Scan your body for remaining tension. Breathe into those areas and consciously release.', duration: '1 min' },
    ],
  },
  {
    id: '4',
    title: 'Emotional Prep',
    category: 'emotional',
    duration: '8 min',
    description: 'Access your emotional range and prepare for emotionally demanding scenes.',
    steps: [
      { instruction: 'Close your eyes. Take 10 slow breaths. With each exhale, release one worry or thought from your day. Name it silently, then let it go.', duration: '2 min' },
      { instruction: 'Recall a moment of pure joy. Don\'t just remember it — relive it. What did you see? Smell? Feel on your skin? Let the emotion wash over you.', duration: '2 min' },
      { instruction: 'Now shift to a moment of sadness or loss. Again, fully immerse yourself. Don\'t push the emotion — invite it. Let it exist without judgment.', duration: '2 min' },
      { instruction: 'Return to neutral. Breathe deeply. Notice how quickly your instrument can shift between emotional states. This flexibility is your superpower.', duration: '1 min' },
      { instruction: 'Open your eyes. Speak a neutral phrase ("It\'s a beautiful day") with three different emotions: joy, anger, heartbreak. Notice how your body, voice, and energy shift.', duration: '1 min' },
    ],
  },
  {
    id: '5',
    title: 'Sensory Awareness',
    category: 'focus',
    duration: '5 min',
    description: 'Heighten your sensory awareness for more grounded, present performances.',
    steps: [
      { instruction: 'Sit comfortably. Close your eyes. Name 5 sounds you can hear right now. Don\'t judge them — just notice.', duration: '1 min' },
      { instruction: 'Open your eyes. Pick an object in the room. Describe it in extreme detail as if explaining it to someone who has never seen anything like it.', duration: '1 min' },
      { instruction: 'Close your eyes again. Focus on physical sensation: the temperature of the air, the texture of your clothing, the pressure of the floor beneath you.', duration: '1 min' },
      { instruction: 'Imagine you\'re in a specific location (a beach, a forest, a crowded subway). Build the environment using all five senses. Make it vivid.', duration: '1 min' },
      { instruction: 'Open your eyes. This heightened awareness is what "being present" means on stage and on camera. Carry it into your work.', duration: '1 min' },
    ],
  },
  {
    id: '6',
    title: 'Breath Control',
    category: 'voice',
    duration: '5 min',
    description: 'Build breath support for sustained vocal power and control.',
    steps: [
      { instruction: 'Inhale for 4 counts, hold for 4 counts, exhale for 4 counts, hold for 4 counts. Repeat this box breathing pattern 4 times.', duration: '1.5 min' },
      { instruction: 'Inhale fully, then sustain a single "SSSSS" sound for as long as possible. Try to beat your time with each attempt. Do 3 rounds.', duration: '1.5 min' },
      { instruction: 'Panting exercise: Quick, sharp breaths from the diaphragm (like a dog panting). 15 seconds on, 15 seconds rest. 3 rounds.', duration: '1 min' },
      { instruction: 'Take a full breath and count aloud as high as you can on a single exhale. Project your voice — no whispering at the end. Try 3 times.', duration: '1 min' },
    ],
  },
];
