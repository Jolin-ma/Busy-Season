export interface ProfileData {
  name: string;
  birthDate: string;
  deathDate: string;
  epitaph: string;
  portraitUrl: string;
  timeline: { year: number; title: string; description: string }[];
  gallery: { url: string; caption?: string }[];
  memories: { message: string; author: string; date: string }[];
}

function yearsLived(birth: string, death: string): number {
  const b = new Date(birth);
  const d = new Date(death);
  if (isNaN(b.getTime()) || isNaN(d.getTime())) return 0;
  return d.getFullYear() - b.getFullYear();
}

function renderTimeline(events: ProfileData['timeline']): string {
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

function renderGallery(items: ProfileData['gallery']): string {
  return items.map((item, i) => `
    <button onclick="openLightbox(${i})"
      class="aspect-square rounded-2xl overflow-hidden bg-stone-100 shadow-sm active:scale-95 transition-transform">
      <img src="${item.url}" alt="${item.caption ?? ''}" loading="lazy"
           class="w-full h-full object-cover transition-opacity duration-500 opacity-0 ll-img" />
    </button>`).join('');
}

function renderMemories(memories: ProfileData['memories']): string {
  return memories.map((m, i) => `
    <div class="bg-white rounded-2xl px-5 pt-5 pb-4 shadow-sm border border-stone-100 memory-card" style="animation-delay:${i * 80}ms">
      <div class="flex gap-3 mb-3">
        <div class="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 text-xs font-bold shrink-0">
          ${m.author.charAt(0)}
        </div>
        <div>
          <p class="text-xs font-semibold text-stone-700 leading-none mb-0.5">${m.author}</p>
          <p class="text-[10px] text-stone-400">${m.date}</p>
        </div>
      </div>
      <p class="text-[0.85rem] text-stone-600 leading-relaxed italic">&ldquo;${m.message}&rdquo;</p>
    </div>`).join('');
}

export function renderProfile(data: ProfileData, profileId: string = 'demo'): string {
  const age = yearsLived(data.birthDate, data.deathDate);
  const galleryJson = JSON.stringify(data.gallery.map(g => ({ url: g.url, caption: g.caption ?? '' })));
  const initCandles = 24 + Math.floor(Math.random() * 12);

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
      </div>
      <button onclick="openModal()"
        class="shrink-0 ml-3 px-3.5 py-2 bg-stone-900 text-white text-xs font-semibold rounded-full active:bg-stone-700 transition-colors">
        Leave a Memory
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
        <div class="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
          <svg viewBox="0 0 20 20" fill="white" class="w-3.5 h-3.5">
            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>

      <h1 class="font-serif text-[2rem] font-semibold tracking-wide leading-tight mb-2">${data.name}</h1>
      <p class="text-stone-400 text-[0.7rem] tracking-[0.2em] uppercase mb-8">
        ${data.birthDate}&ensp;&middot;&ensp;${data.deathDate}
      </p>

      <div class="flex items-center gap-3 mb-7 w-full max-w-xs">
        <div class="flex-1 h-px bg-stone-700"></div>
        <svg viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5 text-amber-400/70 shrink-0">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
        <div class="flex-1 h-px bg-stone-700"></div>
      </div>

      <blockquote class="font-serif italic text-stone-300 text-[1rem] max-w-[17rem] leading-relaxed mb-9">
        &ldquo;${data.epitaph}&rdquo;
      </blockquote>

      <div class="flex gap-3 w-full max-w-xs">
        <button id="candle-btn" onclick="lightCandle()"
          class="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 rounded-2xl text-amber-300 text-sm font-medium transition-colors active:scale-95">
          <span id="candle-flame" class="text-lg leading-none">🕯️</span>
          <span id="candle-label">Light a Candle</span>
        </button>
        <button onclick="shareProfile()"
          class="flex items-center justify-center gap-1.5 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-white text-sm font-medium transition-colors active:scale-95">
          <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
          </svg>
          Share
        </button>
      </div>

      <p id="candle-count-label" class="text-stone-500 text-[10px] mt-3 tracking-wide">
        <span id="candle-count">${initCandles}</span> candles lit in memory
      </p>
    </div>
  </section>

  <!-- STATS BAR -->
  <div class="bg-white border-b border-stone-100">
    <div class="max-w-lg mx-auto grid grid-cols-4 divide-x divide-stone-100">
      ${age > 0 ? `
      <div class="flex flex-col items-center py-4">
        <span class="font-serif text-xl font-semibold text-stone-900">${age}</span>
        <span class="text-[9px] font-semibold uppercase tracking-widest text-stone-400 mt-0.5">Years</span>
      </div>` : ''}
      <div class="flex flex-col items-center py-4">
        <span class="font-serif text-xl font-semibold text-stone-900">${data.timeline.length}</span>
        <span class="text-[9px] font-semibold uppercase tracking-widest text-stone-400 mt-0.5">Life Events</span>
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
  <section class="px-5 pt-10 pb-8 max-w-lg mx-auto">
    <h2 class="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-7">Life Journey</h2>
    <div class="relative">
      ${renderTimeline(data.timeline)}
    </div>
  </section>

  <!-- GALLERY -->
  <section class="px-5 pb-10 max-w-lg mx-auto">
    <h2 class="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-5">Photos &amp; Memories</h2>
    <div class="grid grid-cols-3 gap-2">
      ${renderGallery(data.gallery)}
    </div>
  </section>

  <!-- MEMORY WALL -->
  <section class="px-5 pb-10 max-w-lg mx-auto">
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">Memory Wall</h2>
      <span class="text-[9px] text-stone-400">${data.memories.length} memories</span>
    </div>
    <div class="space-y-3">
      ${renderMemories(data.memories)}
    </div>
    <button onclick="openModal()"
      class="mt-6 w-full py-4 border-2 border-dashed border-stone-200 rounded-2xl text-stone-500 text-sm font-medium hover:border-stone-400 hover:text-stone-700 active:bg-stone-100 transition-colors flex items-center justify-center gap-2">
      <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-stone-400">
        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
      </svg>
      Leave a Memory
    </button>
  </section>

  <!-- FOOTER -->
  <footer class="bg-stone-900 text-white px-6 py-10 text-center mt-4">
    <div class="max-w-xs mx-auto">
      <p class="font-serif italic text-stone-400 text-sm mb-6 leading-relaxed">
        &ldquo;In loving memory — their story lives on.&rdquo;
      </p>
      <div class="border-t border-stone-700 pt-6">
        <p class="text-[9px] font-semibold tracking-[0.2em] uppercase text-stone-500 mb-1">Preserved by</p>
        <p class="font-serif text-base font-semibold text-stone-300">LegacyLink</p>
        <p class="text-[9px] text-stone-600 mt-3 tracking-wide">Honoring lives. Forever.</p>
      </div>
    </div>
  </footer>

  <!-- MEMORY MODAL -->
  <div id="memory-modal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
    <div class="bg-white w-full max-w-lg rounded-t-3xl px-6 pt-6 pb-10 shadow-2xl">
      <div class="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-5"></div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="font-serif text-xl text-stone-800">Share a Memory</h3>
          <p class="text-xs text-stone-400 mt-0.5">Reviewed by family before appearing publicly</p>
        </div>
        <button onclick="closeModal()"
          class="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors">
          <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
      <form id="memory-form" onsubmit="handleMemorySubmit(event)" novalidate class="space-y-3">
        <input type="text" id="memory-author" placeholder="Your name *" autocomplete="name"
               class="w-full border border-stone-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 bg-stone-50 placeholder:text-stone-400" />
        <input type="email" id="memory-email" placeholder="Email (optional — never public)" autocomplete="email"
               class="w-full border border-stone-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 bg-stone-50 placeholder:text-stone-400" />
        <textarea id="memory-text" placeholder="Write a memory or tribute… *" rows="4"
                  class="w-full border border-stone-200 rounded-xl px-4 py-3.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-stone-300 bg-stone-50 placeholder:text-stone-400"></textarea>
        <p id="form-error" class="hidden text-xs text-rose-500 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">Please enter your name and a memory.</p>
        <button type="submit" id="memory-submit-btn"
                class="w-full bg-stone-900 text-white py-4 rounded-2xl text-sm font-semibold hover:bg-stone-800 active:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          Submit Memory
        </button>
      </form>
    </div>
  </div>

  <!-- TOAST: memory submitted -->
  <div id="submit-toast" class="hidden fixed bottom-6 inset-x-4 z-50 pointer-events-none">
    <div class="bg-stone-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm mx-auto">
      <svg viewBox="0 0 16 16" fill="none" class="w-4 h-4 text-emerald-400 shrink-0">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/>
        <path d="M5 8l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div>
        <p class="font-semibold text-sm leading-none mb-0.5">Memory submitted</p>
        <p class="text-stone-400 text-xs">Awaiting family review</p>
      </div>
    </div>
  </div>

  <!-- TOAST: link copied -->
  <div id="copy-toast" class="hidden fixed bottom-6 inset-x-4 z-50 pointer-events-none">
    <div class="bg-stone-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm mx-auto">
      <span class="text-base">🔗</span>
      <p class="text-sm font-medium">Link copied to clipboard</p>
    </div>
  </div>

  <!-- LIGHTBOX -->
  <div id="lightbox" class="fixed inset-0 bg-black z-50 flex-col items-center justify-center">
    <button onclick="closeLightbox()" class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/10 rounded-full text-white">
      <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
      </svg>
    </button>
    <button onclick="prevPhoto()" class="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/10 rounded-full text-white">
      <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
    </button>
    <button onclick="nextPhoto()" class="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/10 rounded-full text-white">
      <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
    </button>
    <img id="lightbox-img" src="" alt="" class="max-h-[80vh] max-w-full object-contain px-14" />
    <p id="lightbox-caption" class="text-white/60 text-sm text-center mt-4 px-6"></p>
    <p id="lightbox-counter" class="text-white/30 text-xs text-center mt-1"></p>
  </div>

  <script>
    // Image fade-in
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
      var btn = document.getElementById('memory-submit-btn');
      btn.disabled = true;
      btn.innerHTML = '<svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>&nbsp;Submitting…';
      try {
        await fetch('/guestbook/${profileId}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author_name: author, message: text, author_email: email || undefined }),
        });
      } catch (_) {}
      closeModal();
      document.getElementById('memory-form').reset();
      btn.disabled = false;
      btn.textContent = 'Submit Memory';
      showToast('submit-toast');
    }

    // Toast
    var toastTimers = {};
    function showToast(id) {
      var el = document.getElementById(id);
      el.classList.remove('hidden');
      clearTimeout(toastTimers[id]);
      toastTimers[id] = setTimeout(function() { el.classList.add('hidden'); }, 3500);
    }

    // Lightbox
    var gallery = ${galleryJson};
    var lbIndex = 0;
    function openLightbox(i) {
      lbIndex = i; updateLightbox();
      document.getElementById('lightbox').classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      document.getElementById('lightbox').classList.remove('open');
      document.body.style.overflow = '';
    }
    function prevPhoto() { lbIndex = (lbIndex - 1 + gallery.length) % gallery.length; updateLightbox(); }
    function nextPhoto() { lbIndex = (lbIndex + 1) % gallery.length; updateLightbox(); }
    function updateLightbox() {
      var item = gallery[lbIndex];
      document.getElementById('lightbox-img').src = item.url;
      document.getElementById('lightbox-caption').textContent = item.caption || '';
      document.getElementById('lightbox-counter').textContent = (lbIndex + 1) + ' / ' + gallery.length;
    }
    var touchStartX = 0;
    document.getElementById('lightbox').addEventListener('touchstart', function(e) { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    document.getElementById('lightbox').addEventListener('touchend', function(e) {
      var diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) { if (diff > 0) nextPhoto(); else prevPhoto(); }
    }, { passive: true });
    document.addEventListener('keydown', function(e) {
      if (!document.getElementById('lightbox').classList.contains('open')) return;
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft')  prevPhoto();
      if (e.key === 'Escape') closeLightbox();
    });
  </script>
</body>
</html>`;
}
