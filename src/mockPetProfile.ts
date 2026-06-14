import { PetProfileData } from './petProfileTemplate';

export const MOCK_PET_PROFILE: PetProfileData = {
  name:      'Biscuit',
  species:   'Dog',
  breed:     'Golden Retriever',
  birthDate: 'March 12, 2010',
  deathDate: 'January 4, 2026',
  epitaph:   'He greeted every single day — and every single person — like a gift.',
  portraitUrl: 'https://placehold.co/400x400/c4a882/6b5a3e?text=🐾',
  timeline: [
    {
      year: 2010,
      title: 'Welcomed Home',
      description: 'Brought home at eight weeks old, a tiny bundle of gold fur who immediately claimed the sunniest corner of the living room.',
    },
    {
      year: 2012,
      title: 'Certified Therapy Dog',
      description: 'Passed his Canine Good Citizen test and began weekly visits to the local children\'s hospital, where he became a favourite of every ward.',
    },
    {
      year: 2015,
      title: 'The Great Beach Summer',
      description: 'Three weeks on the Oregon coast. He discovered waves, chased exactly zero of them successfully, and came home every night completely sandy and completely happy.',
    },
    {
      year: 2018,
      title: 'New Baby, New Best Friend',
      description: 'The day we brought Lily home from the hospital, Biscuit sat by her crib for six hours straight without being asked.',
    },
    {
      year: 2022,
      title: 'Hiking the Cascades',
      description: 'At twelve years old, completed a five-day trail with the family. Led the way every single morning.',
    },
  ],
  gallery: [
    { url: 'https://placehold.co/600x600/d4b896/7a6040?text=Puppy+2010',   caption: 'First day home, 2010' },
    { url: 'https://placehold.co/600x600/c8a87a/6b5030?text=Therapy+2012', caption: 'Therapy dog visits, 2012' },
    { url: 'https://placehold.co/600x600/dcc09a/857050?text=Beach+2015',   caption: 'Oregon coast, 2015' },
    { url: 'https://placehold.co/600x600/d0b080/705830?text=With+Lily',    caption: 'Meeting Lily, 2018' },
    { url: 'https://placehold.co/600x600/c4a878/5a4828?text=Hiking+2022',  caption: 'Cascade trail, 2022' },
    { url: 'https://placehold.co/600x600/ccb088/604830?text=Last+Winter',  caption: 'Last Christmas, 2025' },
  ],
  memories: [
    {
      message: 'He used to rest his chin on my knee every time I was having a hard day. He always knew before I did.',
      author:  'Sarah M.',
      date:    'January 5, 2026',
    },
    {
      message: 'Biscuit was the reason my kids learned what unconditional love looks like. We are so lucky he chose us.',
      author:  'The Mercer Family',
      date:    'January 6, 2026',
    },
    {
      message: 'He was the best therapy dog I have ever met. The kids at the hospital still ask about him.',
      author:  'Nurse Dana R.',
      date:    'January 7, 2026',
    },
    {
      message: 'Fifteen years of hiking together. He was always first to the summit and last to leave anyone behind.',
      author:  'Tom K.',
      date:    'January 8, 2026',
    },
  ],
};
