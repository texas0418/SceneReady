export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: 'On Set' | 'Audition' | 'Union' | 'Technical' | 'Business';
}

export const glossaryTerms: GlossaryTerm[] = [
  { id: '1', term: 'Sides', definition: 'Pages from a script given to actors to prepare for an audition. Usually just the scenes relevant to the character being cast.', category: 'Audition' },
  { id: '2', term: 'Slate', definition: 'A brief on-camera introduction at the beginning of a self-tape or audition where you state your name, agency, and sometimes height or other details.', category: 'Audition' },
  { id: '3', term: 'Callback', definition: 'A second (or third) audition after the initial read, indicating the casting team is seriously considering you for the role.', category: 'Audition' },
  { id: '4', term: 'Blocking', definition: 'The planned physical movements and positioning of actors during a scene. Determined during rehearsal by the director.', category: 'On Set' },
  { id: '5', term: 'Craft Services (Crafty)', definition: 'The department responsible for providing snacks and beverages on set between meals. Not to be confused with catering.', category: 'On Set' },
  { id: '6', term: 'Martini Shot', definition: 'The last shot of the day. Named because the next shot is supposedly "in a glass" — meaning the crew is heading to the bar.', category: 'On Set' },
  { id: '7', term: 'SAG-AFTRA', definition: 'Screen Actors Guild - American Federation of Television and Radio Artists. The primary union for actors in the United States.', category: 'Union' },
  { id: '8', term: 'Taft-Hartley', definition: 'A provision allowing a non-union performer to work on a union project for the first time without immediately joining the union.', category: 'Union' },
  { id: '9', term: 'Right to Work', definition: 'State laws that allow actors to work on union projects without being required to join the union. Varies by state.', category: 'Union' },
  { id: '10', term: 'C-Stand', definition: 'A Century Stand — a versatile piece of grip equipment used to hold flags, nets, and diffusion to control lighting on set.', category: 'Technical' },
  { id: '11', term: 'Apple Box', definition: 'Wooden boxes of various sizes used on set for leveling, sitting, or adjusting actor height. Comes in full, half, quarter, and pancake sizes.', category: 'Technical' },
  { id: '12', term: 'Key Light', definition: 'The primary and strongest light source in a scene setup. Usually positioned to one side of the camera to create dimension.', category: 'Technical' },
  { id: '13', term: 'Mark', definition: 'A specific position on set (usually marked with tape) where an actor needs to stand for proper framing and focus.', category: 'On Set' },
  { id: '14', term: 'Hot Set', definition: 'A set that is actively dressed and should not be touched or altered. Everything is positioned for continuity.', category: 'On Set' },
  { id: '15', term: 'Last Looks', definition: 'The final check by hair, makeup, and wardrobe departments before the camera rolls on a scene.', category: 'On Set' },
  { id: '16', term: 'MOS', definition: 'Shooting without recording sound. The origin is debated — possibly "Mit Out Sound" from German directors in early Hollywood.', category: 'Technical' },
  { id: '17', term: 'Day Player', definition: 'An actor hired for a single day or a few days of work, rather than for the entire production schedule.', category: 'Business' },
  { id: '18', term: 'Residuals', definition: 'Payments made to actors when a project is re-aired, streamed, or distributed beyond its initial run. A key union benefit.', category: 'Business' },
  { id: '19', term: 'Avail / First Refusal', definition: 'A request from production to hold your schedule for potential booking. Not a confirmed booking but a strong indicator of interest.', category: 'Business' },
  { id: '20', term: 'EPK', definition: 'Electronic Press Kit — a collection of promotional materials (headshots, resume, demo reel) used for publicity and casting.', category: 'Business' },
  { id: '21', term: 'Cold Read', definition: 'Performing a scene or monologue with little to no preparation time. Common in auditions to test an actor\'s instincts.', category: 'Audition' },
  { id: '22', term: 'Reader', definition: 'The person who reads the other character\'s lines opposite you during an audition. Usually a casting assistant.', category: 'Audition' },
  { id: '23', term: 'Redirection', definition: 'When the casting director asks you to perform the scene again with different choices or adjustments. This is usually a good sign.', category: 'Audition' },
  { id: '24', term: 'Honey Wagon', definition: 'A trailer on set containing restrooms and sometimes small dressing rooms for actors.', category: 'On Set' },
  { id: '25', term: 'Abby Singer', definition: 'The second-to-last shot of the day, named after production manager Abby Singer who was known for calling "one more" shot.', category: 'On Set' },
  { id: '26', term: 'Wrap', definition: 'The end of shooting for the day ("that\'s a wrap") or for the entire production ("series wrap" or "picture wrap").', category: 'On Set' },
  { id: '27', term: 'Coverage', definition: 'All the different camera angles and shots needed to edit a scene together. Includes wide shots, close-ups, over-the-shoulders, etc.', category: 'Technical' },
  { id: '28', term: 'Eye-line', definition: 'The direction an actor looks during a scene. Maintaining proper eye-line is critical for editing continuity, especially in self-tapes.', category: 'Technical' },
  { id: '29', term: 'Scale', definition: 'The minimum pay rate for union work as established by SAG-AFTRA contracts. Varies by project type and budget.', category: 'Union' },
  { id: '30', term: 'Fi-Core', definition: 'Financial Core status — a controversial option allowing union members to also accept non-union work while maintaining basic benefits.', category: 'Union' },
];
