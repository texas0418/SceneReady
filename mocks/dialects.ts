export interface Dialect {
  id: string;
  name: string;
  region: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  keyFeatures: string[];
  ipaExamples: { word: string; ipa: string; note: string }[];
  tips: string[];
  famousExamples: string[];
}

export const dialects: Dialect[] = [
  {
    id: '1',
    name: 'British RP',
    region: 'England (Southern)',
    difficulty: 'Intermediate',
    keyFeatures: [
      'Non-rhotic (drop the "r" after vowels)',
      'Long "a" in words like "bath" (/bɑːθ/)',
      'T-sounds are crisp, never flapped',
      'Rounded vowels',
    ],
    ipaExamples: [
      { word: 'bath', ipa: '/bɑːθ/', note: 'Long "ah" sound, not flat "a"' },
      { word: 'water', ipa: '/ˈwɔːtə/', note: 'No "r" at end, soft "t"' },
      { word: 'really', ipa: '/ˈɹɪəli/', note: 'Slight diphthong on the "ea"' },
      { word: 'can\'t', ipa: '/kɑːnt/', note: 'Long "ah", not "æ"' },
    ],
    tips: [
      'Practice dropping terminal R sounds',
      'Keep your mouth more rounded than American English',
      'Listen to BBC newsreaders for standard RP',
      'The key is precision — every consonant is articulated',
    ],
    famousExamples: ['Judi Dench', 'Benedict Cumberbatch', 'Helen Mirren'],
  },
  {
    id: '2',
    name: 'Southern American',
    region: 'Southern United States',
    difficulty: 'Beginner',
    keyFeatures: [
      'Monophthongization of /aɪ/ ("I" becomes "Ah")',
      'Pen/pin merger',
      'Drawled vowels (elongated)',
      'Y\'all as second person plural',
    ],
    ipaExamples: [
      { word: 'ride', ipa: '/ɹɑːd/', note: '"Eye" sound becomes "ah"' },
      { word: 'pen', ipa: '/pɪn/', note: 'Sounds like "pin"' },
      { word: 'night', ipa: '/nɑːt/', note: 'Drawn out "ah" sound' },
      { word: 'fire', ipa: '/fɑːɹ/', note: 'One syllable, rhymes with "far"' },
    ],
    tips: [
      'Slow down your speech — Southern is unhurried',
      'Soften your consonants, especially final ones',
      'Practice the "pin/pen" merger',
      'Watch Matthew McConaughey and Reese Witherspoon interviews',
    ],
    famousExamples: ['Matthew McConaughey', 'Reese Witherspoon', 'Holly Hunter'],
  },
  {
    id: '3',
    name: 'New York',
    region: 'New York City',
    difficulty: 'Intermediate',
    keyFeatures: [
      'Non-rhotic (dropping "r" in certain positions)',
      'Raised "aw" sound in coffee, dog, talk',
      'TH-stopping ("the" → "da")',
      'Short "a" tensing in words like "bad"',
    ],
    ipaExamples: [
      { word: 'coffee', ipa: '/ˈkwɔːfi/', note: 'Rounded, raised "aw" sound' },
      { word: 'park', ipa: '/pɑːk/', note: 'R is dropped' },
      { word: 'water', ipa: '/ˈwɔːtəɹ/', note: 'Glottal stop on the "t"' },
      { word: 'the', ipa: '/dʌ/', note: 'TH becomes D' },
    ],
    tips: [
      'The key is attitude — New York accent is confident and fast',
      'Practice the "aw" sound: "tawk", "cawfee", "dawg"',
      'Drop R after vowels but not before',
      'Study Marisa Tomei in My Cousin Vinny',
    ],
    famousExamples: ['Robert De Niro', 'Marisa Tomei', 'Al Pacino'],
  },
  {
    id: '4',
    name: 'Irish',
    region: 'Ireland',
    difficulty: 'Intermediate',
    keyFeatures: [
      'Dental T and D (tongue touches teeth)',
      'Rhotic (R is always pronounced)',
      'TH becomes T or D',
      'Lilting intonation pattern',
    ],
    ipaExamples: [
      { word: 'think', ipa: '/tɪŋk/', note: 'TH becomes T' },
      { word: 'thirty', ipa: '/ˈtɜːɹti/', note: 'Dental T, rhotic R' },
      { word: 'film', ipa: '/fɪləm/', note: 'Extra syllable added' },
      { word: 'three', ipa: '/tɹiː/', note: 'TH becomes T' },
    ],
    tips: [
      'Focus on the musicality — Irish has a sing-song quality',
      'Keep your R sounds strong and present',
      'Practice dental stops for TH sounds',
      'Listen to Saoirse Ronan and Colin Farrell interviews',
    ],
    famousExamples: ['Saoirse Ronan', 'Colin Farrell', 'Cillian Murphy'],
  },
  {
    id: '5',
    name: 'Australian',
    region: 'Australia',
    difficulty: 'Beginner',
    keyFeatures: [
      'Rising intonation at end of statements',
      'Non-rhotic accent',
      '"Day" vowel shifts: "mate" → "mite"',
      'Flattened I sound',
    ],
    ipaExamples: [
      { word: 'mate', ipa: '/mʌɪt/', note: 'A sound shifts toward "eye"' },
      { word: 'day', ipa: '/dʌɪ/', note: 'Shifted diphthong' },
      { word: 'no', ipa: '/nəʊ/', note: 'More centralized than American' },
      { word: 'dance', ipa: '/dɑːns/', note: 'Long "ah" like British' },
    ],
    tips: [
      'Practice the vowel shift: "ay" becomes closer to "eye"',
      'Add rising intonation — statements can sound like questions',
      'Shorten words and add "-ie" or "-o" endings',
      'Watch Margot Robbie and Hugh Jackman interviews',
    ],
    famousExamples: ['Cate Blanchett', 'Margot Robbie', 'Hugh Jackman'],
  },
  {
    id: '6',
    name: 'Cockney',
    region: 'East London',
    difficulty: 'Advanced',
    keyFeatures: [
      'Glottal stops replace T sounds',
      'TH-fronting ("think" → "fink")',
      'H-dropping at start of words',
      'Diphthong shifts throughout',
    ],
    ipaExamples: [
      { word: 'butter', ipa: '/ˈbʌʔə/', note: 'Glottal stop replaces T' },
      { word: 'think', ipa: '/fɪŋk/', note: 'TH becomes F' },
      { word: 'house', ipa: '/ˈæːs/', note: 'H dropped, vowel shifted' },
      { word: 'face', ipa: '/fʌɪs/', note: 'Diphthong shift' },
    ],
    tips: [
      'Master the glottal stop — it replaces T between vowels',
      'Practice H-dropping: "he" becomes "e"',
      'TH → F at start, TH → V in middle of words',
      'Watch Guy Ritchie films for reference',
    ],
    famousExamples: ['Michael Caine', 'Jason Statham', 'Adele'],
  },
];
