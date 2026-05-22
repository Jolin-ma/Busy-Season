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

function renderTimeline(events: ProfileData['timeline']): string {
  return events.map(e => `
    <div class="relative pl-8 pb-10 last:pb-0">
      <div class="absolute -left-[7px] top-1 w-3.5 h-3.5 rounded-full bg-stone-300 border-2 border-stone-50 shadow-sm"></div>
      <p class="text-[10px] font-semibold tracking-[0.15em] text-stone-400 uppercase">${e.year}</p>
      <h3 class="text-sm font-semibold text-stone-800 mt-0.5">${e.title}</h3>
      <p class="text-sm text-stone-500 mt-1 leading-relaxed">${e.description}</p>
    </div>`).join('');
}

function renderGallery(items: ProfileData['gallery']): string {
  return items.map(item => `
    <div class="aspect-square rounded-xl overflow-hidden bg-stone-100">
      <img src="${item.url}" alt="${item.caption ?? ''}" loading="lazy"
           class="w-full h-full object-cover transition-opacity duration-300 opacity-0 onload-fade" />
    </div>`).join('');
}

function renderMemories(memories: ProfileData['memories']): string {
  return memories.map(m => `
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
      <p class="text-stone-500 text-sm leading-relaxed italic">&ldquo;${m.message}&rdquo;</p>
      <div class="flex items-center justify-between mt-3 pt-3 border-t border-stone-50">
        <span class="text-xs font-semibold text-stone-700">&mdash; ${m.author}</span>
        <span class="text-xs text-stone-400">${m.date}</span>
      </div>
    </div>`).join('');
}

export function renderProfile(data: ProfileData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>${data.name} — LegacyLink</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            serif: ['Playfair Display', 'Georgia', 'serif'],
            sans: ['Inter', 'system-ui', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    .onload-fade { transition: opacity 0.4s ease; }
    .onload-fade.loaded { opacity: 1 !important; }
  </style>
</head>
<body class="bg-stone-50 font-sans text-stone-800 antialiased min-h-screen">

  <!-- ── HERO ──────────────────────────────────────────────────────────────── -->
  <section class="bg-stone-900 text-white px-6 pt-14 pb-12 text-center">
    <div class="mx-auto w-28 h-28 rounded-full overflow-hidden ring-1 ring-stone-600 ring-offset-4 ring-offset-stone-900 mb-7 shadow-xl">
      <img src="${data.portraitUrl}" alt="${data.name}" class="w-full h-full object-cover" />
    </div>
    <h1 class="font-serif text-[1.85rem] font-semibold tracking-wide leading-tight mb-2">${data.name}</h1>
    <p class="text-stone-400 text-xs tracking-[0.18em] uppercase mb-7">${data.birthDate} &ensp;&mdash;&ensp; ${data.deathDate}</p>
    <blockquote class="font-serif italic text-stone-300 text-[0.95rem] max-w-[17rem] mx-auto leading-relaxed border-l border-stone-600 pl-4 text-left">
      &ldquo;${data.epitaph}&rdquo;
    </blockquote>
  </section>

  <!-- ── TIMELINE ──────────────────────────────────────────────────────────── -->
  <section class="px-6 pt-10 pb-8">
    <h2 class="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400 mb-8">Life Journey</h2>
    <div class="relative border-l border-stone-200 ml-[3px]">
      ${renderTimeline(data.timeline)}
    </div>
  </section>

  <!-- ── GALLERY ───────────────────────────────────────────────────────────── -->
  <section class="px-6 pb-10">
    <h2 class="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400 mb-5">Memories &amp; Photos</h2>
    <div class="grid grid-cols-2 gap-2.5">
      ${renderGallery(data.gallery)}
    </div>
  </section>

  <!-- ── MEMORY WALL ───────────────────────────────────────────────────────── -->
  <section class="px-6 pb-20">
    <h2 class="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400 mb-5">Memory Wall</h2>
    <div class="space-y-3">
      ${renderMemories(data.memories)}
    </div>
    <button
      onclick="document.getElementById('memory-modal').classList.remove('hidden')"
      class="mt-7 w-full py-4 border border-stone-300 rounded-2xl text-stone-600 text-sm font-medium hover:bg-stone-100 active:bg-stone-200 transition-colors">
      + Leave a Memory
    </button>
  </section>

  <!-- ── FOOTER ────────────────────────────────────────────────────────────── -->
  <footer class="text-center py-6 border-t border-stone-200">
    <p class="text-[10px] text-stone-400 tracking-widest uppercase">LegacyLink &mdash; Preserving Stories</p>
  </footer>

  <!-- ── MODAL ─────────────────────────────────────────────────────────────── -->
  <div id="memory-modal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
    <div class="bg-white w-full max-w-lg rounded-t-3xl px-6 pt-6 pb-10 shadow-2xl">
      <div class="flex items-center justify-between mb-6">
        <h3 class="font-serif text-xl text-stone-800">Share a Memory</h3>
        <button onclick="document.getElementById('memory-modal').classList.add('hidden')"
                class="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 text-lg leading-none hover:bg-stone-200 transition-colors">
          &times;
        </button>
      </div>
      <form onsubmit="handleMemorySubmit(event)">
        <input type="text" id="memory-author" placeholder="Your name" autocomplete="name"
               class="w-full border border-stone-200 rounded-xl px-4 py-3.5 text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-stone-400 bg-stone-50" />
        <textarea id="memory-text" placeholder="Share a memory or tribute…" rows="4"
                  class="w-full border border-stone-200 rounded-xl px-4 py-3.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-stone-400 bg-stone-50"></textarea>
        <button type="submit"
                class="mt-4 w-full bg-stone-800 text-white py-4 rounded-2xl text-sm font-semibold hover:bg-stone-700 active:bg-stone-900 transition-colors">
          Submit Memory
        </button>
      </form>
    </div>
  </div>

  <script>
    // Fade in images once loaded
    document.querySelectorAll('.onload-fade').forEach(img => {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', () => img.classList.add('loaded'));
      }
    });

    // Close modal on backdrop click
    document.getElementById('memory-modal').addEventListener('click', function(e) {
      if (e.target === this) this.classList.add('hidden');
    });

    // Mock form submission
    function handleMemorySubmit(e) {
      e.preventDefault();
      const author = document.getElementById('memory-author').value.trim();
      const text = document.getElementById('memory-text').value.trim();
      if (!author || !text) return;

      const wall = document.querySelector('#memory-modal').previousElementSibling.querySelector('.space-y-3');
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const card = document.createElement('div');
      card.className = 'bg-white rounded-2xl p-5 shadow-sm border border-stone-100';
      card.innerHTML = \`
        <p class="text-stone-500 text-sm leading-relaxed italic">&ldquo;\${text}&rdquo;</p>
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-stone-50">
          <span class="text-xs font-semibold text-stone-700">&mdash; \${author}</span>
          <span class="text-xs text-stone-400">\${today}</span>
        </div>\`;
      wall.prepend(card);
      document.getElementById('memory-modal').classList.add('hidden');
      e.target.reset();
    }
  </script>

</body>
</html>`;
}
