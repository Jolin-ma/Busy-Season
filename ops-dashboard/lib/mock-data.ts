export type ProfileStatus  = 'PENDING_PRINT' | 'IN_PRODUCTION' | 'ACTIVE';
export type TicketStatus   = 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
export type TicketPriority = 'CRITICAL' | 'HIGH' | 'NORMAL';

export interface SupportTicket {
  id:             string;
  accountNumber:  string;
  name:           string;
  email:          string;
  plan:           'Premium';
  subject:        string;
  message:        string;
  submittedAt:    string;
  status:         TicketStatus;
  priority:       TicketPriority;
  linkedShortId?: string;
}

export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id:            'TKT-0042',
    accountNumber: 'ACC-9904',
    name:          'Sandra Liu',
    email:         'sandra.liu@gmail.com',
    plan:          'Premium',
    subject:       'Profile URL returning 404 — memorial gathering tomorrow',
    message:       "URGENT: My husband's memorial profile (short ID: f1ghijkl) has been returning a 404 error since yesterday evening. We have family visiting from overseas tomorrow for a gathering and they won't be able to access the page. Account ACC-9904. Please fix ASAP.",
    submittedAt:   '2026-05-29T14:30:00Z',
    status:        'NEW',
    priority:      'CRITICAL',
    linkedShortId: 'f1ghijkl',
  },
  {
    id:            'TKT-0041',
    accountNumber: 'ACC-8821',
    name:          'Jennifer Whitfield',
    email:         'j.whitfield@email.com',
    plan:          'Premium',
    subject:       'QR code not scanning at cemetery',
    message:       "Hi, I attached the plaque to my mother's headstone last week but visitors are having trouble scanning the QR code in direct sunlight. The bronze finish seems to reduce contrast. Is there a way to get a replacement with higher contrast engraving, or a protective cover? Account is for Margaret Eleanor Whitfield (short ID: a5trneuj). Would appreciate a quick response as we have a memorial gathering this weekend.",
    submittedAt:   '2026-05-31T09:14:00Z',
    status:        'NEW',
    priority:      'CRITICAL',
    linkedShortId: 'a5trneuj',
  },
  {
    id:            'TKT-0039',
    accountNumber: 'ACC-5530',
    name:          'Grace Patterson',
    email:         'grace.p@gmail.com',
    plan:          'Premium',
    subject:       'Billing question — charged twice in May',
    message:       "Hello, I noticed two Premium charges on my credit card statement for May 2026 — one on May 1 for $15.00 and another on May 8 for $15.00. My account number is ACC-5530. I only have one profile active (Harold James Foster, short ID b7kwmnpq). Could you review and issue a refund for the duplicate charge? I have a screenshot of the statement I can share if needed.",
    submittedAt:   '2026-05-29T11:30:00Z',
    status:        'NEW',
    priority:      'CRITICAL',
    linkedShortId: 'b7kwmnpq',
  },
  {
    id:            'TKT-0040',
    accountNumber: 'ACC-7743',
    name:          'Thomas Whitfield',
    email:         'twhitfield@outlook.com',
    plan:          'Premium',
    subject:       'Cannot upload video to memorial profile',
    message:       "I'm trying to add a video tribute to my mother's profile but keep getting an error: 'File too large'. The video is 480MB, shot on iPhone 15 Pro. I read on your site that Premium supports video up to 2GB. My account is ACC-7743. Could you check if there's a server-side limit I'm hitting? I've tried both Safari and Chrome on iOS 17.",
    submittedAt:   '2026-05-30T16:52:00Z',
    status:        'IN_PROGRESS',
    priority:      'HIGH',
  },
  {
    id:            'TKT-0038',
    accountNumber: 'ACC-3391',
    name:          'Michael Chen',
    email:         'm.chen@icloud.com',
    plan:          'Premium',
    subject:       'Request to add Cantonese language support',
    message:       "Our family would love to add a Cantonese-language section to Dorothy Mae Chen's memorial profile (ACC-3391, short ID c2xvrtyu). Many of our relatives in Hong Kong who visit the profile cannot read English. Is there a multilingual option planned, or is there a workaround we could use in the meantime? Happy to help beta-test if you're building this feature.",
    submittedAt:   '2026-05-28T08:05:00Z',
    status:        'RESOLVED',
    priority:      'NORMAL',
    linkedShortId: 'c2xvrtyu',
  },
];

export interface Profile {
  id: string;
  name: string;
  createdAt: string;
  qrCodeUrl: string;
  status: ProfileStatus;
}

export interface ScanDataPoint {
  date: string;
  scans: number;
}

export interface GeoEntry {
  city: string;
  country: string;
  scans: number;
  pct: number;
}

export interface DeviceEntry {
  name: string;
  value: number;
  color: string;
}

// ── Summary stats ─────────────────────────────────────────────────────────────
export const SUMMARY = {
  totalProfiles:   247,
  profilesTrend:   +14,
  totalScans:      8_432,
  scansTrend:      +12,
  pendingOrders:   31,
  pendingTrend:    -3,
  topLocation:     'Toronto, CA',
  topLocationScans: 763,
};

// ── Fulfillment profiles ──────────────────────────────────────────────────────
export const PROFILES: Profile[] = [
  { id: 'a5trneuj', name: 'Margaret Eleanor Whitfield', createdAt: '2026-05-10', qrCodeUrl: 'https://legacylink.co/p/a5trneuj', status: 'PENDING_PRINT' },
  { id: 'b7kwmnpq', name: 'Harold James Foster',        createdAt: '2026-05-12', qrCodeUrl: 'https://legacylink.co/p/b7kwmnpq', status: 'PENDING_PRINT' },
  { id: 'c2xvrtyu', name: 'Dorothy Mae Chen',           createdAt: '2026-05-15', qrCodeUrl: 'https://legacylink.co/p/c2xvrtyu', status: 'IN_PRODUCTION' },
  { id: 'd9lmopqr', name: 'William Thomas Burke',       createdAt: '2026-05-18', qrCodeUrl: 'https://legacylink.co/p/d9lmopqr', status: 'PENDING_PRINT' },
  { id: 'e4stuijk', name: 'Florence Anna Park',         createdAt: '2026-05-20', qrCodeUrl: 'https://legacylink.co/p/e4stuijk', status: 'ACTIVE' },
  { id: 'f1ghijkl', name: 'Robert Lee Thompson',        createdAt: '2026-05-22', qrCodeUrl: 'https://legacylink.co/p/f1ghijkl', status: 'PENDING_PRINT' },
  { id: 'g6mnopqr', name: 'Helen Mary Davis',           createdAt: '2026-05-25', qrCodeUrl: 'https://legacylink.co/p/g6mnopqr', status: 'IN_PRODUCTION' },
  { id: 'h3stuvwx', name: 'James Arthur Wilson',        createdAt: '2026-05-28', qrCodeUrl: 'https://legacylink.co/p/h3stuvwx', status: 'PENDING_PRINT' },
  { id: 'j8yzabcd', name: 'Evelyn Grace Moore',         createdAt: '2026-05-29', qrCodeUrl: 'https://legacylink.co/p/j8yzabcd', status: 'PENDING_PRINT' },
  { id: 'k5efghij', name: 'Charles Henry Adams',        createdAt: '2026-05-30', qrCodeUrl: 'https://legacylink.co/p/k5efghij', status: 'PENDING_PRINT' },
];

// ── Scan trend helpers ────────────────────────────────────────────────────────
function randomScans(base: number, variance: number) {
  return Math.max(0, Math.round(base + (Math.random() - 0.5) * variance * 2));
}

function generateTrend(days: number, base: number, variance: number): ScanDataPoint[] {
  const out: ScanDataPoint[] = [];
  const now = new Date('2026-05-31');
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    out.push({
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      scans: randomScans(base, variance),
    });
  }
  return out;
}

export const SCAN_TRENDS: Record<'7d' | '30d' | 'all', ScanDataPoint[]> = {
  '7d':  generateTrend(7,  280, 80),
  '30d': generateTrend(30, 260, 120),
  'all': generateTrend(90, 220, 160),
};

// ── Geographic data (Canada only) ────────────────────────────────────────────
export const GEO_DATA: GeoEntry[] = [
  { city: 'Toronto',      country: 'Canada', scans: 763, pct: 31.2 },
  { city: 'Vancouver',    country: 'Canada', scans: 541, pct: 22.1 },
  { city: 'Calgary',      country: 'Canada', scans: 387, pct: 15.8 },
  { city: 'Montreal',     country: 'Canada', scans: 312, pct: 12.8 },
  { city: 'Ottawa',       country: 'Canada', scans: 198, pct:  8.1 },
  { city: 'Edmonton',     country: 'Canada', scans: 143, pct:  5.9 },
  { city: 'Winnipeg',     country: 'Canada', scans:  87, pct:  3.6 },
  { city: 'Halifax',      country: 'Canada', scans:  15, pct:  0.6 },
];

// ── Device breakdown (mobile only — QR codes are scanned on phones) ───────────
export const DEVICE_DATA: DeviceEntry[] = [
  { name: 'iOS',     value: 62, color: '#6366f1' },
  { name: 'Android', value: 38, color: '#10b981' },
];

// =============================================================================
// BILLING MOCK DATA
// =============================================================================

export type TxStatus = 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface MockTransaction {
  id:             string;   // Stripe charge ID
  amount:         number;   // cents
  currency:       string;
  status:         TxStatus;
  isPotentialDup: boolean;
  stripeInvoiceId?: string;
  refunded:       boolean;
  refundedAmount: number;   // cents
  refundReason?:  string;
  createdAt:      string;   // ISO
}

export interface MockBillingAccount {
  id:               string;
  name:             string;
  email:            string;
  stripeCustomerId: string;
  plan:             'BASIC' | 'PREMIUM';
  profileCount:     number;
  status:           'ACTIVE' | 'SUSPENDED';
  createdAt:        string;
  transactions:     MockTransaction[];
}

export const BILLING_ACCOUNTS: MockBillingAccount[] = [
  {
    id:               'usr-0001',
    name:             'Jane Doe',
    email:            'jane.doe@gmail.com',
    stripeCustomerId: 'cus_PxKq8mR3t7vA2',
    plan:             'PREMIUM',
    profileCount:     3,
    status:           'ACTIVE',
    createdAt:        '2025-11-14T09:00:00Z',
    transactions: [
      {
        id:             'ch_3MnsK2LkdIwHu7ix0bWqRGm9',
        amount:         1500,
        currency:       'cad',
        status:         'PAID',
        isPotentialDup: false,
        stripeInvoiceId: 'in_1Nqr8bLkdIwHu7ixaRHoKkle',
        refunded:       false,
        refundedAmount: 0,
        createdAt:      '2026-06-01T10:14:22Z',
      },
      {
        // Fired 1 minute after the first — duplicate charge
        id:             'ch_3MnsA1LkdIwHu7ix0bWqTFm4',
        amount:         1500,
        currency:       'cad',
        status:         'PAID',
        isPotentialDup: true,
        refunded:       false,
        refundedAmount: 0,
        createdAt:      '2026-06-01T10:13:05Z',
      },
      {
        id:             'ch_3Mm2P9LkdIwHu7ix1cXrQNk2',
        amount:         1500,
        currency:       'cad',
        status:         'REFUNDED',
        isPotentialDup: false,
        refunded:       true,
        refundedAmount: 1500,
        refundReason:   'requested_by_customer',
        createdAt:      '2026-05-01T08:31:00Z',
      },
      {
        id:             'ch_3Ml9K3LkdIwHu7ix0aWpQLk1',
        amount:         1500,
        currency:       'cad',
        status:         'PAID',
        isPotentialDup: false,
        refunded:       false,
        refundedAmount: 0,
        createdAt:      '2026-04-01T11:05:44Z',
      },
    ],
  },
  {
    id:               'usr-0002',
    name:             'Thomas Whitfield',
    email:            'twhitfield@outlook.com',
    stripeCustomerId: 'cus_QyLr9nS4u8wB3',
    plan:             'PREMIUM',
    profileCount:     1,
    status:           'ACTIVE',
    createdAt:        '2026-01-20T14:00:00Z',
    transactions: [
      {
        id:             'ch_3MpqR7LkdIwHu7ix2dYsRMm8',
        amount:         1500,
        currency:       'cad',
        status:         'PAID',
        isPotentialDup: false,
        refunded:       false,
        refundedAmount: 0,
        createdAt:      '2026-06-01T07:22:11Z',
      },
      {
        id:             'ch_3MopL6LkdIwHu7ix2cXqPLl7',
        amount:         1500,
        currency:       'cad',
        status:         'PARTIALLY_REFUNDED',
        isPotentialDup: false,
        refunded:       false,
        refundedAmount: 750,
        refundReason:   'requested_by_customer',
        createdAt:      '2026-05-01T09:14:00Z',
      },
    ],
  },
  {
    id:               'usr-0003',
    name:             'Grace Patterson',
    email:            'grace.p@gmail.com',
    stripeCustomerId: 'cus_RzMs0oT5v9xC4',
    plan:             'PREMIUM',
    profileCount:     1,
    status:           'ACTIVE',
    createdAt:        '2026-02-08T10:30:00Z',
    transactions: [
      {
        id:             'ch_3MrsT9LkdIwHu7ix3eZtSNn9',
        amount:         1500,
        currency:       'cad',
        status:         'PAID',
        isPotentialDup: false,
        refunded:       false,
        refundedAmount: 0,
        createdAt:      '2026-06-01T06:01:55Z',
      },
      {
        // Duplicate within 3 minutes of the above
        id:             'ch_3MrsS8LkdIwHu7ix3eZtRMm8',
        amount:         1500,
        currency:       'cad',
        status:         'PAID',
        isPotentialDup: true,
        refunded:       false,
        refundedAmount: 0,
        createdAt:      '2026-06-01T05:58:30Z',
      },
      {
        id:             'ch_3Mqr4LkdIwHu7ix1bWoQJk0',
        amount:         1500,
        currency:       'cad',
        status:         'FAILED',
        isPotentialDup: false,
        refunded:       false,
        refundedAmount: 0,
        createdAt:      '2026-05-01T15:44:22Z',
      },
    ],
  },
  {
    id:               'usr-0004',
    name:             'Michael Chen',
    email:            'm.chen@icloud.com',
    stripeCustomerId: 'cus_SaNt1pU6w0yD5',
    plan:             'BASIC',
    profileCount:     1,
    status:           'ACTIVE',
    createdAt:        '2026-03-15T08:00:00Z',
    transactions: [
      {
        id:             'ch_3MtuV1LkdIwHu7ix4fAsUOo0',
        amount:         16900,
        currency:       'cad',
        status:         'PAID',
        isPotentialDup: false,
        refunded:       false,
        refundedAmount: 0,
        createdAt:      '2026-05-15T10:00:00Z',
      },
    ],
  },
];
