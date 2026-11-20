/* FMPO Flashcards — service worker : application multi-pages.
   - shell (pages HTML, js, css…) : NETWORK-FIRST → chaque déploiement
     est pris en compte dès la visite suivante, avec repli sur le cache hors-ligne.
   - données (disc-*.json, index.json, topics-index.json, plan.json) : CACHE-FIRST →
     préchargées à l'installation (hors-ligne complet), puis
     servies depuis le cache (CACHE-FIRST).
   Les appels Firebase / Google ne sont jamais mis en cache.
   IMPORTANT : incrémenter CACHE à chaque changement de stratégie/fichiers.
   CORE ne liste QUE des fichiers qui existent (un 404 fait échouer tout
   l'install : pas de qcm.html / um6ss*.html ici). */
const CACHE = 'fmpo-v11';
const CORE = [
  './', 'index.html', 'home.html', 'discipline.html', 'topic.html',
  'classement.html', 'plan.html', 'profil.html',
  'styles.css', 'firebase-config.js', 'manifest.json',
  'fmpo-logo-circle.jpg', 'fmpo-logo-banner.jpg',
  'icon-192.png', 'icon-512.png',
  'js/common.js', 'js/login.js', 'js/home.js', 'js/atlas-promo.js', 'js/sr.js', 'js/sr-scheduler.js', 'js/review.js', 'review.html', 'js/discipline.js',
  'js/topic.js', 'js/classement.js',
  'js/plan.js', 'js/profil.js',
  'vendor/firebase/firebase-app.js', 'vendor/firebase/firebase-auth.js',
  'vendor/firebase/firebase-firestore.js',
];
/* Données de l'app (9 fichiers, 2.2 Mo) : cartes (disc-*.json),
   index, plan, QCM (mcq-*, mcqm/*), pathologies, UM6SS — préchargées
   à l'installation pour le hors-ligne complet. Généré depuis le disque. */
const DATA = [
  'disc-0.json',
  'disc-1.json',
  'disc-2.json',
  'disc-3.json',
  'disc-4.json',
  'disc-5.json',
  'index.json',
  'plan.json',
  'topics-index.json',
];
const DATA_PATTERNS = [
  /\/disc-\d+\.json$/,
  /\/index\.json$/,
  /\/topics-index\.json$/,
  /\/plan\.json$/,
];


self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE);
    /* Données : un échec isolé (404) ne doit pas faire échouer toute
       l'installation — on journalise et on continue ; le fetch handler
       mettra le fichier en cache à sa première utilisation en ligne. */
    await Promise.all(DATA.map((u) =>
      c.add(u).catch((err) => console.warn('[sw] precache manqué :', u, err))));
    await self.skipWaiting();
  })());
});


self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});


self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin) return; // réseau direct (Firebase, Google…)
  const isCore = CORE.some((p) =>
    p === './' ? (url.pathname === '/' || url.pathname.endsWith('/index.html'))
               : url.pathname.endsWith('/' + p));
  const isData = DATA_PATTERNS.some((re) => re.test(url.pathname));
  if (!isCore && !isData) return;


  if (isData) {
    // Données : cache d'abord (fichiers stables, chargés à la demande).
    e.respondWith(
      caches.match(e.request).then((hit) => {
        if (hit) return hit;
        return fetch(e.request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        });
      })
    );
    return;
  }
  // Shell : réseau d'abord, repli cache hors-ligne.
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
