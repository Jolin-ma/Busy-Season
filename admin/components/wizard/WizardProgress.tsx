interface Props {
  currentStep: number;
  steps: string[];
}

export default function WizardProgress({ currentStep, steps }: Props) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => {
        const step = i + 1;
        const done = step < currentStep;
        const active = step === currentStep;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                  ${done ? 'bg-stone-700 text-white' : active ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-400'}`}
              >
                {done ? '✓' : step}
              </div>
              <span className={`text-[10px] mt-1.5 font-medium tracking-wide ${active ? 'text-stone-700' : 'text-stone-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 h-px mx-1 mb-5 ${done ? 'bg-stone-700' : 'bg-stone-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
