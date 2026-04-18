const CACHE = 'lexique-v1';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// ── NOTIFICATION ALARM ──
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIF') {
    scheduleNext(e.data.delay, e.data.word);
  }
});

function scheduleNext(delay, word) {
  setTimeout(() => {
    self.registration.showNotification('📚 Lexique Juridique', {
      body: `${word.word}\n${word.definition.substring(0, 80)}…`,
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: 'vocab-reminder',
      renotify: true,
      data: { word }
    });
  }, delay);
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(cs => {
    if (cs.length) { cs[0].focus(); return; }
    clients.openWindow('./index.html');
  }));
});
