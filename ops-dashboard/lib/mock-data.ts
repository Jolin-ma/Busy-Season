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
  shortIds:         string[];   // profile short IDs owned by this account
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
    shortIds:         ['a5trneuj', 'b2kmpqvx', 'c7nrswyz'],
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
    shortIds:         ['d4fhijkl'],
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
    shortIds:         ['e9lmnopq', 'f3rstuvw'],
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
    shortIds:         ['g6abcdef', 'h8ghijkl'],
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

// =============================================================================
// SHIPPING ORDERS
// =============================================================================

export type ShipStatus = 'PENDING_QR' | 'PENDING_SHIP' | 'SHIPPED' | 'DELIVERED';
export type PlaqueStyle = 'Bronze Classic' | 'Slate Matte' | 'Steel Premium';

export interface ShippingOrder {
  id:            string;
  profileId:     string;
  profileName:   string;
  customerName:  string;
  customerEmail: string;
  address:       string;
  city:          string;
  plaqueStyle:   PlaqueStyle;
  status:        ShipStatus;
  trackingNumber?: string;
  orderedAt:     string;
  shippedAt?:    string;
}

export const SHIPPING_ORDERS: ShippingOrder[] = [
  { id: 'ORD-2043', profileId: 'k5efghij', profileName: 'Charles Henry Adams',       customerName: 'Susan Adams',       customerEmail: 'susanadams@icloud.com',  address: '55 Queen St W, Toronto, ON M5H 2M5',        city: 'Toronto',   plaqueStyle: 'Steel Premium',  status: 'PENDING_QR',   orderedAt: '2026-05-30T14:22:00Z' },
  { id: 'ORD-2042', profileId: 'j8yzabcd', profileName: 'Evelyn Grace Moore',         customerName: 'David Moore',       customerEmail: 'd.moore@outlook.com',    address: '88 Rideau St, Ottawa, ON K1N 5X7',          city: 'Ottawa',    plaqueStyle: 'Slate Matte',    status: 'PENDING_QR',   orderedAt: '2026-05-29T08:30:00Z' },
  { id: 'ORD-2041', profileId: 'h3stuvwx', profileName: 'James Arthur Wilson',        customerName: 'Patricia Wilson',   customerEmail: 'pwilson@gmail.com',      address: '142 Maple Ave, Barrie, ON L4N 2P7',         city: 'Barrie',    plaqueStyle: 'Bronze Classic', status: 'PENDING_QR',   orderedAt: '2026-05-28T11:00:00Z' },
  { id: 'ORD-2040', profileId: 'd9lmopqr', profileName: 'William Thomas Burke',       customerName: 'Mary Burke',        customerEmail: 'maryburke@gmail.com',    address: '34 Wellington St, Hamilton, ON L8P 1H5',    city: 'Hamilton',  plaqueStyle: 'Bronze Classic', status: 'PENDING_SHIP', orderedAt: '2026-05-18T10:15:00Z' },
  { id: 'ORD-2039', profileId: 'b7kwmnpq', profileName: 'Harold James Foster',        customerName: 'Grace Patterson',   customerEmail: 'grace.p@gmail.com',      address: '1200 Pine Ridge Rd, Kingston, ON K7M 3B3',  city: 'Kingston',  plaqueStyle: 'Slate Matte',    status: 'PENDING_SHIP', orderedAt: '2026-05-12T13:45:00Z' },
  { id: 'ORD-2038', profileId: 'a5trneuj', profileName: 'Margaret Eleanor Whitfield', customerName: 'Jennifer Whitfield', customerEmail: 'j.whitfield@email.com', address: '270 Laurier Ave W, Ottawa, ON K1P 6V4',     city: 'Ottawa',    plaqueStyle: 'Bronze Classic', status: 'PENDING_SHIP', orderedAt: '2026-05-10T09:00:00Z' },
  { id: 'ORD-2036', profileId: 'g6mnopqr', profileName: 'Helen Mary Davis',           customerName: 'Robert Davis',      customerEmail: 'rdavis@gmail.com',       address: '420 9 Ave SW, Calgary, AB T2P 3C5',         city: 'Calgary',   plaqueStyle: 'Bronze Classic', status: 'SHIPPED',      trackingNumber: 'CP987654321CA', orderedAt: '2026-05-25T12:00:00Z', shippedAt: '2026-05-29T09:00:00Z' },
  { id: 'ORD-2035', profileId: 'c2xvrtyu', profileName: 'Dorothy Mae Chen',           customerName: 'Michael Chen',      customerEmail: 'm.chen@icloud.com',      address: '1500 Robson St, Vancouver, BC V6G 1C3',     city: 'Vancouver', plaqueStyle: 'Steel Premium',  status: 'SHIPPED',      trackingNumber: 'CP123456789CA', orderedAt: '2026-05-15T09:00:00Z', shippedAt: '2026-05-22T14:00:00Z' },
  { id: 'ORD-2031', profileId: 'f1ghijkl', profileName: 'Robert Lee Thompson',        customerName: 'Sandra Liu',        customerEmail: 'sandra.liu@gmail.com',   address: '200 Wellington St, Ottawa, ON K1A 0A6',     city: 'Ottawa',    plaqueStyle: 'Slate Matte',    status: 'DELIVERED',    trackingNumber: 'CP444555666CA', orderedAt: '2026-05-05T09:00:00Z', shippedAt: '2026-05-10T14:00:00Z' },
  { id: 'ORD-2030', profileId: 'e4stuijk', profileName: 'Florence Anna Park',         customerName: 'Thomas Park',       customerEmail: 'tpark@icloud.com',       address: '789 Yonge St, Toronto, ON M4W 2G8',         city: 'Toronto',   plaqueStyle: 'Steel Premium',  status: 'DELIVERED',    trackingNumber: 'CP111222333CA', orderedAt: '2026-05-01T10:00:00Z', shippedAt: '2026-05-07T11:00:00Z' },
];

// =============================================================================
// CONTENT MODERATION
// =============================================================================

export type FlagType   = 'IMAGE' | 'TEXT' | 'GUESTBOOK';
export type FlagStatus = 'PENDING' | 'APPROVED' | 'REMOVED';

export interface FlaggedItem {
  id:          string;
  type:        FlagType;
  profileId:   string;
  profileName: string;
  content:     string;
  reason:      string;
  reportCount: number;
  reportedAt:  string;
  status:      FlagStatus;
  autoFlag:    boolean;
}

export const FLAGGED_ITEMS: FlaggedItem[] = [
  { id: 'FLAG-001', type: 'GUESTBOOK', profileId: 'a5trneuj', profileName: 'Margaret Eleanor Whitfield', content: 'This page is FAKE. This woman was a criminal and deserves no memorial!',           reason: 'Harassment / false statements',       reportCount: 4, reportedAt: '2026-05-30T16:22:00Z', status: 'PENDING',  autoFlag: false },
  { id: 'FLAG-002', type: 'IMAGE',     profileId: 'e4stuijk', profileName: 'Florence Anna Park',          content: '[Profile photo] — nudity/explicit content detected by AI scanner',                reason: 'Inappropriate content (auto-flagged)', reportCount: 1, reportedAt: '2026-05-31T09:05:00Z', status: 'PENDING',  autoFlag: true  },
  { id: 'FLAG-003', type: 'TEXT',      profileId: 'c2xvrtyu', profileName: 'Dorothy Mae Chen',            content: 'Buy cheap medications at ph4rm4cy.ru — great deals every day! 💊',               reason: 'Spam / advertisement (auto-flagged)', reportCount: 2, reportedAt: '2026-05-29T11:40:00Z', status: 'PENDING',  autoFlag: true  },
  { id: 'FLAG-004', type: 'GUESTBOOK', profileId: 'b7kwmnpq', profileName: 'Harold James Foster',         content: 'My uncle would have hated this cheesy tribute. Absolutely shameful.',              reason: 'Reported as hurtful',                 reportCount: 1, reportedAt: '2026-05-28T14:15:00Z', status: 'APPROVED', autoFlag: false },
  { id: 'FLAG-005', type: 'IMAGE',     profileId: 'd9lmopqr', profileName: 'William Thomas Burke',        content: '[Photo upload] — duplicate/stock photo image detected, likely not the deceased',  reason: 'Suspicious media (auto-flagged)',     reportCount: 1, reportedAt: '2026-05-27T08:33:00Z', status: 'REMOVED',  autoFlag: true  },
];

export interface BannedEntity {
  id:       string;
  type:     'USER' | 'IP';
  value:    string;
  reason:   string;
  bannedAt: string;
}

export const BANNED_ENTITIES: BannedEntity[] = [
  { id: 'BAN-01', type: 'IP',   value: '103.21.244.0',         reason: 'Scraping bot — mass QR endpoint hits',   bannedAt: '2026-05-15T00:00:00Z' },
  { id: 'BAN-02', type: 'USER', value: 'spammer99@tempmail.io', reason: 'Repeated spam guestbook submissions',    bannedAt: '2026-05-22T10:30:00Z' },
  { id: 'BAN-03', type: 'IP',   value: '185.220.101.47',       reason: 'Tor exit node — abusive mass reports',   bannedAt: '2026-05-28T16:45:00Z' },
  { id: 'BAN-04', type: 'USER', value: 'troll_user@gmail.com', reason: 'Harassment across multiple profiles',    bannedAt: '2026-05-30T09:00:00Z' },
];

// =============================================================================
// MEDIA ASSETS
// =============================================================================

export type AssetStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AssetType   = 'IMAGE' | 'VIDEO' | 'PDF';

export interface MockAsset {
  id:              string;
  filename:        string;
  fileType:        AssetType;
  fileSizeBytes:   number;
  profileId:       string;
  profileName:     string;
  accountId:       string;
  accountName:     string;
  accountEmail:    string;
  uploadedAt:      string;
  status:          AssetStatus;
  hasActivatedQR:  boolean;
  aiFlag:          'NSFW' | 'VIOLENCE' | 'SPAM' | null;
}

export const MOCK_ASSETS: MockAsset[] = [
  // ── PENDING ────────────────────────────────────────────────────────────────
  { id: 'ast-001', filename: 'margaret_portrait.jpg',     fileType: 'IMAGE', fileSizeBytes:  4_200_000, profileId: 'a5trneuj', profileName: 'Margaret Eleanor Whitfield', accountId: 'usr-0001', accountName: 'Jane Doe',          accountEmail: 'jane.doe@gmail.com',   uploadedAt: '2026-06-04T14:32:00Z', status: 'PENDING',  hasActivatedQR: true,  aiFlag: null       },
  { id: 'ast-002', filename: 'family_reunion_2019.jpg',   fileType: 'IMAGE', fileSizeBytes:  8_700_000, profileId: 'a5trneuj', profileName: 'Margaret Eleanor Whitfield', accountId: 'usr-0001', accountName: 'Jane Doe',          accountEmail: 'jane.doe@gmail.com',   uploadedAt: '2026-06-04T14:35:00Z', status: 'PENDING',  hasActivatedQR: true,  aiFlag: null       },
  { id: 'ast-003', filename: 'tribute_video_hd.mp4',      fileType: 'VIDEO', fileSizeBytes: 187_000_000, profileId: 'a5trneuj', profileName: 'Margaret Eleanor Whitfield', accountId: 'usr-0001', accountName: 'Jane Doe',          accountEmail: 'jane.doe@gmail.com',   uploadedAt: '2026-06-04T14:40:00Z', status: 'PENDING',  hasActivatedQR: true,  aiFlag: null       },
  { id: 'ast-004', filename: 'harold_obit_scan.pdf',      fileType: 'PDF',   fileSizeBytes:  1_800_000, profileId: 'b7kwmnpq', profileName: 'Harold James Foster',         accountId: 'usr-0003', accountName: 'Grace Patterson',   accountEmail: 'grace.p@gmail.com',    uploadedAt: '2026-06-03T09:11:00Z', status: 'PENDING',  hasActivatedQR: false, aiFlag: null       },
  { id: 'ast-005', filename: 'ceremony_clip.mp4',         fileType: 'VIDEO', fileSizeBytes:  62_000_000, profileId: 'b7kwmnpq', profileName: 'Harold James Foster',         accountId: 'usr-0003', accountName: 'Grace Patterson',   accountEmail: 'grace.p@gmail.com',    uploadedAt: '2026-06-03T09:14:00Z', status: 'PENDING',  hasActivatedQR: false, aiFlag: null       },
  { id: 'ast-006', filename: 'dorothy_photo_1962.jpg',    fileType: 'IMAGE', fileSizeBytes:  3_100_000, profileId: 'c2xvrtyu', profileName: 'Dorothy Mae Chen',            accountId: 'usr-0004', accountName: 'Michael Chen',      accountEmail: 'm.chen@icloud.com',    uploadedAt: '2026-06-02T16:50:00Z', status: 'PENDING',  hasActivatedQR: true,  aiFlag: null       },
  { id: 'ast-007', filename: 'upload_20260601.jpg',       fileType: 'IMAGE', fileSizeBytes:  2_400_000, profileId: 'e9lmnopq', profileName: 'Unlinked Memorial',           accountId: 'usr-0003', accountName: 'Grace Patterson',   accountEmail: 'grace.p@gmail.com',    uploadedAt: '2026-06-01T22:05:00Z', status: 'PENDING',  hasActivatedQR: false, aiFlag: 'NSFW'     },
  { id: 'ast-008', filename: 'william_young_photo.jpg',   fileType: 'IMAGE', fileSizeBytes:  5_900_000, profileId: 'd9lmopqr', profileName: 'William Thomas Burke',        accountId: 'usr-0002', accountName: 'Thomas Whitfield',  accountEmail: 'twhitfield@outlook.com', uploadedAt: '2026-06-01T11:20:00Z', status: 'PENDING',  hasActivatedQR: true,  aiFlag: null       },
  // ── APPROVED ───────────────────────────────────────────────────────────────
  { id: 'ast-009', filename: 'florence_headshot.jpg',     fileType: 'IMAGE', fileSizeBytes:  3_700_000, profileId: 'e4stuijk', profileName: 'Florence Anna Park',          accountId: 'usr-0001', accountName: 'Jane Doe',          accountEmail: 'jane.doe@gmail.com',   uploadedAt: '2026-05-30T10:00:00Z', status: 'APPROVED', hasActivatedQR: true,  aiFlag: null       },
  { id: 'ast-010', filename: 'memorial_program.pdf',      fileType: 'PDF',   fileSizeBytes:    980_000, profileId: 'e4stuijk', profileName: 'Florence Anna Park',          accountId: 'usr-0001', accountName: 'Jane Doe',          accountEmail: 'jane.doe@gmail.com',   uploadedAt: '2026-05-30T10:04:00Z', status: 'APPROVED', hasActivatedQR: true,  aiFlag: null       },
  { id: 'ast-011', filename: 'robert_1985.jpg',           fileType: 'IMAGE', fileSizeBytes:  4_500_000, profileId: 'f1ghijkl', profileName: 'Robert Lee Thompson',         accountId: 'usr-0001', accountName: 'Jane Doe',          accountEmail: 'jane.doe@gmail.com',   uploadedAt: '2026-05-28T08:30:00Z', status: 'APPROVED', hasActivatedQR: true,  aiFlag: null       },
  // ── REJECTED ───────────────────────────────────────────────────────────────
  { id: 'ast-012', filename: 'suspicious_upload.jpg',     fileType: 'IMAGE', fileSizeBytes:  6_200_000, profileId: 'g6mnopqr', profileName: 'Helen Mary Davis',            accountId: 'usr-0002', accountName: 'Thomas Whitfield',  accountEmail: 'twhitfield@outlook.com', uploadedAt: '2026-05-27T15:10:00Z', status: 'REJECTED', hasActivatedQR: false, aiFlag: 'VIOLENCE' },
  { id: 'ast-013', filename: 'spam_link_image.jpg',       fileType: 'IMAGE', fileSizeBytes:  1_100_000, profileId: 'h3stuvwx', profileName: 'James Arthur Wilson',         accountId: 'usr-0002', accountName: 'Thomas Whitfield',  accountEmail: 'twhitfield@outlook.com', uploadedAt: '2026-05-25T12:00:00Z', status: 'REJECTED', hasActivatedQR: false, aiFlag: 'SPAM'     },
];

export const STORAGE_TOTAL_GB = 34;
export const STORAGE_USED_GB  = 22.8;

export const ACCOUNT_STORAGE: { accountId: string; name: string; email: string; usedBytes: number }[] = [
  { accountId: 'usr-0001', name: 'Jane Doe',         email: 'jane.doe@gmail.com',        usedBytes: 10_580_000_000 },
  { accountId: 'usr-0003', name: 'Grace Patterson',  email: 'grace.p@gmail.com',         usedBytes:  7_240_000_000 },
  { accountId: 'usr-0004', name: 'Michael Chen',     email: 'm.chen@icloud.com',         usedBytes:  3_100_000_000 },
  { accountId: 'usr-0002', name: 'Thomas Whitfield', email: 'twhitfield@outlook.com',    usedBytes:  1_880_000_000 },
];
