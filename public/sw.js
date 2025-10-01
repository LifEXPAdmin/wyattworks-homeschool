// Service Worker for Astra Academy offline support
// Provides caching, offline functionality, and background sync

const CACHE_NAME = 'astra-academy-v1';
const STATIC_CACHE_NAME = 'astra-academy-static-v1';
const DYNAMIC_CACHE_NAME = 'astra-academy-dynamic-v1';

// Resources to cache for offline use
const STATIC_RESOURCES = [
  '/',
  '/dashboard',
  '/dashboard/create',
  '/dashboard/subscription',
  '/sign-in',
  '/sign-up',
  '/privacy',
  '/terms',
  '/manifest.json',
  '/favicon.ico',
  '/_next/static/css/',
  '/_next/static/js/',
];

// API endpoints that can work offline
const OFFLINE_ENDPOINTS = [
  '/api/health',
  '/api/export',
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static resources...');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('Static resources cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    handleFetch(request)
  );
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Try cache first for static resources
    if (isStaticResource(url.pathname)) {
      const cachedResponse = await getFromCache(request, STATIC_CACHE_NAME);
      if (cachedResponse) {
        console.log('Serving from static cache:', url.pathname);
        return cachedResponse;
      }
    }

    // Try network first for API calls
    if (isApiEndpoint(url.pathname)) {
      try {
        const networkResponse = await fetch(request);
        
        // Cache successful API responses
        if (networkResponse.ok) {
          await addToCache(request, networkResponse.clone(), DYNAMIC_CACHE_NAME);
        }
        
        return networkResponse;
      } catch (error) {
        console.log('Network failed, trying cache for API:', url.pathname);
        
        // Fallback to cache for API calls
        const cachedResponse = await getFromCache(request, DYNAMIC_CACHE_NAME);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Return offline response for API calls
        return createOfflineResponse(request);
      }
    }

    // For other requests, try network first, then cache
    try {
      const networkResponse = await fetch(request);
      
      // Cache successful responses
      if (networkResponse.ok) {
        await addToCache(request, networkResponse.clone(), DYNAMIC_CACHE_NAME);
      }
      
      return networkResponse;
    } catch (error) {
      console.log('Network failed, trying cache:', url.pathname);
      
      // Fallback to cache
      const cachedResponse = await getFromCache(request, DYNAMIC_CACHE_NAME);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Return offline page for navigation requests
      if (request.mode === 'navigate') {
        return createOfflinePage();
      }
      
      // Return generic offline response
      return createOfflineResponse(request);
    }
  } catch (error) {
    console.error('Fetch handler error:', error);
    return createOfflineResponse(request);
  }
}

function isStaticResource(pathname) {
  return STATIC_RESOURCES.some(resource => 
    pathname === resource || 
    pathname.startsWith(resource) ||
    pathname.includes('/_next/static/')
  );
}

function isApiEndpoint(pathname) {
  return OFFLINE_ENDPOINTS.some(endpoint => pathname.startsWith(endpoint));
}

async function getFromCache(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    return await cache.match(request);
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

async function addToCache(request, response, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
  } catch (error) {
    console.error('Cache add error:', error);
  }
}

function createOfflineResponse(request) {
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'You are currently offline. Some features may not be available.',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    }
  );
}

function createOfflinePage() {
  return new Response(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Astra Academy - Offline</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          max-width: 500px;
        }
        .icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        h1 {
          color: #333;
          margin-bottom: 16px;
        }
        p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .button {
          background: #667eea;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: background 0.2s;
        }
        .button:hover {
          background: #5a6fd8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📡</div>
        <h1>You're Offline</h1>
        <p>
          Don't worry! You can still access your cached worksheets and continue working. 
          Your changes will sync when you're back online.
        </p>
        <button class="button" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    </body>
    </html>`,
    {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
      },
    }
  );
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'worksheet-sync') {
    event.waitUntil(syncWorksheets());
  }
});

async function syncWorksheets() {
  try {
    // Get pending worksheets from IndexedDB
    const pendingWorksheets = await getPendingWorksheets();
    
    for (const worksheet of pendingWorksheets) {
      try {
        // Try to sync the worksheet
        await syncWorksheet(worksheet);
        
        // Remove from pending list
        await removePendingWorksheet(worksheet.id);
        
        console.log('Successfully synced worksheet:', worksheet.id);
      } catch (error) {
        console.error('Failed to sync worksheet:', worksheet.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

async function getPendingWorksheets() {
  // In a real implementation, this would read from IndexedDB
  return [];
}

async function syncWorksheet(worksheet) {
  // In a real implementation, this would make API calls
  console.log('Syncing worksheet:', worksheet);
}

async function removePendingWorksheet(id) {
  // In a real implementation, this would update IndexedDB
  console.log('Removing pending worksheet:', id);
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: data.tag,
        data: data.data,
      })
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/dashboard')
  );
});

console.log('Service Worker loaded successfully');
