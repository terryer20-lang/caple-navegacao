/**
 * CAPLE PWA Service Worker
 * Cache-first for app shell, network-first for data
 */
const CACHE_NAME = 'caple-v1';
const STATIC_ASSETS = [
  'index.html',
  'manifest.json',
  'favicon.svg',
  'icon-192.png',
  'icon-512.png',
  'app.js',
  'store/storage.js',
  'utils/diacritics.js',
  'utils/api.js',
  'data/conectores.js',
  'data/dict_vocab_data.js',
  'data/uploaded_qecr_data.js',
  'data/dict_pthp.js',
  'data/dict_hpph.js',
  'data/dict_univ.js',
  'data/dict_priberam.js',
  'data/expressoes_data.js',
  'components/Sidebar.js',
  'components/ConfigModal.js',
  'components/VocabView.js',
  'components/ExamView.js',
  'components/NewsView.js',
  'components/PIEView.js',
  'components/ConectoresView.js',
  'components/DicionarioView.js',
  'components/ExpressoesView.js',
  'components/FavoritosView.js',
  'components/StudyStats.js',
  'components/DitadoView.js',
  'components/MeuLexicoView.js',
  'components/ErrosView.js',
  'components/ExamHistoryView.js',
  'components/AppShell.js',
];

// Install: cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for static assets, network-first for CDN
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // CDN resources (Vue, Tailwind, Lucide): network-first with cache fallback
  if (url.hostname.includes('unpkg.com') || url.hostname.includes('cdn.')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // API calls: network-only, no caching
  if (url.pathname.includes('/v1/chat/completions')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Local assets: cache-first
  event.respondWith(
    caches.match(event.request)
      .then((cached) => cached || fetch(event.request))
  );
});
