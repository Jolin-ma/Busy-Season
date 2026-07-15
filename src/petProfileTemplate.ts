export interface PetProfileData {
  name:       string;
  species:    string;
  breed:      string;
  birthDate:  string;
  deathDate:  string;
  epitaph:    string;
  portraitUrl: string;
  timeline:  { year: number; title: string; description: string }[];
  gallery:   { url: string; caption?: string }[];
  memories:  { message: string; author: string; date: string }[];
}

function yearsWithUs(birth: string, death: string): number {
  const b = new Date(birth);
  const d = new Date(death);
  if (isNaN(b.getTime()) || isNaN(d.getTime())) return 0;
  return d.getFullYear() - b.getFullYear();
}

function renderTimeline(events: PetProfileData['timeline']): string {
  return events.map((e, i) => `
    <div class="relative flex gap-5 pb-10 last:pb-0 timeline-item" style="animation-delay:${i * 60}ms">
      <div class="flex flex-col items-center shrink-0 w-10">
        <div class="w-3 h-3 rounded-full bg-amber-400 border-2 border-white shadow-md ring-1 ring-amber-200 mt-1 z-10"></div>
        <div class="w-px flex-1 bg-stone-200 mt-1"></div>
      </div>
      <div class="pb-2 flex-1">
        <span class="inline-block text-[9px] font-bold tracking-[0.18em] uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mb-1.5">${e.year}</span>
        <h3 class="text-[0.9rem] font-semibold text-stone-800 leading-snug mb-1">${e.title}</h3>
        <p class="text-[0.83rem] text-stone-500 leading-relaxed">${e.description}</p>
      </div>
    </div>`).join('');
}

function renderGallery(items: PetProfileData['gallery']): string {
  return items.map((item, i) => `
    <button onclick="openLightbox(${i})"
      class="aspect-square rounded-2xl overflow-hidden bg-stone-100 shadow-sm active:scale-95 transition-transform">
      <img src="${item.url}" alt="${item.caption ?? ''}" loading="lazy"
           class="w-full h-full object-cover transition-opacity duration-500 opacity-0 ll-img" />
    </button>`).join('');
}

function renderMemories(memories: PetProfileData['memories']): string {
  return memories.map((m, i) => `
    <div class="bg-white rounded-2xl px-5 pt-5 pb-4 shadow-sm border border-stone-100 memory-card" style="animation-delay:${i * 80}ms">
      <div class="flex gap-3 mb-3">
        <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold shrink-0">
          ${m.author.charAt(0)}
        </div>
        <div>
          <p class="text-xs font-semibold text-stone-700">${m.author}</p>
          <p class="text-[10px] text-stone-400">${m.date}</p>
        </div>
      </div>
      <p class="text-[0.83rem] text-stone-600 leading-relaxed italic">&ldquo;${m.message}&rdquo;</p>
    </div>`).join('');
}

export function renderPetProfile(data: PetProfileData, shortId: string = 'demo'): string {
  const years      = yearsWithUs(data.birthDate, data.deathDate);
  const galleryJson = JSON.stringify(data.gallery.map(g => ({ url: g.url, caption: g.caption ?? '' })));
  const initCandles = 20 + Math.floor(Math.random() * 10);
  const initHearts  = 15 + Math.floor(Math.random() * 8);
  const initFlowers = 9  + Math.floor(Math.random() * 7);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#1c1917" />
  <title>${data.name} — LegacyLink</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            serif: ['Playfair Display', 'Georgia', 'serif'],
            sans:  ['Inter', 'system-ui', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    * { -webkit-tap-highlight-color: transparent; }

    .ll-img { transition: opacity 0.5s ease; }
    .ll-img.loaded { opacity: 1; }

    #sticky-hdr { transform: translateY(-100%); transition: transform 0.3s ease; }
    #sticky-hdr.visible { transform: translateY(0); }

    .hero-grain::after {
      content: '';
      position: absolute; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none; opacity: 0.5;
    }

    @keyframes flicker {
      0%,100% { text-shadow: 0 0 6px #fbbf24, 0 0 12px #f59e0b; }
      50%      { text-shadow: 0 0 10px #fbbf24, 0 0 20px #f59e0b, 0 0 4px #fde68a; }
    }
    .candle-lit { animation: flicker 1.8s ease-in-out infinite; }

    @keyframes heartPop {
      0%   { transform: scale(1); }
      40%  { transform: scale(1.45); }
      70%  { transform: scale(0.9); }
      100% { transform: scale(1); }
    }
    .heart-sent { animation: heartPop 0.4s ease forwards; }

    @keyframes flowerBloom {
      0%   { transform: scale(1) rotate(0deg); }
      35%  { transform: scale(1.5) rotate(-12deg); }
      65%  { transform: scale(1.2) rotate(8deg); }
      100% { transform: scale(1) rotate(0deg); }
    }
    .flower-laid { animation: flowerBloom 0.5s ease forwards; }

    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    .timeline-item { opacity: 0; animation: fadeUp 0.5s ease forwards; }
    .memory-card   { opacity: 0; animation: fadeUp 0.5s ease forwards; }

    #lightbox { display:none; }
    #lightbox.open { display:flex; }

    @keyframes ringPulse {
      0%   { box-shadow: 0 0 0 0 rgba(251,191,36,0.4); }
      70%  { box-shadow: 0 0 0 12px rgba(251,191,36,0); }
      100% { box-shadow: 0 0 0 0 rgba(251,191,36,0); }
    }
    #portrait-img { animation: ringPulse 2s ease-out 0.8s 1; }
  </style>
</head>
<body class="bg-stone-50 font-sans text-stone-800 antialiased min-h-screen">

  <!-- STICKY HEADER -->
  <header id="sticky-hdr" class="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-b border-stone-100 shadow-sm">
    <div class="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-1 ring-stone-200">
          <img src="${data.portraitUrl}" alt="" class="w-full h-full object-cover" />
        </div>
        <span class="font-serif text-sm font-semibold text-stone-800 truncate">${data.name}</span>
        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">${data.breed}</span>
      </div>
      <button onclick="openModal()"
        class="shrink-0 ml-3 px-3.5 py-2 bg-stone-900 text-white text-xs font-semibold rounded-full active:bg-stone-700 transition-colors">
        Share a Memory
      </button>
    </div>
  </header>

  <!-- HERO -->
  <section class="hero-grain relative bg-stone-900 text-white overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 opacity-90"></div>
    <div class="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-transparent to-transparent"></div>

    <div class="relative z-10 flex flex-col items-center text-center px-6 pt-14 pb-12">
      <div class="mb-7 relative">
        <div class="w-32 h-32 rounded-full overflow-hidden ring-2 ring-amber-400/60 ring-offset-4 ring-offset-stone-900 shadow-2xl">
          <img id="portrait-img" src="${data.portraitUrl}" alt="${data.name}" class="w-full h-full object-cover" />
        </div>
        <!-- Paw print badge -->
        <div class="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center shadow-md text-sm">
          🐾
        </div>
      </div>

      <span class="text-[10px] font-semibold tracking-[0.18em] uppercase text-amber-400/80 mb-2">${data.species} &middot; ${data.breed}</span>
      <h1 class="font-serif text-[2rem] font-semibold tracking-wide leading-tight mb-2">${data.name}</h1>
      <p class="text-stone-400 text-[0.7rem] tracking-[0.2em] uppercase mb-8">
        ${data.birthDate}&ensp;&middot;&ensp;${data.deathDate}
      </p>

      <!-- Paw print divider -->
      <div class="flex items-center gap-3 mb-7 w-full max-w-xs">
        <div class="flex-1 h-px bg-stone-700"></div>
        <span class="text-amber-400/70 text-sm">🐾</span>
        <div class="flex-1 h-px bg-stone-700"></div>
      </div>

      <blockquote class="font-serif italic text-stone-300 text-[1rem] max-w-[17rem] leading-relaxed mb-9">
        &ldquo;${data.epitaph}&rdquo;
      </blockquote>

      <!-- 2×2 action grid -->
      <div class="grid grid-cols-2 gap-3 w-full max-w-xs">
        <button id="candle-btn" onclick="lightCandle()"
          class="flex items-center justify-center gap-2 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 rounded-2xl text-amber-300 text-sm font-medium transition-colors active:scale-95">
          <span id="candle-flame" class="text-lg leading-none">🕯️</span>
          <span id="candle-label">Light a Candle</span>
        </button>
        <button id="heart-btn" onclick="sendHeart()"
          class="flex items-center justify-center gap-2 py-3 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 rounded-2xl text-rose-300 text-sm font-medium transition-colors active:scale-95">
          <span id="heart-icon" class="text-lg leading-none">🤍</span>
          <span id="heart-label">Send Heart</span>
        </button>
        <button id="flower-btn" onclick="layFlowers()"
          class="flex items-center justify-center gap-2 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded-2xl text-emerald-300 text-sm font-medium transition-colors active:scale-95">
          <span id="flower-icon" class="text-lg leading-none">🌸</span>
          <span id="flower-label">Lay Flowers</span>
        </button>
        <button onclick="shareProfile()"
          class="flex items-center justify-center gap-1.5 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-white text-sm font-medium transition-colors active:scale-95">
          <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
          </svg>
          Share
        </button>
      </div>

      <p class="text-stone-500 text-[10px] mt-3 tracking-wide">
        <span id="candle-count">${initCandles}</span> candles&ensp;&middot;&ensp;<span id="heart-count">${initHearts}</span> hearts&ensp;&middot;&ensp;<span id="flower-count">${initFlowers}</span> flowers
      </p>
    </div>
  </section>

  <!-- STATS BAR -->
  <div class="bg-white border-b border-stone-100">
    <div class="max-w-lg mx-auto grid grid-cols-4 divide-x divide-stone-100">
      ${years > 0 ? `
      <div class="flex flex-col items-center py-4">
        <span class="font-serif text-xl font-semibold text-stone-900">${years}</span>
        <span class="text-[9px] font-semibold uppercase tracking-widest text-stone-400 mt-0.5">Years</span>
      </div>` : ''}
      <div class="flex flex-col items-center py-4">
        <span class="font-serif text-xl font-semibold text-stone-900">${data.timeline.length}</span>
        <span class="text-[9px] font-semibold uppercase tracking-widest text-stone-400 mt-0.5">Adventures</span>
      </div>
      <div class="flex flex-col items-center py-4">
        <span class="font-serif text-xl font-semibold text-stone-900">${data.memories.length}</span>
        <span class="text-[9px] font-semibold uppercase tracking-widest text-stone-400 mt-0.5">Memories</span>
      </div>
      <div class="flex flex-col items-center py-4">
        <span class="font-serif text-xl font-semibold text-stone-900">${data.gallery.length}</span>
        <span class="text-[9px] font-semibold uppercase tracking-widest text-stone-400 mt-0.5">Photos</span>
      </div>
    </div>
  </div>

  <!-- TIMELINE -->
  <section class="max-w-lg mx-auto px-5 py-10">
    <h2 class="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-stone-400 mb-8">Adventures &amp; Milestones</h2>
    <div class="relative">
      ${renderTimeline(data.timeline)}
    </div>
  </section>

  <!-- GALLERY -->
  ${data.gallery.length > 0 ? `
  <section class="bg-white border-t border-b border-stone-100 py-10">
    <div class="max-w-lg mx-auto px-5">
      <h2 class="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-stone-400 mb-6">Photo Memories</h2>
      <div class="grid grid-cols-3 gap-2">
        ${renderGallery(data.gallery)}
      </div>
    </div>
  </section>` : ''}

  <!-- MEMORIES -->
  ${data.memories.length > 0 ? `
  <section class="max-w-lg mx-auto px-5 py-10">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-stone-400">Memories Shared</h2>
      <button onclick="openModal()"
        class="text-xs font-semibold text-stone-600 border border-stone-300 rounded-full px-3.5 py-1.5 hover:bg-stone-100 active:bg-stone-200 transition-colors">
        + Share a Memory
      </button>
    </div>
    <div class="space-y-4">
      ${renderMemories(data.memories)}
    </div>
  </section>` : ''}

  <!-- FOOTER -->
  <footer class="border-t border-stone-100 bg-white py-8 mt-4">
    <div class="max-w-lg mx-auto px-5 text-center">
      <p class="text-[10px] text-stone-400 tracking-widest uppercase mb-1">Preserved with</p>
      <p class="font-serif text-sm text-stone-600 font-semibold">LegacyLink</p>
      <p class="text-[10px] text-stone-300 mt-3">Every companion deserves to be remembered.</p>
    </div>
  </footer>

  <!-- LIGHTBOX -->
  <div id="lightbox" class="fixed inset-0 z-50 bg-black/90 items-center justify-center p-4">
    <button onclick="closeLightbox()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white text-lg">✕</button>
    <button onclick="prevSlide()" class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white">‹</button>
    <button onclick="nextSlide()" class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white">›</button>
    <div class="max-w-sm w-full mx-auto">
      <img id="lb-img" src="" alt="" class="w-full rounded-2xl object-contain max-h-[70vh]" />
      <p id="lb-cap" class="text-white/60 text-xs text-center mt-3"></p>
    </div>
  </div>

  <!-- SHARE MEMORY MODAL -->
  <div id="memory-modal" class="hidden fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4">
    <div class="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-serif text-lg font-semibold text-stone-800">Share a Memory</h3>
        <button onclick="closeModal()" class="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-sm hover:bg-stone-200">✕</button>
      </div>
      <form onsubmit="handleMemorySubmit(event)" class="space-y-3">
        <input id="memory-author" type="text" placeholder="Your name" required
          class="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 placeholder:text-stone-300" />
        <input id="memory-email" type="email" placeholder="Email (optional)"
          class="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 placeholder:text-stone-300" />
        <textarea id="memory-text" rows="4" placeholder="Share a memory of ${data.name}…" required
          class="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 placeholder:text-stone-300 resize-none"></textarea>
        <p id="form-error" class="hidden text-xs text-rose-500">Please fill in your name and memory.</p>
        <button type="submit"
          class="w-full bg-stone-900 text-white font-semibold text-sm py-3 rounded-xl hover:bg-stone-700 active:bg-stone-800 transition-colors">
          Submit Memory
        </button>
      </form>
    </div>
  </div>

  <!-- TOAST MESSAGES -->
  <div id="copy-toast"    class="hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg z-50">Link copied!</div>
  <div id="memory-toast"  class="hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg z-50">Memory submitted — thank you 🐾</div>
  <div id="error-toast"   class="hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-rose-600  text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg z-50">Something went wrong. Try again.</div>

  <script>
    // Lazy-load images
    document.querySelectorAll('.ll-img').forEach(function(img) {
      if (img.complete) img.classList.add('loaded');
      else img.addEventListener('load', function() { img.classList.add('loaded'); });
    });

    // Sticky header
    var hdr = document.getElementById('sticky-hdr');
    window.addEventListener('scroll', function() {
      if (window.scrollY > 280) hdr.classList.add('visible');
      else hdr.classList.remove('visible');
    }, { passive: true });

    // Candle
    var candleLit = false;
    var candleCount = ${initCandles};
    function lightCandle() {
      if (candleLit) return;
      candleLit = true;
      candleCount++;
      document.getElementById('candle-count').textContent = candleCount;
      document.getElementById('candle-flame').classList.add('candle-lit');
      document.getElementById('candle-label').textContent = 'Candle Lit';
      var btn = document.getElementById('candle-btn');
      btn.classList.replace('bg-amber-500/20', 'bg-amber-500/40');
      btn.classList.replace('border-amber-400/30', 'border-amber-400/60');
    }

    // Heart
    var heartSent = false;
    var heartCount = ${initHearts};
    function sendHeart() {
      if (heartSent) return;
      heartSent = true;
      heartCount++;
      document.getElementById('heart-count').textContent = heartCount;
      var icon = document.getElementById('heart-icon');
      icon.textContent = '❤️';
      icon.classList.add('heart-sent');
      document.getElementById('heart-label').textContent = 'Heart Sent';
      var btn = document.getElementById('heart-btn');
      btn.classList.replace('bg-rose-500/20', 'bg-rose-500/40');
      btn.classList.replace('border-rose-400/30', 'border-rose-400/60');
    }

    // Flowers
    var flowersLaid = false;
    var flowerCount = ${initFlowers};
    function layFlowers() {
      if (flowersLaid) return;
      flowersLaid = true;
      flowerCount++;
      document.getElementById('flower-count').textContent = flowerCount;
      var icon = document.getElementById('flower-icon');
      icon.textContent = '💐';
      icon.classList.add('flower-laid');
      document.getElementById('flower-label').textContent = 'Flowers Laid';
      var btn = document.getElementById('flower-btn');
      btn.classList.replace('bg-emerald-500/20', 'bg-emerald-500/40');
      btn.classList.replace('border-emerald-400/30', 'border-emerald-400/60');
    }

    // Share
    function shareProfile() {
      if (navigator.share) {
        navigator.share({ title: '${data.name} — LegacyLink', text: 'In loving memory of ${data.name}', url: window.location.href }).catch(function() {});
      } else {
        navigator.clipboard.writeText(window.location.href).then(function() { showToast('copy-toast'); });
      }
    }

    // Modal
    function openModal()  { document.getElementById('memory-modal').classList.remove('hidden'); }
    function closeModal() { document.getElementById('memory-modal').classList.add('hidden'); }
    document.getElementById('memory-modal').addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });
    ['memory-author','memory-text'].forEach(function(id) {
      document.getElementById(id).addEventListener('input', function() {
        this.classList.remove('border-rose-300');
        document.getElementById('form-error').classList.add('hidden');
      });
    });

    async function handleMemorySubmit(e) {
      e.preventDefault();
      var author = document.getElementById('memory-author').value.trim();
      var email  = document.getElementById('memory-email').value.trim();
      var text   = document.getElementById('memory-text').value.trim();
      if (!author || !text) {
        if (!author) document.getElementById('memory-author').classList.add('border-rose-300');
        if (!text)   document.getElementById('memory-text').classList.add('border-rose-300');
        document.getElementById('form-error').classList.remove('hidden');
        return;
      }
      try {
        var res = await fetch(${JSON.stringify('/guestbook/' + shortId).replace(/</g, '\\u003c')}, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author_name: author, message: text, author_email: email || undefined }),
        });
        closeModal();
        showToast(res.ok ? 'memory-toast' : 'error-toast');
      } catch {
        closeModal();
        showToast('error-toast');
      }
    }

    // Toast
    function showToast(id) {
      var el = document.getElementById(id);
      el.classList.remove('hidden');
      setTimeout(function() { el.classList.add('hidden'); }, 3000);
    }

    // Lightbox
    var gallery = ${galleryJson};
    var currentSlide = 0;
    function openLightbox(i) {
      currentSlide = i;
      updateLightbox();
      document.getElementById('lightbox').classList.add('open');
    }
    function closeLightbox() { document.getElementById('lightbox').classList.remove('open'); }
    function prevSlide() { currentSlide = (currentSlide - 1 + gallery.length) % gallery.length; updateLightbox(); }
    function nextSlide() { currentSlide = (currentSlide + 1) % gallery.length; updateLightbox(); }
    function updateLightbox() {
      document.getElementById('lb-img').src = gallery[currentSlide].url;
      document.getElementById('lb-cap').textContent = gallery[currentSlide].caption;
    }
    document.getElementById('lightbox').addEventListener('click', function(e) {
      if (e.target === this) closeLightbox();
    });
  </script>
</body>
</html>`;
}
