import { Memorial, PlaqueStatus } from '@/types/profile';

const STEPS: { key: PlaqueStatus; label: string }[] = [
  { key: 'order_received', label: 'Order Placed' },
  { key: 'engraving',      label: 'Engraving' },
  { key: 'shipped',        label: 'Shipped' },
  { key: 'delivered',      label: 'Delivered' },
];

const STEP_INDEX: Record<PlaqueStatus, number> = {
  order_received: 0,
  engraving:      1,
  shipped:        2,
  delivered:      3,
};

const STATUS_MESSAGES: Record<PlaqueStatus, string> = {
  order_received: 'Your physical plaque is being manufactured. Let\'s start setting up their digital legacy while you wait.',
  engraving:      'Your plaque is currently being laser-engraved. This usually takes 3–5 business days.',
  shipped:        'Your plaque is on its way to you.',
  delivered:      'Your plaque has been delivered. Attach it to the memorial and it\'s ready to scan.',
};

interface Props {
  memorial: Memorial;
  onSetupProfile: () => void;
}

export default function PlaqueStatusCard({ memorial, onSetupProfile }: Props) {
  const currentStep = STEP_INDEX[memorial.plaqueStatus];
  const isNew = memorial.plaqueStatus === 'order_received';

  const tracker = (light: boolean) => (
    <div className="flex items-start mt-6">
      {STEPS.map((step, i) => {
        const done   = i < currentStep;
        const active = i === currentStep;
        const future = i > currentStep;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center relative">
              {/* Step dot */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${light
                    ? done    ? 'bg-stone-700 text-white'
                      : active ? 'bg-stone-900 text-white ring-4 ring-stone-900/20'
                      :          'bg-stone-200 text-stone-400'
                    : done    ? 'bg-white/30 text-white'
                      : active ? 'bg-white text-stone-900 ring-4 ring-white/20'
                      :          'bg-stone-700 text-stone-400'
                  }`}
              >
                {done ? (
                  <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : i + 1}
              </div>

              <span className={`text-[10px] mt-1.5 font-medium whitespace-nowrap
                ${light
                  ? active ? 'text-stone-700' : future ? 'text-stone-400' : 'text-stone-500'
                  : active ? 'text-white'      : future ? 'text-stone-500' : 'text-stone-300'}`}
              >
                {step.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-4
                ${light
                  ? i < currentStep ? 'bg-stone-600' : 'bg-stone-200'
                  : i < currentStep ? 'bg-white/40'  : 'bg-stone-700'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  if (isNew) {
    return (
      <div className="bg-stone-900 border border-stone-700/60 rounded-3xl p-7 mb-8 relative overflow-hidden">
        {/* Decorative watermark */}
        <div className="absolute -bottom-6 -right-6 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-2 -right-2 w-24 h-24 rounded-full bg-white/3 pointer-events-none" />

        <div className="relative">
          <div className="w-11 h-11 bg-stone-700 rounded-2xl flex items-center justify-center mb-5">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-stone-300" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>

          <h2
            className="text-xl font-semibold text-white mb-2 leading-snug"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Your plaque is being crafted
          </h2>
          <p className="text-stone-400 text-sm leading-relaxed mb-6 max-w-sm">
            {STATUS_MESSAGES.order_received}
          </p>

          <button
            onClick={onSetupProfile}
            className="bg-stone-800 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-stone-700 transition-colors"
          >
            Set Up Profile →
          </button>

          {tracker(false)}
        </div>
      </div>
    );
  }

  const cardColor =
    memorial.plaqueStatus === 'engraving'  ? 'bg-stone-900 border-stone-700' :
    memorial.plaqueStatus === 'shipped'    ? 'bg-blue-50 border-blue-100'   :
                                             'bg-green-50 border-green-100';

  return (
    <div className={`rounded-3xl border p-6 mb-8 ${cardColor}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Plaque Status</p>
      <p className="text-sm text-stone-600 leading-relaxed">
        {memorial.plaqueStatus === 'shipped' && memorial.trackingNumber
          ? `Your plaque is on its way. Tracking: ${memorial.trackingNumber}`
          : STATUS_MESSAGES[memorial.plaqueStatus]}
      </p>
      {tracker(true)}
    </div>
  );
}
