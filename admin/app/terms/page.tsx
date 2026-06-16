import Link from 'next/link';

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-base font-semibold text-stone-800 mb-3 pb-2 border-b border-stone-100">{title}</h2>
      <div className="space-y-3 text-sm text-stone-600 leading-relaxed">{children}</div>
    </section>
  );
}

function Callout({ color, children }: { color: 'amber' | 'red' | 'stone'; children: React.ReactNode }) {
  const styles = {
    amber: 'bg-amber-50 border-amber-100 text-amber-900',
    red:   'bg-red-50   border-red-100   text-red-900',
    stone: 'bg-stone-50 border-stone-200 text-stone-700',
  };
  return (
    <div className={`border rounded-xl px-4 py-3 text-sm leading-relaxed ${styles[color]}`}>
      {children}
    </div>
  );
}

function SubHead({ children }: { children: React.ReactNode }) {
  return <p className="font-semibold text-stone-700 mt-1">{children}</p>;
}

const TOC = [
  { id: 'acceptance',    label: '1. Acceptance of Terms'                      },
  { id: 'products',      label: '2. Products & Services'                      },
  { id: 'billing',       label: '3. Pricing, Billing & Payment'               },
  { id: 'upgrade',       label: '4. One-Time Payment Upgrade Window'          },
  { id: 'default',       label: '5. Subscription Default & Payment Failure'   },
  { id: 'refunds',       label: '6. Cancellations & Refunds'                  },
  { id: 'shipping',      label: '7. Shipping & Delivery'                      },
  { id: 'plaque',        label: '8. Physical Plaque Warranty & Liability'     },
  { id: 'hosting',       label: '9. Lifetime Hosting — Definition'            },
  { id: 'moderation',    label: '10. Content Moderation & Public QR Codes'   },
  { id: 'copyright',     label: '11. Media, Copyright & IP'                  },
  { id: 'inheritance',   label: '12. Account Ownership & Succession'         },
  { id: 'privacy',       label: '13. Privacy & Data'                         },
  { id: 'termination',   label: '14. Account Termination'                    },
  { id: 'liability',     label: '15. Limitation of Liability'                },
  { id: 'governing',     label: '16. Governing Law'                          },
  { id: 'changes',       label: '17. Changes to These Terms'                 },
  { id: 'contact',       label: '18. Contact Us'                             },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/purchase" className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Checkout
          </Link>
          <span className="text-xs text-stone-400">Effective June 15, 2026</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 flex gap-12">

        {/* Table of contents — desktop sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-20">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3">Contents</p>
            <nav className="space-y-0.5">
              {TOC.map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-xs text-stone-500 hover:text-stone-800 py-0.5 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-stone-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
              Terms of Service
            </h1>
            <p className="text-sm text-stone-400">
              Last updated: June 15, 2026 · These terms govern your purchase and use of LegacyLink products
              and services. Please read them carefully before placing an order.
            </p>
          </div>

          {/* ── 1 ── */}
          <Section id="acceptance" title="1. Acceptance of Terms">
            <p>
              By accessing the LegacyLink website, creating an account, or placing an order, you agree to be
              bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use our
              services.
            </p>
            <p>
              These terms constitute a legally binding agreement between you (&quot;Customer&quot;) and
              LegacyLink (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
            </p>
          </Section>

          {/* ── 2 ── */}
          <Section id="products" title="2. Products & Services">
            <p>LegacyLink offers two core products:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-medium text-stone-700">Memorial Plaque</span> — A 3″ × 3″ laser-engraved
                QR plaque in your choice of Marine-Grade Stainless Steel or Marine Brushed Bronze, shipped via
                USPS standard shipping.
              </li>
              <li>
                <span className="font-medium text-stone-700">Digital Memorial Profile</span> — A hosted online
                memorial page accessible via the QR code on your plaque, available in Basic (free) or Premium
                tiers.
              </li>
            </ul>
            <p>
              All plaque orders include a digital memorial profile, QR scan analytics, privacy PIN protection,
              and free profile updates for the life of the service.
            </p>
          </Section>

          {/* ── 3 ── */}
          <Section id="billing" title="3. Pricing, Billing & Payment">
            <p>All prices are listed in Canadian dollars (CAD) and are subject to applicable taxes.</p>

            <div className="space-y-3">
              {[
                {
                  label: 'Plaque (one-time)',
                  body: 'Charged at checkout. Stainless Steel: $169 CAD. Brushed Bronze: $189 CAD. Engraving begins within 1–2 business days of payment confirmation.',
                },
                {
                  label: 'Basic Plan',
                  body: 'Included free with every plaque purchase. Provides core memorial features indefinitely with no recurring charge.',
                },
                {
                  label: 'Premium Monthly',
                  body: '$15.00 CAD per month, billed on the same calendar date each month for 24 consecutive months (total commitment: $360 CAD). Your subscription begins on the date of your first successful Premium payment.',
                },
                {
                  label: 'Premium One-Time (Lifetime)',
                  body: '$199 CAD charged once at checkout. Grants permanent lifetime access to all Premium features with no further payments required.',
                },
              ].map(row => (
                <div key={row.label} className="bg-stone-50 border border-stone-100 rounded-xl p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1.5">{row.label}</p>
                  <p>{row.body}</p>
                </div>
              ))}
            </div>

            <p>
              Payments are processed securely by Stripe. LegacyLink does not store your full card number.
              By providing payment details you authorize us to charge the applicable amount.
            </p>
          </Section>

          {/* ── 4 ── */}
          <Section id="upgrade" title="4. One-Time Payment Upgrade Window">
            <Callout color="amber">
              <strong>Important:</strong> The optional upgrade from a Premium Monthly subscription to
              Premium One-Time (Lifetime) access — at $199 CAD — is available{' '}
              <strong>only within the first 90 days of enrollment</strong> (your first three billing cycles).
              After this window closes the upgrade option is permanently removed from your dashboard and
              cannot be reinstated.
            </Callout>
            <p>
              This limit is enforced both in the customer dashboard and at the payment-processing level.
              No exceptions are made after the 90-day period has elapsed, regardless of circumstance.
            </p>
            <p>
              The $199 upgrade fee is a flat rate. Monthly payments already made are not credited toward,
              or refunded upon, conversion to the lifetime plan. See Section 6 for the full refund policy.
            </p>
            <p>
              If you chose the $199 one-time payment at initial checkout this clause does not apply —
              you are already on the lifetime plan.
            </p>
          </Section>

          {/* ── 5 ── */}
          <Section id="default" title="5. Subscription Default & Payment Failure">
            <Callout color="red">
              <strong>Payment failure policy:</strong> If a scheduled monthly payment fails and is not
              successfully collected within <strong>7 days</strong>, we will send a payment failure notice to
              your registered email. If the outstanding balance remains unresolved after a{' '}
              <strong>30-day grace period</strong>, LegacyLink reserves the right to set your digital memorial
              profile to <strong>Private / Hidden</strong> — meaning the QR code on your physical plaque will
              no longer load the memorial page for public visitors.
            </Callout>
            <p>
              Your profile data is never deleted due to a payment failure. Once the outstanding balance is
              cleared, your memorial profile will be restored to its previous visibility within 24 hours.
            </p>
            <p>
              We will make at least three contact attempts (email) before restricting access. If you believe
              a charge failed in error, contact us at{' '}
              <a href="mailto:info@legacylinkstudio.com" className="text-stone-700 underline underline-offset-2">
                info@legacylinkstudio.com
              </a>{' '}
              immediately.
            </p>
            <p>
              LegacyLink is not responsible for any emotional distress or inconvenience caused to family
              members who attempt to scan a plaque while a profile is temporarily hidden due to non-payment.
              It is the account holder&apos;s responsibility to maintain a valid payment method on file.
            </p>
          </Section>

          {/* ── 6 ── */}
          <Section id="refunds" title="6. Cancellations & Refunds">
            <SubHead>Plaques</SubHead>
            <p>
              All plaque sales are final once engraving has begun. If you contact us before engraving starts
              (typically within 24 hours of order) we will issue a full refund. Email{' '}
              <a href="mailto:info@legacylinkstudio.com" className="text-stone-700 underline underline-offset-2">
                info@legacylinkstudio.com
              </a>{' '}
              immediately to request a pre-engraving cancellation.
            </p>

            <SubHead>Premium Monthly Subscription</SubHead>
            <p>
              You may cancel at any time from your billing dashboard. Premium access remains active until
              the end of the current billing period; no prorated refunds are issued for unused days.
            </p>
            <p>
              <strong className="text-stone-700">
                Monthly payments made beyond the first 90 days of enrollment are non-refundable.
              </strong>{' '}
              This applies whether you cancel your subscription, switch to the lifetime plan within the
              eligible window, or request a refund for any other reason after the 90-day period has elapsed.
            </p>
            <p>
              Stripe retains its payment processing fees (typically 2.9% + $0.30 per charge) on all
              transactions regardless of cancellation or refund. These fees are not recoverable and are
              excluded from any refund we issue.
            </p>

            <SubHead>Premium One-Time Payment</SubHead>
            <p>
              One-time lifetime payments are non-refundable after 14 days from the date of purchase.
              Within 14 days, contact us at{' '}
              <a href="mailto:info@legacylinkstudio.com" className="text-stone-700 underline underline-offset-2">
                info@legacylinkstudio.com
              </a>{' '}
              if you believe you were charged in error.
            </p>
          </Section>

          {/* ── 7 ── */}
          <Section id="shipping" title="7. Shipping & Delivery">
            <p>
              All plaques ship via USPS Standard at no additional cost. Estimated delivery is 7–14 business
              days after engraving and dispatch. Expedited shipping is not currently available.
            </p>
            <p>
              We are not responsible for delays caused by USPS, customs processing, or incorrect shipping
              addresses provided at checkout. If your plaque is lost or arrives damaged, contact us within
              30 days of the estimated delivery date.
            </p>
          </Section>

          {/* ── 8 ── */}
          <Section id="plaque" title="8. Physical Plaque Warranty & Liability">
            <p>
              Each LegacyLink plaque is manufactured from Marine-Grade materials designed to withstand
              outdoor weathering under normal conditions. We warrant the plaque against manufacturing defects
              for <strong className="text-stone-700">2 years</strong> from the date of delivery.
            </p>
            <p>
              This warranty covers: corrosion of the base material, delamination of the engraving, and
              structural failure under normal outdoor use.
            </p>
            <p>This warranty does <strong>not</strong> cover:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Physical damage caused by lawn maintenance equipment (e.g., lawnmowers, string trimmers)</li>
              <li>Vandalism, theft, or intentional damage by third parties</li>
              <li>Damage caused by improper installation or mounting</li>
              <li>Cosmetic wear consistent with normal outdoor aging (surface patina, minor scratches)</li>
              <li>Loss of the plaque due to cemetery or memorial park policy changes</li>
            </ul>
            <p>
              LegacyLink is not liable for the physical placement, security, or ongoing condition of plaques
              once they have been delivered. Placement on cemetery grounds, memorial benches, or other
              third-party property is done at the customer&apos;s sole discretion and risk. It is the
              customer&apos;s responsibility to obtain any required permission from the relevant property
              owner or authority before installing a plaque.
            </p>
            <p>
              To make a warranty claim, email{' '}
              <a href="mailto:info@legacylinkstudio.com" className="text-stone-700 underline underline-offset-2">
                info@legacylinkstudio.com
              </a>{' '}
              with a photo of the defect and your order number. Approved warranty claims will receive a
              replacement plaque at no charge.
            </p>
          </Section>

          {/* ── 9 ── */}
          <Section id="hosting" title='9. Lifetime Hosting — Definition & Commitment'>
            <Callout color="stone">
              <strong>What &quot;permanent&quot; and &quot;lifetime&quot; hosting means at LegacyLink:</strong>{' '}
              We commit to hosting your digital memorial profile for a{' '}
              <strong>minimum of 20 years</strong> from the date of your purchase, or for as long as
              LegacyLink commercially operates the service — whichever is longer.
            </Callout>
            <p>
              In the event LegacyLink ceases operations or discontinues the hosting service, we will
              provide no less than <strong>12 months&apos; written notice</strong> to all registered account
              holders and will offer a full data export (profile text, uploaded photos, timeline entries,
              and guestbook entries) in a standard portable format (JSON + ZIP) at no charge.
            </p>
            <p>
              &quot;Lifetime hosting&quot; refers to the operational life of the LegacyLink service, not
              the lifetime of any individual. It does not constitute a guarantee of hosting in perpetuity
              beyond the 20-year minimum or beyond the operational life of the company.
            </p>
            <p>
              In the event of a corporate restructure, acquisition, or merger, these hosting commitments
              will transfer to the acquiring entity as a condition of any such transaction.
            </p>
          </Section>

          {/* ── 10 ── */}
          <Section id="moderation" title="10. Content Moderation & Public-Facing QR Codes">
            <p>
              Because LegacyLink plaques are placed in public spaces — including cemeteries, memorial parks,
              and community locations — the QR codes encoded on them are accessible to any member of the
              public. You acknowledge this public accessibility and accept responsibility for managing the
              content on your profile accordingly.
            </p>

            <SubHead>Account Holder Responsibilities</SubHead>
            <p>
              The registered account holder (the &quot;Admin&quot;) is responsible for moderating all
              user-submitted content on their memorial profile, including guestbook entries, tribute
              messages, and uploaded photos submitted by profile visitors.
            </p>
            <p>
              Guestbook submissions from visitors are held in a pending/unapproved state by default and
              must be explicitly approved by the Admin before they become publicly visible. The Admin
              must review and either approve or reject pending submissions in a timely manner.
            </p>

            <SubHead>Prohibited Content</SubHead>
            <p>The following content is prohibited on all LegacyLink profiles, whether submitted by the Admin or visitors:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Hate speech, slurs, or content targeting individuals based on race, religion, gender, sexuality, or disability</li>
              <li>Graphic violence, sexually explicit material, or content harmful to minors</li>
              <li>Harassment, threats, or doxxing of any individual</li>
              <li>Spam, commercial solicitation, or fraudulent content</li>
              <li>Content that infringes on third-party copyright or intellectual property rights</li>
              <li>Defamatory statements about living individuals</li>
            </ul>

            <SubHead>LegacyLink&apos;s Rights</SubHead>
            <p>
              LegacyLink reserves the right to remove any content that violates these standards at any
              time and without prior notice. We are not liable for offensive, inaccurate, or harmful content
              posted by third-party visitors before the Admin has had a reasonable opportunity to review it.
            </p>
            <p>
              Repeat violations of content standards may result in account suspension or termination
              without refund, at LegacyLink&apos;s sole discretion.
            </p>
          </Section>

          {/* ── 11 ── */}
          <Section id="copyright" title="11. Media, Copyright & Intellectual Property">
            <SubHead>Your Content</SubHead>
            <p>
              You retain full ownership of all text, photographs, audio recordings, and video files you
              upload to your LegacyLink memorial profile. LegacyLink claims no ownership over your content.
            </p>
            <p>
              By uploading content to your profile, you grant LegacyLink a{' '}
              <strong className="text-stone-700">
                non-exclusive, royalty-free, worldwide license
              </strong>{' '}
              to store, reproduce, and display that content solely for the purpose of operating and
              delivering the memorial profile service to you and your authorized visitors. This license
              terminates when you delete the content or close your account.
            </p>

            <SubHead>Your Copyright Warranty</SubHead>
            <p>
              By uploading any content, you represent and warrant that:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You own the copyright to the content, or have obtained all necessary permissions from the copyright holder to use and display it on LegacyLink</li>
              <li>The content does not infringe on any third-party intellectual property rights, including but not limited to commercial music, licensed stock photos, or copyrighted films or recordings</li>
              <li>You have the right to grant LegacyLink the license described above</li>
            </ul>
            <p>
              Uploading commercially licensed music, third-party stock photography without a valid license,
              or any other copyrighted material without permission is strictly prohibited and may result
              in immediate content removal and account suspension.
            </p>

            <SubHead>LegacyLink IP</SubHead>
            <p>
              The LegacyLink name, logo, website design, and platform software are the exclusive property
              of LegacyLink. Nothing in these terms grants you a right to use our trademarks, branding,
              or proprietary technology.
            </p>
          </Section>

          {/* ── 12 ── */}
          <Section id="inheritance" title="12. Account Ownership, Succession Planning & Inheritance">
            <p>
              We recognize that the person who creates a LegacyLink account may not always be the
              long-term custodian of the memorial. To support this, LegacyLink offers two paths for
              transferring account control: a digital succession planning tool and a manual transfer
              process.
            </p>

            <SubHead>Legacy Executor — Digital Succession Planning</SubHead>
            <Callout color="stone">
              Account holders can designate up to <strong>3 Legacy Executors</strong> — trusted
              individuals who are pre-authorized to submit a claim for account control after the
              account holder&apos;s passing. Executors are invited by email and must complete identity
              verification before any claim can be submitted.
            </Callout>
            <p>
              To designate a Legacy Executor, navigate to <strong>Settings → Succession Planning</strong>{' '}
              in your account dashboard. You will need to provide the executor&apos;s full name, email
              address, and their relationship to you (e.g., Spouse, Child, Attorney).
            </p>
            <p>
              Each designated executor receives an email invitation with a secure verification link
              valid for 7 days. Once they verify their identity, their status becomes active. If you
              need to revoke an executor&apos;s designation at any time, you may do so from the Settings
              page. Revocation takes effect immediately and the executor is notified by email.
            </p>
            <p>
              After the account holder&apos;s passing, a verified Legacy Executor may log in to LegacyLink
              and submit a formal claim request, including a brief statement of their relationship and
              authority. All claims are reviewed by LegacyLink staff within{' '}
              <strong>10 business days</strong>. We may request supporting documentation (e.g., a
              death certificate or letter of administration) as part of the review process. Approved
              claims result in the transfer of full account administrative rights to the executor.
            </p>

            <SubHead>Manual Transfer Request</SubHead>
            <p>
              For situations not covered by the Legacy Executor tool — such as accounts with no
              designated executor, or transfers required by a court or estate directive — submit a
              written transfer request to{' '}
              <a href="mailto:info@legacylinkstudio.com" className="text-stone-700 underline underline-offset-2">
                info@legacylinkstudio.com
              </a>{' '}
              with the following:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Full name and email address of the current account holder</li>
              <li>Full name and email address of the intended new account holder</li>
              <li>Proof of relationship (e.g., birth certificate, marriage certificate) or authorization
                  from the estate executor (e.g., a letter of administration or grant of probate)</li>
              <li>A brief written statement explaining the reason for the transfer</li>
            </ul>
            <p>
              LegacyLink will review all manual transfer requests within 10 business days and may
              request additional documentation. We reserve the right to decline transfers that cannot
              be adequately verified.
            </p>

            <SubHead>Death of the Account Holder</SubHead>
            <p>
              If the registered account holder passes away and no Legacy Executor has been designated
              or verified, a next of kin or estate executor may submit a manual transfer request using
              the process above. Until a transfer is completed, billing obligations continue under the
              existing subscription terms.
            </p>
            <p>
              LegacyLink is not responsible for lapses in payment or profile visibility that occur
              during the period between the account holder&apos;s death and the completion of a transfer.
            </p>

            <SubHead>Account Access by Visitors</SubHead>
            <p>
              Family members and visitors who do not hold the account may view (but not edit) the
              memorial profile at any time, subject to the account holder&apos;s privacy settings.
              Administrative access — the ability to edit the profile, approve guestbook entries, and
              manage settings — is restricted to the registered account holder, a designated Legacy
              Executor whose claim has been approved, or an authorized manual transferee.
            </p>
          </Section>

          {/* ── 13 ── */}
          <Section id="privacy" title="13. Privacy & Data">
            <p>
              We collect the minimum personal information necessary to provide our services: your name,
              email address, shipping address, and payment details (processed and stored by Stripe —
              we never see your full card number).
            </p>
            <p>
              We do not sell your personal information to third parties. Aggregate, anonymized analytics
              may be used to improve the service.
            </p>
            <p>
              You may request deletion of your account and associated data at any time by contacting{' '}
              <a href="mailto:info@legacylinkstudio.com" className="text-stone-700 underline underline-offset-2">
                info@legacylinkstudio.com
              </a>.
              Note that physical plaques already shipped cannot be recalled. Deletion of your account will
              result in the permanent removal of your digital memorial profile after a 30-day grace period.
            </p>
          </Section>

          {/* ── 14 ── */}
          <Section id="termination" title="14. Account Termination">
            <p>
              You may close your account at any time. Closing your account will not trigger a refund
              of any paid amounts. Any active subscription must be explicitly cancelled from the billing
              dashboard before closing to avoid further charges.
            </p>
            <p>
              LegacyLink reserves the right to suspend or terminate accounts that violate these terms,
              engage in fraudulent activity, or upload unlawful content. In such cases no refund will
              be issued.
            </p>
          </Section>

          {/* ── 15 ── */}
          <Section id="liability" title="15. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, LegacyLink shall not be liable for any
              indirect, incidental, special, or consequential damages arising from your use of our
              products or services, including but not limited to loss of data, loss of profits, service
              interruptions, or emotional distress.
            </p>
            <p>
              Our total liability for any claim arising from these terms or your use of the service
              shall not exceed the total amount you paid to LegacyLink in the 12 months preceding the
              claim.
            </p>
          </Section>

          {/* ── 16 ── */}
          <Section id="governing" title="16. Governing Law">
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of the
              Province of Ontario, Canada, without regard to its conflict of law provisions. Any
              disputes shall be resolved in the courts of Ontario.
            </p>
          </Section>

          {/* ── 17 ── */}
          <Section id="changes" title="17. Changes to These Terms">
            <p>
              We may update these Terms of Service from time to time. When we do, we will update the
              &quot;Last updated&quot; date at the top of this page and notify active customers by email
              at least 30 days before material changes take effect. Continued use of our services after
              that date constitutes acceptance of the revised terms.
            </p>
          </Section>

          {/* ── 18 ── */}
          <Section id="contact" title="18. Contact Us">
            <p>Questions about these terms? We&apos;re happy to help.</p>
            <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 space-y-1">
              <p className="font-medium text-stone-700">LegacyLink</p>
              <p>
                Email:{' '}
                <a href="mailto:info@legacylinkstudio.com" className="text-stone-700 underline underline-offset-2">
                  info@legacylinkstudio.com
                </a>
              </p>
              <p>Ontario, Canada</p>
            </div>
          </Section>

          <div className="pt-6 border-t border-stone-100">
            <Link
              href="/purchase"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-700 hover:text-stone-900 transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Back to Checkout
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
