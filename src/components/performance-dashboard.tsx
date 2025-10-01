"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Database, 
  Wifi, 
  WifiOff, 
  Clock, 
  MemoryStick, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity
} from "lucide-react";
import { 
  performanceMonitor, 
  offlineManager, 
  worksheetCache, 
  fontCache, 
  progressCache,
  ServiceWorkerManager,
  BundleOptimizer,
  type PerformanceMetrics,
  type OfflineCapability 
} from "@/lib/performance";

interface PerformanceDashboardProps {
  className?: string;
}

export function PerformanceDashboard({ className }: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(performanceMonitor.getMetrics());
  const [offlineCapabilities, setOfflineCapabilities] = useState<OfflineCapability>(offlineManager.getCapabilities());
  const [cacheStats, setCacheStats] = useState({
    worksheet: { size: 0, keys: 0 },
    font: { size: 0, keys: 0 },
    progress: { size: 0, keys: 0 },
  });
  const [isServiceWorkerRegistered, setIsServiceWorkerRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
    
    // Update metrics every 5 seconds
    const interval = setInterval(loadPerformanceData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = () => {
    setMetrics(performanceMonitor.getMetrics());
    setOfflineCapabilities(offlineManager.getCapabilities());
    
    // Get cache statistics
    setCacheStats({
      worksheet: {
        size: Math.round(worksheetCache.size() / 1024 / 1024 * 100) / 100, // MB
        keys: worksheetCache.keys().length,
      },
      font: {
        size: Math.round(fontCache.size() / 1024 / 1024 * 100) / 100, // MB
        keys: fontCache.keys().length,
      },
      progress: {
        size: Math.round(progressCache.size() / 1024 / 1024 * 100) / 100, // MB
        keys: progressCache.keys().length,
      },
    });
    
    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        setIsServiceWorkerRegistered(registrations.length > 0);
      });
    }
    
    setLoading(false);
  };

  const clearAllCaches = () => {
    worksheetCache.clear();
    fontCache.clear();
    progressCache.clear();
    loadPerformanceData();
    alert('All caches cleared successfully!');
  };

  const registerServiceWorker = async () => {
    try {
      await ServiceWorkerManager.register();
      setIsServiceWorkerRegistered(true);
      alert('Service Worker registered successfully!');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      alert('Failed to register Service Worker. Check console for details.');
    }
  };

  const unregisterServiceWorker = async () => {
    try {
      await ServiceWorkerManager.unregister();
      setIsServiceWorkerRegistered(false);
      alert('Service Worker unregistered successfully!');
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      alert('Failed to unregister Service Worker. Check console for details.');
    }
  };

  const preloadResources = async () => {
    try {
      await BundleOptimizer.preloadCriticalResources();
      alert('Critical resources preloaded successfully!');
    } catch (error) {
      console.error('Resource preloading failed:', error);
      alert('Failed to preload resources. Check console for details.');
    }
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (value <= thresholds.warning) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
          <p className="text-gray-600">Monitor app performance and technical metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadPerformanceData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Badge variant={offlineCapabilities.canWorkOffline ? "destructive" : "default"}>
            {offlineCapabilities.canWorkOffline ? (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </>
            ) : (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Load Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getPerformanceIcon(metrics.pageLoadTime, { good: 1000, warning: 2000 })}
              <div className={`text-2xl font-bold ${getPerformanceColor(metrics.pageLoadTime, { good: 1000, warning: 2000 })}`}>
                {Math.round(metrics.pageLoadTime)}ms
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.pageLoadTime <= 1000 ? 'Excellent' : 
               metrics.pageLoadTime <= 2000 ? 'Good' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getPerformanceIcon(100 - metrics.cacheHitRate, { good: 20, warning: 40 })}
              <div className={`text-2xl font-bold ${getPerformanceColor(100 - metrics.cacheHitRate, { good: 20, warning: 40 })}`}>
                {Math.round(metrics.cacheHitRate)}%
              </div>
            </div>
            <Progress value={metrics.cacheHitRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getPerformanceIcon(metrics.memoryUsage, { good: 50, warning: 100 })}
              <div className={`text-2xl font-bold ${getPerformanceColor(metrics.memoryUsage, { good: 50, warning: 100 })}`}>
                {Math.round(metrics.memoryUsage)}MB
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              JavaScript heap size
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Render Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getPerformanceIcon(metrics.renderTime, { good: 16, warning: 33 })}
              <div className={`text-2xl font-bold ${getPerformanceColor(metrics.renderTime, { good: 16, warning: 33 })}`}>
                {Math.round(metrics.renderTime)}ms
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last component render
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="caching" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="caching">Caching</TabsTrigger>
          <TabsTrigger value="offline">Offline Support</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* Caching Tab */}
        <TabsContent value="caching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Cache Statistics
              </CardTitle>
              <CardDescription>
                Monitor cache usage and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Worksheet Cache</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Size:</span>
                        <span className="font-medium">{cacheStats.worksheet.size}MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Entries:</span>
                        <span className="font-medium">{cacheStats.worksheet.keys}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Font Cache</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Size:</span>
                        <span className="font-medium">{cacheStats.font.size}MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Entries:</span>
                        <span className="font-medium">{cacheStats.font.keys}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Progress Cache</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Size:</span>
                        <span className="font-medium">{cacheStats.progress.size}MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Entries:</span>
                        <span className="font-medium">{cacheStats.progress.keys}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={clearAllCaches} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear All Caches
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offline Support Tab */}
        <TabsContent value="offline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {offlineCapabilities.canWorkOffline ? (
                  <WifiOff className="h-5 w-5 text-red-500" />
                ) : (
                  <Wifi className="h-5 w-5 text-green-500" />
                )}
                Offline Capabilities
              </CardTitle>
              <CardDescription>
                Current offline status and pending actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Connection Status</h4>
                    <p className="text-sm text-gray-600">
                      {offlineCapabilities.canWorkOffline 
                        ? 'You are currently offline' 
                        : 'You are connected to the internet'
                      }
                    </p>
                  </div>
                  <Badge variant={offlineCapabilities.canWorkOffline ? "destructive" : "default"}>
                    {offlineCapabilities.canWorkOffline ? 'Offline' : 'Online'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Pending Actions</h4>
                    <p className="text-sm text-gray-600">
                      {offlineCapabilities.pendingActions.length} actions waiting to sync
                    </p>
                  </div>
                  <span className="text-2xl font-bold">
                    {offlineCapabilities.pendingActions.length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Last Sync</h4>
                    <p className="text-sm text-gray-600">
                      {offlineCapabilities.lastSyncTime.toLocaleString()}
                    </p>
                  </div>
                </div>

                {offlineCapabilities.pendingActions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Pending Actions:</h4>
                    {offlineCapabilities.pendingActions.map((action) => (
                      <div key={action.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{action.type.replace('_', ' ')}</span>
                        <span className="text-xs text-gray-500">
                          {action.timestamp.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance Optimization
              </CardTitle>
              <CardDescription>
                Tools and settings for optimal performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Service Worker</h4>
                    <p className="text-sm text-gray-600">
                      {isServiceWorkerRegistered 
                        ? 'Service Worker is registered and active' 
                        : 'Service Worker is not registered'
                      }
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {isServiceWorkerRegistered ? (
                      <Button onClick={unregisterServiceWorker} variant="outline" size="sm">
                        Unregister
                      </Button>
                    ) : (
                      <Button onClick={registerServiceWorker} size="sm">
                        Register
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Resource Preloading</h4>
                    <p className="text-sm text-gray-600">
                      Preload critical resources for faster loading
                    </p>
                  </div>
                  <Button onClick={preloadResources} variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Preload Resources
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Performance Tips</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Keep your browser updated for optimal performance</li>
                    <li>• Clear browser cache if experiencing issues</li>
                    <li>• Use a stable internet connection for best experience</li>
                    <li>• Close unused browser tabs to free up memory</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
