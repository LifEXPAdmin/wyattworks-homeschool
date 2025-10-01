// Performance optimization and caching system for Astra Academy
// Handles caching, offline support, and performance monitoring

export interface CacheConfig {
  maxSize: number; // Maximum cache size in MB
  ttl: number; // Time to live in milliseconds
  strategy: 'lru' | 'fifo' | 'lfu';
}

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  timestamp: number;
  accessCount: number;
  size: number;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  bundleSize: number;
  renderTime: number;
}

export interface OfflineCapability {
  canWorkOffline: boolean;
  cachedResources: string[];
  lastSyncTime: Date;
  pendingActions: OfflineAction[];
}

export interface OfflineAction {
  id: string;
  type: 'create_worksheet' | 'export_worksheet' | 'update_progress';
  data: Record<string, unknown>;
  timestamp: Date;
  retryCount: number;
}

// Generic cache implementation
export class Cache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 50, // 50MB default
      ttl: config.ttl || 3600000, // 1 hour default
      strategy: config.strategy || 'lru',
    };
  }

  set(key: string, value: T): void {
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      accessCount: 0,
      size: this.calculateSize(value),
    };

    // Check if we need to evict entries
    this.evictIfNeeded(entry.size);

    this.cache.set(key, entry);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access count for LRU/LFU
    entry.accessCount++;
    
    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return Array.from(this.cache.values()).reduce((total, entry) => total + entry.size, 0);
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  private calculateSize(value: unknown): number {
    // Rough estimation of object size in bytes
    return JSON.stringify(value).length * 2;
  }

  private evictIfNeeded(newEntrySize: number): void {
    const currentSize = this.size();
    const maxSizeBytes = this.config.maxSize * 1024 * 1024;

    if (currentSize + newEntrySize <= maxSizeBytes) return;

    // Evict entries based on strategy
    const entries = Array.from(this.cache.entries());
    
    switch (this.config.strategy) {
      case 'lru':
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        break;
      case 'lfu':
        entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
        break;
      case 'fifo':
        // Already sorted by insertion order
        break;
    }

    // Remove oldest/least used entries until we have space
    let freedSpace = 0;
    for (const [key, entry] of entries) {
      if (currentSize - freedSpace + newEntrySize <= maxSizeBytes) break;
      
      this.cache.delete(key);
      freedSpace += entry.size;
    }
  }
}

// Specialized caches for different data types
export class WorksheetCache extends Cache {
  constructor() {
    super({
      maxSize: 100, // 100MB for worksheets
      ttl: 7200000, // 2 hours
      strategy: 'lru',
    });
  }

  cacheWorksheet(id: string, worksheet: Record<string, unknown>): void {
    this.set(`worksheet:${id}`, worksheet);
  }

  getWorksheet(id: string): Record<string, unknown> | null {
    return this.get(`worksheet:${id}`) as Record<string, unknown> | null;
  }

  cacheGeneratedContent(subject: string, config: Record<string, unknown>, content: Record<string, unknown>): void {
    const key = `generated:${subject}:${JSON.stringify(config)}`;
    this.set(key, content);
  }

  getGeneratedContent(subject: string, config: Record<string, unknown>): Record<string, unknown> | null {
    const key = `generated:${subject}:${JSON.stringify(config)}`;
    return this.get(key) as Record<string, unknown> | null;
  }
}

export class FontCache extends Cache {
  constructor() {
    super({
      maxSize: 200, // 200MB for fonts
      ttl: 86400000, // 24 hours
      strategy: 'lru',
    });
  }

  cacheFont(fontFamily: string, fontData: string): void {
    this.set(`font:${fontFamily}`, fontData);
  }

  getFont(fontFamily: string): string | null {
    return this.get(`font:${fontFamily}`) as string | null;
  }
}

export class ProgressCache extends Cache {
  constructor() {
    super({
      maxSize: 50, // 50MB for progress data
      ttl: 300000, // 5 minutes
      strategy: 'lru',
    });
  }

  cacheProgress(userId: string, progress: Record<string, unknown>): void {
    this.set(`progress:${userId}`, progress);
  }

  getProgress(userId: string): Record<string, unknown> | null {
    return this.get(`progress:${userId}`) as Record<string, unknown> | null;
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    apiResponseTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    bundleSize: 0,
    renderTime: 0,
  };

  private cacheHits = 0;
  private cacheMisses = 0;

  startPageLoad(): number {
    return performance.now();
  }

  endPageLoad(startTime: number): void {
    this.metrics.pageLoadTime = performance.now() - startTime;
  }

  startRender(): number {
    return performance.now();
  }

  endRender(startTime: number): void {
    this.metrics.renderTime = performance.now() - startTime;
  }

  recordCacheHit(): void {
    this.cacheHits++;
    this.updateCacheHitRate();
  }

  recordCacheMiss(): void {
    this.cacheMisses++;
    this.updateCacheHitRate();
  }

  private updateCacheHitRate(): void {
    const total = this.cacheHits + this.cacheMisses;
    this.metrics.cacheHitRate = total > 0 ? (this.cacheHits / total) * 100 : 0;
  }

  recordApiCall(duration: number): void {
    this.metrics.apiResponseTime = duration;
  }

  updateMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as { memory?: { usedJSHeapSize: number } }).memory;
      if (memory) {
        this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }
    }
  }

  getMetrics(): PerformanceMetrics {
    this.updateMemoryUsage();
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      pageLoadTime: 0,
      apiResponseTime: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      bundleSize: 0,
      renderTime: 0,
    };
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
}

// Offline support
export class OfflineManager {
  private capabilities: OfflineCapability = {
    canWorkOffline: false,
    cachedResources: [],
    lastSyncTime: new Date(),
    pendingActions: [],
  };

  constructor() {
    this.setupOfflineDetection();
    this.loadPendingActions();
  }

  private setupOfflineDetection(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.capabilities.canWorkOffline = false;
      this.syncPendingActions();
    });

    window.addEventListener('offline', () => {
      this.capabilities.canWorkOffline = true;
    });

    // Initial check
    this.capabilities.canWorkOffline = !navigator.onLine;
  }

  canWorkOffline(): boolean {
    return this.capabilities.canWorkOffline;
  }

  addPendingAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): void {
    const offlineAction: OfflineAction = {
      ...action,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      retryCount: 0,
    };

    this.capabilities.pendingActions.push(offlineAction);
    this.savePendingActions();
  }

  getPendingActions(): OfflineAction[] {
    return [...this.capabilities.pendingActions];
  }

  removePendingAction(actionId: string): void {
    this.capabilities.pendingActions = this.capabilities.pendingActions.filter(
      action => action.id !== actionId
    );
    this.savePendingActions();
  }

  private async syncPendingActions(): Promise<void> {
    const actions = this.getPendingActions();
    
    for (const action of actions) {
      try {
        await this.executeAction(action);
        this.removePendingAction(action.id);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
        action.retryCount++;
        
        // Remove action if it has failed too many times
        if (action.retryCount >= 3) {
          this.removePendingAction(action.id);
        }
      }
    }
  }

  private async executeAction(action: OfflineAction): Promise<void> {
    // In a real app, this would make actual API calls
    switch (action.type) {
      case 'create_worksheet':
        console.log('Syncing worksheet creation:', action.data);
        break;
      case 'export_worksheet':
        console.log('Syncing worksheet export:', action.data);
        break;
      case 'update_progress':
        console.log('Syncing progress update:', action.data);
        break;
    }
  }

  private loadPendingActions(): void {
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem('astra-academy-pending-actions');
    if (stored) {
      this.capabilities.pendingActions = JSON.parse(stored);
    }
  }

  private savePendingActions(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(
      'astra-academy-pending-actions',
      JSON.stringify(this.capabilities.pendingActions)
    );
  }

  getCapabilities(): OfflineCapability {
    return { ...this.capabilities };
  }
}

// Bundle optimization utilities
export class BundleOptimizer {
  static async preloadCriticalResources(): Promise<void> {
    if (typeof window === 'undefined') return;

    const criticalResources = [
      '/fonts/inter-var.woff2',
      '/images/logo.svg',
      '/api/health',
    ];

    for (const resource of criticalResources) {
      try {
        if (resource.endsWith('.woff2')) {
          // Preload font
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = resource;
          link.as = 'font';
          link.type = 'font/woff2';
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        } else if (resource.startsWith('/api/')) {
          // Preload API endpoint
          await fetch(resource);
        }
      } catch (error) {
        console.warn('Failed to preload resource:', resource, error);
      }
    }
  }

  static async lazyLoadComponent(componentPath: string): Promise<React.ComponentType<unknown>> {
    try {
      const importedModule = await import(componentPath);
      return importedModule.default;
    } catch (error) {
      console.error('Failed to lazy load component:', componentPath, error);
      return null as unknown as React.ComponentType<unknown>;
    }
  }

  static optimizeImages(): void {
    if (typeof window === 'undefined') return;

    // Add loading="lazy" to images below the fold
    const images = document.querySelectorAll('img[data-lazy]');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
  }
}

// Service Worker utilities
export class ServiceWorkerManager {
  static async register(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  static async unregister(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
      console.log('Service Workers unregistered');
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }
}

// Export singleton instances
export const worksheetCache = new WorksheetCache();
export const fontCache = new FontCache();
export const progressCache = new ProgressCache();
export const performanceMonitor = new PerformanceMonitor();
export const offlineManager = new OfflineManager();
