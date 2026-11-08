/* ============================================================
   sw.template.js — the offline worker every engine lab shares.

   tools/build.mjs fills in the four placeholders below — the lab's name, this build's
   version, the list of stamped files, and a hash per picture — and writes the result to that
   lab's repo root as sw.js. Its scope is therefore exactly /<lab>/ on Pages:
   the most a worker gets by default, this lab and nothing above it. Never edit sw.js.

   ---------------------------------------------------------------------------
   THE ONE DECISION THAT MATTERS: the HTML document is fetched NETWORK-FIRST.

   A service worker on GitHub Pages is the one change that cannot be undone by pushing a fix,
   because we cannot set response headers. The way that goes wrong is always the same: the
   worker serves a cached index.html forever, and every later deploy is invisible. The usual
   defence is a version banner and a kill switch, and the usual result is that a class sits on
   a stale page for a lesson while someone works out why.

   So this worker never prefers the cache for the document while the network is reachable. It
   asks the network first, with a short timeout, and only falls back to what it holds when
   that fails. Online, a student sees exactly what they see today. Offline, they get the lab.

   Everything else IS cache-first, and safely so, because every other URL is immutable by
   construction: index.html carries a ?v= stamp on every script and stylesheet, and the stamp
   changes whenever the file does, so a cached ?v=1 file can never stand in for ?v=2. Pictures
   are keyed by a hash of their own bytes for the same reason.

   The cost is one small document fetch per online load (15–20 KB; the Classification Lab's is
   about 230 KB, with its silhouettes inlined, and less over gzip). That is the price of making the
   unrecoverable failure impossible, and it is worth paying.
   ---------------------------------------------------------------------------

   Cache names are prefixed with the lab, because every lab — and the hubs, and the other
   sites — share the origin nlcsbiology.com and therefore share one CacheStorage.
   ============================================================ */
const LAB        = 'immunity-lab';
const VERSION    = '1794146604';
const SHELL      = LAB + '-shell-v' + VERSION;
const MEDIA      = LAB + '-media';
const PRECACHE   = ["./css/app.css?v=1794146604","./css/immunity.css?v=1794146604","./js/config.js?v=1794146604","./js/data/glossary.js?v=1794146604","./js/data/syllabus.js?v=1794146604","./js/data/stations.js?v=1794146604","./js/data/photos.js?v=1794146604","./js/terms.js?v=1794146604","./js/say.js?v=1794146604","./js/marking.js?v=1794146604","./js/sync.js?v=1794146604","./js/signin.js?v=1794146604","./js/homework.js?v=1794146604","./js/engine.js?v=1794146604","./js/syllabus.js?v=1794146604","./js/widgets.js?v=1794146604","./js/learn.js?v=1794146604","./js/w-common.js?v=1794146604","./js/engine-ext.js?v=1794146604","./js/plate.js?v=1794146604","./js/imm-art.js?v=1794146604","./js/imm-draw.js?v=1794146604","./js/imm-scenes.js?v=1794146604","./js/w-kit.js?v=1794146604","./js/w-immune.js?v=1794146604","./js/w-immext.js?v=1794146604","./js/w-routes.js?v=1794146604","./js/w-abfit.js?v=1794146604","./js/w-mother.js?v=1794146604","./js/w-cholera.js?v=1794146604","./js/views/gallery.js?v=1794146604","./js/views/defences.js?v=1794146604","./js/views/town.js?v=1794146604","./js/views/figure.js?v=1794146604","./js/app.js?v=1794146604"];      /* every stamped .js and .css, taken from the HTML the build just stamped */
const MEDIA_REV  = {"photos/breastfeed-1400.jpg":"e1585e25","photos/breastfeed-1400.webp":"d84d141e","photos/breastfeed-900.jpg":"e83715d5","photos/breastfeed-900.webp":"f475a70a","photos/m-food-1400.jpg":"f210b999","photos/m-food-1400.webp":"a45108cc","photos/m-food-900.jpg":"2f0eecd9","photos/m-food-900.webp":"98545b72","photos/m-hygiene-1400.jpg":"e0cb12e8","photos/m-hygiene-1400.webp":"6d229765","photos/m-hygiene-900.jpg":"f21df2a3","photos/m-hygiene-900.webp":"71653321","photos/m-sewage-1400.jpg":"02f29451","photos/m-sewage-1400.webp":"08950b56","photos/m-sewage-900.jpg":"7db61068","photos/m-sewage-900.webp":"c8fdffc7","photos/m-waste-1400.jpg":"cead90fa","photos/m-waste-1400.webp":"bdb0aee9","photos/m-waste-900.jpg":"e20ecb3b","photos/m-waste-900.webp":"6fa73d53","photos/m-water-1400.jpg":"202e7429","photos/m-water-1400.webp":"826c11d8","photos/m-water-900.jpg":"5765ba4b","photos/m-water-900.webp":"7049959f","photos/mucus-900.jpg":"9565e910","photos/mucus-900.webp":"e6ca58c1","photos/nose-hairs-1400.jpg":"9f1cf731","photos/nose-hairs-1400.webp":"bd7029e4","photos/nose-hairs-900.jpg":"3a435cc2","photos/nose-hairs-900.webp":"c4b4861c","photos/p-bacterium-1400.jpg":"e574e6ad","photos/p-bacterium-1400.webp":"8f321b5a","photos/p-bacterium-900.jpg":"d8b9db52","photos/p-bacterium-900.webp":"8bf3a161","photos/p-fungus-1400.jpg":"a1056c5d","photos/p-fungus-1400.webp":"ad7ec991","photos/p-fungus-900.jpg":"e8c0fe95","photos/p-fungus-900.webp":"5feb126a","photos/p-protoctist-1400.jpg":"eec54fde","photos/p-protoctist-1400.webp":"c8c74d76","photos/p-protoctist-900.jpg":"ab95e5f3","photos/p-protoctist-900.webp":"a3610ba4","photos/p-sarscov2-1400.jpg":"497358d0","photos/p-sarscov2-1400.webp":"7ac6c3b3","photos/p-sarscov2-900.jpg":"28829b36","photos/p-sarscov2-900.webp":"083ee225","photos/r-air-1400.jpg":"f71e6543","photos/r-air-1400.webp":"667a7f1b","photos/r-air-900.jpg":"13836073","photos/r-air-900.webp":"2c2b4984","photos/r-animal-1400.jpg":"83fa77f1","photos/r-animal-1400.webp":"643bce47","photos/r-animal-900.jpg":"6ef1dfcb","photos/r-animal-900.webp":"a0dbf949","photos/r-blood-1400.jpg":"f1242cfb","photos/r-blood-1400.webp":"8a7b0cbd","photos/r-blood-900.jpg":"112bdd50","photos/r-blood-900.webp":"6f2424c3","photos/r-chicken-1400.jpg":"2131c86f","photos/r-chicken-1400.webp":"0017fff3","photos/r-chicken-900.jpg":"128f816e","photos/r-chicken-900.webp":"0d40ab36","photos/r-handle-1400.jpg":"602fcc92","photos/r-handle-1400.webp":"c88ad798","photos/r-handle-900.jpg":"05fc788f","photos/r-handle-900.webp":"83d9a4fe","photos/r-river-1400.jpg":"3c8f8b69","photos/r-river-1400.webp":"032e1e22","photos/r-river-900.jpg":"b8730def","photos/r-river-900.webp":"6dc34304","photos/smallpox-1400.jpg":"3d7f01e1","photos/smallpox-1400.webp":"f88ec3b3","photos/smallpox-900.jpg":"c9e0460d","photos/smallpox-900.webp":"e7af069c","photos/snow-map-1400.jpg":"d7924b2b","photos/snow-map-1400.webp":"eb0bc080","photos/snow-map-900.jpg":"2129ec87","photos/snow-map-900.webp":"892648d5","photos/sv-baby.svg":"9bdc9636","photos/sv-gut.svg":"668b8539","photos/sv-placenta.svg":"9583c4fc","photos/sv-pregnancy.svg":"e2295b5b","photos/sv-skin-clot.svg":"e62d5e0a","photos/sv-skin.svg":"455ea14e","photos/sv-stomach.svg":"2a31b80e","photos/sv-villi.svg":"2e19d2c6","photos/vaccinate-1400.jpg":"8b2b4512","photos/vaccinate-1400.webp":"cbe2d2ff","photos/vaccinate-900.jpg":"20d55cc5","photos/vaccinate-900.webp":"45a65639","say/allele-us.mp3":"79a913db","say/asexual-us.mp3":"2cfab9c7","say/centromere-en.mp3":"db01bfbf","say/chromosome-us.mp3":"126cbe50","say/cytoplasm-us.mp3":"b0648d34","say/dehydrogenation-en.mp3":"da5a3556","say/dominant-us.mp3":"6f70ba82","say/fertilisation-us.mp3":"194f4bf1","say/gamete-us.mp3":"63bdb289","say/gene-en.mp3":"c67abb88","say/genome-us.mp3":"f077cb06","say/genotype-us.mp3":"b92e36d0","say/haploid-en.mp3":"685dac2b","say/homozygous-us.mp3":"090ce183","say/inheritance-us.mp3":"5a119219","say/lysosome-uk.mp3":"6cb1df99","say/meiosis-us.mp3":"8d9cc0af","say/mitosis-en.mp3":"e155475e","say/nucleolus-uk.mp3":"ecbd3966","say/nucleotide-us.mp3":"7d0f1f90","say/nucleus-us.mp3":"d5fd312a","say/phenotype-us.mp3":"3ba22368","say/phospholipid-en.mp3":"bdc5e900","say/recessive-uk.mp3":"de9ef162","say/ribosome-en.mp3":"41fc0538","say/zygote-us.mp3":"0b7b5be6"};     /* 'photos/x.jpg' -> a short hash of its bytes */
const DOC_TIMEOUT = 3000;

/* ---------- install: take a complete, self-consistent copy ---------- */
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const c = await caches.open(SHELL);
    /* cache:'reload' is not optional. A Request built from a plain string uses the default
       cache mode, so './' would come from the browser's own HTTP cache — which Pages lets it
       hold for ten minutes — while the never-before-seen ?v= urls come from the network. That
       pairs an old document with new files, which is the exact failure this worker exists to
       avoid. */
    const doc = await fetch('./', { cache: 'reload' });
    if (!doc.ok) throw new Error('index responded ' + doc.status);
    await c.put('./', doc.clone());
    await c.addAll(PRECACHE);
    /* And then check what is ACTUALLY in the cache, not what the server said. If the document
       we hold does not name this worker's own version, throw: a failed install simply never
       activates, and the lab goes on behaving exactly as it does without a worker. */
    const held = await (await c.match('./')).text();
    const m = held.match(/stations\.js\?v=(\d+)/);
    if (!m || m[1] !== VERSION) {
      await caches.delete(SHELL);
      throw new Error('cached index is v' + (m && m[1]) + ' but this worker is v' + VERSION);
    }
  })());
});

/* ---------- activate: drop this lab's old shells, and only this lab's ---------- */
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const k of await caches.keys())
      if (k.indexOf(LAB + '-shell-v') === 0 && k !== SHELL) await caches.delete(k);
    /* forget pictures that are no longer in the build */
    const media = await caches.open(MEDIA);
    const want = new Set(Object.keys(MEDIA_REV).map(p => p + '?r=' + MEDIA_REV[p]));
    for (const req of await media.keys()) {
      const u = new URL(req.url);
      const rel = u.pathname.split('/assets/')[1];
      if (rel && !want.has(rel + u.search)) await media.delete(req);
    }
    /* clients.matchAll is scoped to the ORIGIN, not to this worker: every lab lives on
       nlcsbiology.com, so an unfiltered broadcast would pop a "newer version" banner in
       ANOTHER lab's tab, whose Reload button would then do nothing for ever. */
    const cs = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    for (const c of cs)
      if (c.url.indexOf(self.registration.scope) === 0)
        c.postMessage({ type: 'VERSION', lab: LAB, version: VERSION });
  })());
});

self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });

/* ---------- fetch ---------- */
function inScope(url) { return url.href.indexOf(self.registration.scope) === 0; }

async function fromNetworkFirst(request) {
  /* the document. Online it is always the live one; offline it is the last one we held. */
  const cache = await caches.open(SHELL);
  try {
    const net = await Promise.race([
      fetch(request, { cache: 'no-store' }),
      new Promise((_, no) => setTimeout(() => no(new Error('slow')), DOC_TIMEOUT))
    ]);
    if (net && net.ok) { cache.put('./', net.clone()); return net; }
    throw new Error('document responded ' + (net && net.status));
  } catch (e) {
    const held = await cache.match('./');
    if (held) return held;
    throw e;
  }
}

async function cacheFirst(request, cacheName) {
  /* Anything unexpected in here — CacheStorage refused in a private window, quota, a bug —
     must end in an ordinary network fetch. A respondWith that rejects does not fall back to
     the network: it fails the request outright, which would be a blank lab. */
  try {
    const cache = await caches.open(cacheName);
    const hit = await cache.match(request);
    if (hit) return hit;
    const net = await fetch(request);
    if (net && net.ok && net.type === 'basic') cache.put(request, net.clone());
    return net;
  } catch (e) {
    return fetch(request);
  }
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  /* A Range request is how Safari on iOS plays and scrubs a video. Answering one from a whole
     cached body breaks playback silently on exactly that browser, so never touch them. */
  if (req.headers.has('range')) return;
  const url = new URL(req.url);
  /* cross-origin — the Google sign-in client, the font stylesheet — is never this worker's
     business. Letting it through untouched is what keeps sign-in working. */
  if (url.origin !== location.origin || !inScope(url)) return;

  if (req.mode === 'navigate') { event.respondWith(fromNetworkFirst(req)); return; }

  const rel = url.pathname.slice(new URL(self.registration.scope).pathname.length);

  /* stamped code: the url changes whenever the file does, so the cache can never be stale */
  if (url.search.indexOf('v=') >= 0 && /\.(js|css)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(req, SHELL)); return;
  }
  /* pictures, video posters, silhouettes: keyed by a hash of their own bytes */
  if (rel.indexOf('assets/') === 0) {
    const key = rel.slice('assets/'.length);
    const rev = MEDIA_REV[key];
    if (rev) {
      const keyed = new Request(url.origin + url.pathname + '?r=' + rev, { mode: 'same-origin' });
      event.respondWith((async () => {
        try {
          const cache = await caches.open(MEDIA);
          const hit = await cache.match(keyed);
          if (hit) return hit;
          const net = await fetch(req);
          /* the put has to be held open by the event: mobile Chrome and iOS Safari stop the
             worker the moment respondWith settles, so a detached put is dropped on exactly
             the devices this is for, while working every time on a Mac. */
          if (net && net.ok && net.type === 'basic') event.waitUntil(cache.put(keyed, net.clone()));
          return net;
        } catch (e) { return fetch(req); }
      })());
      return;
    }
  }
  /* version.txt above all: it is how the page learns a deploy has happened */
  /* everything else goes straight to the network */
});
