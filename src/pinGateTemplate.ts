export function renderPinGate(shortId: string, wrongPin: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Private Memorial — LegacyLink</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: { extend: { fontFamily: { serif: ['Playfair Display', 'Georgia', 'serif'], sans: ['Inter', 'system-ui', 'sans-serif'] } } }
    }
  </script>
  <style>
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%,60%  { transform: translateX(-6px); }
      40%,80%  { transform: translateX(6px); }
    }
    .shake { animation: shake 0.4s ease; }
  </style>
</head>
<body class="min-h-screen bg-stone-50 font-sans flex flex-col items-center justify-center px-6 py-12 antialiased">

  <div class="w-full max-w-xs text-center">

    <!-- Lock icon -->
    <div class="w-14 h-14 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-7 shadow-lg">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" class="w-6 h-6">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    </div>

    <h1 class="text-xl font-semibold text-stone-800 mb-2" style="font-family:'Playfair Display',serif">
      Private Memorial
    </h1>
    <p class="text-stone-400 text-sm leading-relaxed mb-8">
      This profile is private. Enter the 4-digit PIN to view this memorial.
    </p>

    <!-- 4 PIN boxes -->
    <div class="flex gap-3 justify-center mb-2" id="pin-row">
      ${[0,1,2,3].map(i => `
        <input
          id="p${i}"
          type="tel"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="1"
          autocomplete="off"
          class="w-14 h-14 border-2 rounded-xl text-center text-xl font-bold text-stone-800
                 border-stone-200 bg-white focus:border-stone-800 focus:outline-none transition-colors
                 ${wrongPin ? 'border-red-400 bg-red-50' : ''}"
        />`).join('')}
    </div>

    ${wrongPin ? `
      <p id="error-msg" class="text-red-500 text-xs mb-4">Incorrect PIN. Please try again.</p>
    ` : `
      <p id="error-msg" class="text-red-500 text-xs mb-4 hidden">Incorrect PIN. Please try again.</p>
    `}

    <button
      id="submit-btn"
      disabled
      class="mt-2 w-full bg-stone-800 text-white py-4 rounded-2xl text-sm font-semibold
             hover:bg-stone-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      View Memorial
    </button>

    <p class="text-[10px] text-stone-300 mt-6">
      LegacyLink &mdash; Protected Memorial Profile
    </p>
  </div>

  <script>
    const inputs = [0,1,2,3].map(i => document.getElementById('p' + i));
    const btn    = document.getElementById('submit-btn');
    const errMsg = document.getElementById('error-msg');
    const row    = document.getElementById('pin-row');

    // Auto-focus first box
    inputs[0].focus();

    function getPin() { return inputs.map(i => i.value).join(''); }

    function updateBtn() {
      btn.disabled = getPin().length !== 4;
    }

    inputs.forEach((input, i) => {
      input.addEventListener('input', e => {
        // Allow only digits
        e.target.value = e.target.value.replace(/\\D/g, '').slice(0, 1);
        updateBtn();
        if (e.target.value && i < 3) inputs[i + 1].focus();
      });
      input.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !e.target.value && i > 0) {
          inputs[i - 1].focus();
        }
        if (e.key === 'Enter' && getPin().length === 4) submitPin();
      });
    });

    async function submitPin() {
      const pin = getPin();
      if (pin.length !== 4) return;

      btn.disabled = true;
      btn.textContent = 'Checking…';

      try {
        const res = await fetch('/p/${shortId}/unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin })
        });

        if (res.ok) {
          const data = await res.json();
          btn.textContent = '✓ Opening…';
          window.location.href = data.redirectUrl;
        } else {
          // Wrong PIN — shake boxes and show error
          errMsg.classList.remove('hidden');
          row.classList.add('shake');
          inputs.forEach(i => {
            i.value = '';
            i.classList.add('border-red-400', 'bg-red-50');
            i.classList.remove('border-stone-200');
          });
          setTimeout(() => row.classList.remove('shake'), 500);
          btn.disabled = true;
          btn.textContent = 'View Memorial';
          inputs[0].focus();
        }
      } catch {
        btn.disabled = false;
        btn.textContent = 'View Memorial';
      }
    }

    btn.addEventListener('click', submitPin);
  </script>
</body>
</html>`;
}
