export function renderPinGate(shortId: string, wrongPin: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#1c1917" />
  <title>Private Memorial — LegacyLink</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: { extend: { fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      }}}
    }
  </script>
  <style>
    * { -webkit-tap-highlight-color: transparent; }

    @keyframes shake {
      0%,100% { transform: translateX(0); }
      15%,45%,75% { transform: translateX(-8px); }
      30%,60%,90% { transform: translateX(8px); }
    }
    .shake { animation: shake 0.5s ease; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp 0.6s ease forwards; }
    .fade-up-2 { animation: fadeUp 0.6s 0.1s ease both; }
    .fade-up-3 { animation: fadeUp 0.6s 0.2s ease both; }

    @keyframes pulse-glow {
      0%,100% { box-shadow: 0 0 0 0 rgba(251,191,36,0.3); }
      50%      { box-shadow: 0 0 0 8px rgba(251,191,36,0); }
    }
    .lock-pulse { animation: pulse-glow 2.5s ease-in-out infinite; }

    /* PIN box active glow */
    .pin-input:focus {
      border-color: #fbbf24 !important;
      box-shadow: 0 0 0 3px rgba(251,191,36,0.15);
      background: rgba(255,255,255,0.06) !important;
      color: white !important;
    }
    .pin-input { caret-color: #fbbf24; }
    .pin-input.filled { border-color: rgba(255,255,255,0.3) !important; }
    .pin-input.error  { border-color: #f87171 !important; box-shadow: 0 0 0 3px rgba(248,113,113,0.15); }
  </style>
</head>
<body class="min-h-screen font-sans antialiased flex flex-col" style="background:#1c1917;">

  <!-- ── Top bar ─────────────────────────────────────────────────────────────── -->
  <div class="flex items-center justify-center pt-10 pb-0 fade-up">
    <div class="flex items-center gap-2">
      <div class="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
      <span style="font-family:'Playfair Display',serif; font-size:0.8rem; color:rgba(255,255,255,0.4); letter-spacing:0.1em;">
        LegacyLink
      </span>
      <div class="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
    </div>
  </div>

  <!-- ── Main content ────────────────────────────────────────────────────────── -->
  <div class="flex-1 flex flex-col items-center justify-center px-8 py-10">
    <div class="w-full max-w-xs">

      <!-- Lock icon -->
      <div class="flex justify-center mb-8 fade-up">
        <div class="lock-pulse w-20 h-20 rounded-3xl flex items-center justify-center"
             style="background:rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.25);">
          <svg viewBox="0 0 24 24" fill="none" class="w-9 h-9">
            <rect x="3" y="11" width="18" height="11" rx="2.5" stroke="#fbbf24" stroke-width="1.6"/>
            <path d="M7 11V7a5 5 0 0110 0v4" stroke="#fbbf24" stroke-width="1.6" stroke-linecap="round"/>
            <circle cx="12" cy="16" r="1.5" fill="#fbbf24"/>
          </svg>
        </div>
      </div>

      <!-- Heading -->
      <div class="text-center mb-2 fade-up-2">
        <h1 style="font-family:'Playfair Display',serif; font-size:1.6rem; font-weight:600; color:white; line-height:1.2;">
          Private Memorial
        </h1>
      </div>
      <p class="text-center text-sm leading-relaxed mb-10 fade-up-2" style="color:rgba(255,255,255,0.4);">
        This memorial is kept private by the family.<br/>
        Enter the 4-digit PIN to view.
      </p>

      <!-- PIN inputs -->
      <div id="pin-row" class="flex gap-3 justify-center mb-3 fade-up-3">
        ${[0,1,2,3].map(i => `
        <input
          id="p${i}"
          type="tel"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="1"
          autocomplete="off"
          class="pin-input${wrongPin ? ' error' : ''} w-16 h-16 rounded-2xl text-center text-2xl font-bold outline-none transition-all"
          style="background:rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.12); color:rgba(255,255,255,0.9);"
        />`).join('')}
      </div>

      <!-- Error message -->
      <div id="error-msg" class="${wrongPin ? '' : 'hidden'} text-center mb-5">
        <p class="text-xs font-medium" style="color:#f87171;">Incorrect PIN. Please try again.</p>
      </div>
      ${wrongPin ? '' : '<div class="mb-5"></div>'}

      <!-- Submit button -->
      <button
        id="submit-btn"
        disabled
        class="w-full py-4 rounded-2xl text-sm font-semibold transition-all disabled:cursor-not-allowed fade-up-3"
        style="background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.3); border:1px solid rgba(255,255,255,0.08);"
      >
        View Memorial
      </button>

      <!-- Hint -->
      <p class="text-center mt-5 fade-up-3" style="font-size:0.65rem; color:rgba(255,255,255,0.2); letter-spacing:0.05em;">
        PIN provided by the family · Not the account password
      </p>
    </div>
  </div>

  <!-- ── Footer ──────────────────────────────────────────────────────────────── -->
  <div class="text-center pb-10 fade-up" style="font-size:0.6rem; color:rgba(255,255,255,0.15); letter-spacing:0.12em; text-transform:uppercase;">
    Protected Memorial Profile
  </div>

  <script>
    var inputs  = [0,1,2,3].map(function(i) { return document.getElementById('p' + i); });
    var btn     = document.getElementById('submit-btn');
    var errMsg  = document.getElementById('error-msg');
    var pinRow  = document.getElementById('pin-row');

    inputs[0].focus();

    function getPin() { return inputs.map(function(i) { return i.value; }).join(''); }

    function syncBtn() {
      var full = getPin().length === 4;
      btn.disabled = !full;
      if (full) {
        btn.style.background = '#fbbf24';
        btn.style.color = '#1c1917';
        btn.style.borderColor = 'transparent';
        btn.style.fontWeight = '700';
      } else {
        btn.style.background = 'rgba(255,255,255,0.08)';
        btn.style.color = 'rgba(255,255,255,0.3)';
        btn.style.borderColor = 'rgba(255,255,255,0.08)';
      }
    }

    inputs.forEach(function(input, i) {
      input.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\\D/g, '').slice(0, 1);
        if (e.target.value) {
          e.target.classList.add('filled');
          if (i < 3) inputs[i + 1].focus();
        }
        syncBtn();
      });
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && !e.target.value && i > 0) {
          inputs[i - 1].value = '';
          inputs[i - 1].classList.remove('filled');
          inputs[i - 1].focus();
          syncBtn();
        }
        if (e.key === 'Enter' && getPin().length === 4) submitPin();
      });
      // Paste support — spread digits across boxes
      input.addEventListener('paste', function(e) {
        e.preventDefault();
        var digits = (e.clipboardData.getData('text') || '').replace(/\\D/g, '').slice(0, 4);
        digits.split('').forEach(function(d, j) {
          if (inputs[j]) { inputs[j].value = d; inputs[j].classList.add('filled'); }
        });
        var next = Math.min(digits.length, 3);
        inputs[next].focus();
        syncBtn();
      });
    });

    async function submitPin() {
      var pin = getPin();
      if (pin.length !== 4) return;

      btn.disabled = true;
      btn.style.background = 'rgba(251,191,36,0.5)';
      btn.textContent = 'Checking…';

      try {
        var res = await fetch('/p/${shortId}/unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: pin }),
        });

        if (res.ok) {
          var data = await res.json();
          btn.textContent = '✓ Opening…';
          window.location.href = data.redirectUrl;
        } else {
          // Wrong PIN
          errMsg.classList.remove('hidden');
          pinRow.classList.add('shake');
          inputs.forEach(function(inp) {
            inp.value = '';
            inp.classList.remove('filled');
            inp.classList.add('error');
          });
          setTimeout(function() { pinRow.classList.remove('shake'); }, 550);
          syncBtn();
          btn.textContent = 'View Memorial';
          inputs[0].focus();
        }
      } catch (_) {
        btn.disabled = false;
        btn.textContent = 'View Memorial';
        syncBtn();
      }
    }

    btn.addEventListener('click', submitPin);
  </script>
</body>
</html>`;
}
