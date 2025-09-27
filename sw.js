// sw.js
const CACHE_NAME = 'treinta-clone-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/metadata.json',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/context/AppContext.tsx',
  '/services/geminiService.ts',
  '/components/layout/BottomNav.tsx',
  '/components/AIAssistant.tsx',
  '/components/InvoiceModal.tsx',
  '/components/AddPaymentModal.tsx',
  '/screens/DashboardScreen.tsx',
  '/screens/SalesScreen.tsx',
  '/screens/InventoryScreen.tsx',
  '/screens/ExpensesScreen.tsx',
  '/screens/ContactsScreen.tsx',
  '/screens/SettingsScreen.tsx',
  '/screens/DebtsScreen.tsx',
  '/screens/AuthScreen.tsx',
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1/client',
  'https://aistudiocdn.com/@google/genai@^1.20.0',
  'https://aistudiocdn.com/recharts@^2.13.2'
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        // addAll() fails if any of the fetches fail.
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
});
