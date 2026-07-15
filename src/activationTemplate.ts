// fullName is user-supplied — escape it for the HTML context.
function esc(v: string): string {
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderActivationPage(shortId: string, fullName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Activate Memorial — LegacyLink</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: { extend: { fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      } } }
    }
  </script>
</head>
<body class="min-h-screen bg-stone-50 font-sans flex flex-col items-center justify-center px-6 py-12 antialiased">

  <!-- ── IDLE ─────────────────────────────────────────────────────────────── -->
  <div id="state-idle" class="w-full max-w-sm text-center">
    <div class="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-7 shadow-lg">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.6" class="w-7 h-7">
        <circle cx="12" cy="10" r="3.5"/>
        <path d="M12 3C8.13 3 5 6.13 5 10c0 5.25 7 12 7 12s7-6.75 7-12c0-3.87-3.13-7-7-7z"/>
      </svg>
    </div>

    <h1 class="text-xl font-semibold text-stone-800 mb-1" style="font-family:'Playfair Display',serif">
      Activate Gravesite Location
    </h1>
    <p class="text-stone-500 text-sm mb-4">${esc(fullName)}</p>
    <p class="text-stone-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
      Stand directly at the grave marker, then tap <strong class="text-stone-600">Pin This Location</strong>.
      Your device GPS will capture the exact coordinates — no typing required.
    </p>

    <button id="btn-capture"
      class="w-full bg-stone-900 text-white py-4 rounded-2xl text-sm font-semibold
             hover:bg-stone-700 transition-colors flex items-center justify-center gap-2">
      <svg viewBox="0 0 20 20" fill="none" class="w-4 h-4">
        <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/>
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      Pin This Location
    </button>
    <p class="text-xs text-stone-300 mt-4">Requires location permission &middot; best results in open sky</p>

    <div id="error-msg" class="mt-5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 hidden"></div>
  </div>

  <!-- ── ACQUIRING ─────────────────────────────────────────────────────────── -->
  <div id="state-acquiring" class="w-full max-w-sm text-center hidden">
    <div class="w-16 h-16 rounded-full border-4 border-stone-200 border-t-stone-900 animate-spin mx-auto mb-7"></div>
    <h2 class="text-lg font-semibold text-stone-800 mb-2">Acquiring GPS signal&hellip;</h2>
    <p class="text-stone-400 text-sm">Stay still for best accuracy. This usually takes 5&ndash;15 seconds.</p>
  </div>

  <!-- ── CONFIRMING ─────────────────────────────────────────────────────────── -->
  <div id="state-confirming" class="w-full max-w-sm hidden">
    <h2 class="text-base font-semibold text-stone-800 mb-1 text-center">Confirm Location</h2>
    <p class="text-xs text-stone-400 text-center mb-5">Review the coordinates before saving permanently.</p>

    <div class="bg-white border border-stone-100 rounded-2xl shadow-sm p-5 mb-4 space-y-3">
      <div class="flex justify-between text-sm">
        <span class="text-stone-500">Latitude</span>
        <span id="coord-lat" class="font-mono font-semibold text-stone-800">&mdash;</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-stone-500">Longitude</span>
        <span id="coord-lng" class="font-mono font-semibold text-stone-800">&mdash;</span>
      </div>
      <div class="flex justify-between text-sm items-center">
        <span class="text-stone-500">GPS Accuracy</span>
        <span id="coord-accuracy" class="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">&mdash;</span>
      </div>
    </div>

    <div id="accuracy-warning"
      class="hidden bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700 mb-4">
      Signal quality is low. For a more precise pin, move to open sky and tap Retry.
    </div>

    <div class="flex gap-2">
      <button id="btn-confirm"
        class="flex-1 bg-stone-900 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-stone-700 transition-colors">
        Save Pin
      </button>
      <button id="btn-retry"
        class="text-sm text-stone-500 border border-stone-200 px-4 py-3.5 rounded-xl hover:bg-stone-50 transition-colors">
        Retry
      </button>
    </div>
  </div>

  <!-- ── SAVING ─────────────────────────────────────────────────────────────── -->
  <div id="state-saving" class="w-full max-w-sm text-center hidden">
    <div class="w-16 h-16 rounded-full border-4 border-stone-200 border-t-stone-900 animate-spin mx-auto mb-7"></div>
    <p class="text-stone-500 text-sm">Saving location&hellip;</p>
  </div>

  <!-- ── SUCCESS ─────────────────────────────────────────────────────────────── -->
  <div id="state-success" class="w-full max-w-sm text-center hidden">
    <div class="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-7">
      <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.2" class="w-8 h-8">
        <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h2 class="text-lg font-semibold text-stone-800 mb-2" style="font-family:'Playfair Display',serif">
      Location Pinned
    </h2>
    <p class="text-stone-400 text-sm leading-relaxed mb-3 max-w-xs mx-auto">
      The gravesite has been saved. Visitors who scan this QR code will now receive
      walking directions to this exact location.
    </p>
    <p class="text-xs text-stone-300">Redirecting to memorial profile&hellip;</p>
  </div>

  <p class="text-[10px] text-stone-300 mt-10 absolute bottom-6">LegacyLink &mdash; Memorial Location Setup</p>

  <script>
    var shortId = ${JSON.stringify(shortId).replace(/</g, '\\u003c')};
    var draft   = null;

    function show(state) {
      ['idle', 'acquiring', 'confirming', 'saving', 'success'].forEach(function(s) {
        document.getElementById('state-' + s).classList.toggle('hidden', s !== state);
      });
    }

    function showError(msg) {
      var el = document.getElementById('error-msg');
      el.textContent = msg;
      el.classList.remove('hidden');
    }

    function hideError() {
      document.getElementById('error-msg').classList.add('hidden');
    }

    function updateAccuracyBadge(metres) {
      var el = document.getElementById('coord-accuracy');
      if (!metres) { el.textContent = 'Unknown'; return; }
      var quality = metres <= 5 ? 'Excellent' : metres <= 15 ? 'Good' : metres <= 30 ? 'Fair' : 'Poor';
      var colourMap = {
        Excellent: 'bg-green-100 text-green-700',
        Good:      'bg-blue-100 text-blue-700',
        Fair:      'bg-amber-100 text-amber-700',
        Poor:      'bg-red-100 text-red-600',
      };
      el.className   = 'text-xs font-semibold px-2 py-0.5 rounded-full ' + colourMap[quality];
      el.textContent = '±' + Math.round(metres) + 'm — ' + quality;
    }

    function capture() {
      if (!navigator.geolocation) {
        showError('Geolocation is not supported by this browser or device.');
        return;
      }
      hideError();
      show('acquiring');
      navigator.geolocation.getCurrentPosition(
        function(pos) {
          draft = {
            latitude:    pos.coords.latitude,
            longitude:   pos.coords.longitude,
            gpsAccuracy: pos.coords.accuracy != null ? pos.coords.accuracy : null,
          };
          document.getElementById('coord-lat').textContent = draft.latitude.toFixed(7);
          document.getElementById('coord-lng').textContent = draft.longitude.toFixed(7);
          updateAccuracyBadge(draft.gpsAccuracy);
          var warn = document.getElementById('accuracy-warning');
          warn.classList.toggle('hidden', !draft.gpsAccuracy || draft.gpsAccuracy <= 30);
          show('confirming');
        },
        function(err) {
          var msgs = {
            1: 'Location permission denied. Allow location access in your browser settings.',
            2: 'Position unavailable. Try moving to open sky.',
            3: 'GPS timed out. Try again outdoors with a clear view of the sky.',
          };
          show('idle');
          showError(msgs[err.code] || 'Unable to retrieve location.');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }

    async function confirmPin() {
      if (!draft) return;
      show('saving');
      try {
        var res = await fetch('/api/v1/premium/navigation/activate', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            activationToken: shortId,
            latitude:        draft.latitude,
            longitude:       draft.longitude,
            gpsAccuracy:     draft.gpsAccuracy,
          }),
        });
        if (!res.ok) throw new Error('Server error');
        var data = await res.json();
        show('success');
        setTimeout(function() {
          window.location.href = '/profile/' + data.profileId;
        }, 2500);
      } catch (e) {
        show('idle');
        showError('Failed to save location. Please try again.');
      }
    }

    document.getElementById('btn-capture').addEventListener('click', capture);
    document.getElementById('btn-retry').addEventListener('click', capture);
    document.getElementById('btn-confirm').addEventListener('click', confirmPin);
  </script>
</body>
</html>`;
}
