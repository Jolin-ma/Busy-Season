import { ProfileData } from './profileTemplate';

export const MOCK_PROFILE: ProfileData = {
  name: 'Margaret Eleanor Whitfield',
  birthDate: 'October 14, 1945',
  deathDate: 'May 22, 2026',
  epitaph: 'She carried kindness like a lantern in every room she entered.',
  portraitUrl: 'https://placehold.co/400x400/d6cfc4/7a7166?text=M.W.',
  timeline: [
    {
      year: 1945,
      title: 'Born in Halifax, Nova Scotia',
      description: 'Welcomed into the world on a crisp autumn morning, the youngest of four children in the Ogilvy family.',
    },
    {
      year: 1963,
      title: 'Governor General\'s Academic Medal',
      description: 'Graduated top of her class at Citadel High School, earning the Governor General\'s Award for academic excellence.',
    },
    {
      year: 1968,
      title: 'Nursing Degree, Dalhousie University',
      description: 'Completed her Bachelor of Nursing with honours. Her thesis on community-based palliative care was published in the Canadian Nursing Journal.',
    },
    {
      year: 1972,
      title: 'Married Robert James Whitfield',
      description: 'A beautiful ceremony at St. Paul\'s Cathedral. Robert described their first dance as "the moment I understood what a home felt like."',
    },
    {
      year: 1974,
      title: 'Founded Eastside Community Health Clinic',
      description: 'Recognized a gap in accessible healthcare for Halifax\'s east-end families and established a free clinic that would serve over 40,000 patients in its first decade.',
    },
    {
      year: 1989,
      title: 'Order of Canada',
      description: 'Awarded by the Governor General for outstanding community service and contributions to public health in Atlantic Canada.',
    },
    {
      year: 2003,
      title: 'Retired After 35 Years of Nursing',
      description: 'Her farewell was attended by over 300 patients, colleagues, and community members — a testament to the lives she had quietly transformed.',
    },
    {
      year: 2015,
      title: 'Published "Gentle Hands"',
      description: 'Her memoir recounting decades of nursing became a national bestseller and is now required reading at three Canadian nursing schools.',
    },
  ],
  gallery: [
    { url: 'https://placehold.co/600x600/e8e3db/9e9790?text=Family+1972', caption: 'Wedding day, 1972' },
    { url: 'https://placehold.co/600x600/dcd6ce/9e9790?text=Clinic+Opening', caption: 'Clinic opening, 1974' },
    { url: 'https://placehold.co/600x600/e4dfd7/9e9790?text=Order+of+Canada', caption: 'Order of Canada ceremony, 1989' },
    { url: 'https://placehold.co/600x600/dad4cc/9e9790?text=Book+Launch', caption: 'Gentle Hands book launch, 2015' },
    { url: 'https://placehold.co/600x600/e0dbd3/9e9790?text=Garden+2020', caption: 'Her garden, summer 2020' },
    { url: 'https://placehold.co/600x600/ddd8d0/9e9790?text=Family+2023', caption: 'Family gathering, 2023' },
  ],
  memories: [
    {
      message: 'She was the first person to hold my hand after my surgery. I never forgot her gentle voice telling me everything would be okay.',
      author: 'Thomas R.',
      date: 'May 23, 2026',
    },
    {
      message: 'Mom taught me that showing up — truly showing up — is the most powerful thing you can do for another person.',
      author: 'Jennifer Whitfield',
      date: 'May 22, 2026',
    },
    {
      message: 'She turned our little community clinic into a beacon of hope. Thousands of families owe their health to her stubborn, beautiful heart.',
      author: 'Dr. Patricia Osei',
      date: 'May 22, 2026',
    },
    {
      message: 'She brought homemade butter tarts to every neighborhood meeting for forty years. That says everything about her character.',
      author: 'David Chen',
      date: 'May 24, 2026',
    },
  ],
};
