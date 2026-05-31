import { customAlphabet } from 'nanoid';

// Excludes visually ambiguous characters (0, O, 1, I, l) so IDs remain
// human-readable if ever spoken aloud or typed manually from a card.
const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz';

// 32^8 ≈ 1.1 trillion combinations — collision probability stays negligible
// even at tens of millions of plaques. Increase LENGTH to 10 if needed at scale.
const LENGTH = 8;

const nanoid = customAlphabet(ALPHABET, LENGTH);

export function generateShortId(): string {
  return nanoid();
}
