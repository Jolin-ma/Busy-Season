export interface TimelineMilestone {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface GalleryFile {
  id: string;
  file: File;
  preview: string;
}

export interface ProfileDraft {
  name: string;
  epitaph: string;
  dateOfBirth: string;
  dateOfDeath: string;
  portraitFile: File | null;
  portraitPreview: string | null;
  timeline: TimelineMilestone[];
  gallery: GalleryFile[];
  isPrivate: boolean;
  privacyPin: string;
}

export type PlaqueStatus = 'order_received' | 'engraving' | 'shipped' | 'delivered';

export interface Memorial {
  id: string;
  shortId: string;
  name: string;
  dateOfBirth: string;
  dateOfDeath: string;
  portraitUrl: string;
  plaqueStatus: PlaqueStatus;
  trackingNumber?: string;
  scansCount: number;
}

export const EMPTY_DRAFT: ProfileDraft = {
  name: '',
  epitaph: '',
  dateOfBirth: '',
  dateOfDeath: '',
  portraitFile: null,
  portraitPreview: null,
  timeline: [],
  gallery: [],
  isPrivate: false,
  privacyPin: '',
};
