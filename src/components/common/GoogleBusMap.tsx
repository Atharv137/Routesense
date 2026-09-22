import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Polyline,
  useMap,
  ControlPosition,
  MapControl,
} from '@vis.gl/react-google-maps';
import {
  Bus as BusIcon,
  Navigation,
  MapPin,
  Users,
  Gauge,
  Clock,
  PhoneCall,
  Maximize2,
  Minimize2,
  Crosshair,
  Radio,
  Layers,
  Sparkles,
  AlertCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Bus, BusRoute, Stop } from '../../types';
import { StatusBadge } from './StatusBadge';

// CRITICAL GOOGLE MAPS SETTINGS (Per GMP Agent Skill Guidelines)
const MAP_ID = 'DEMO_MAP_ID';
const ATTRIBUTION_IDS = ['gmp_mcp_codeassist_v1_aistudio'];
const PUNE_CENTER = { lat: 18.5204, lng: 73.8567 };

// Route Color Map
const ROUTE_COLORS: Record<string, string> = {
  route_101: '#FF6B00', // RouteSense Orange
  route_202: '#2563EB', // Blue
  route_303: '#16A34A', // Green
  route_404: '#9333EA', // Purple
};

interface GoogleBusMapProps {
  buses: Bus[];
  routes: BusRoute[];
  selectedRouteId?: string;
  onSelectRouteId?: (routeId: string) => void;
  selectedBusId?: string | null;
  onSelectBus?: (bus: Bus | null) => void;
  heightClass?: string;
  showControls?: boolean;
  allowFullscreen?: boolean;
  className?: string;
}

// Sub-component to manage camera movements
const MapCameraController: React.FC<{
  buses: Bus[];
  selectedBus: Bus | null;
  followBus: boolean;
  selectedRoute?: BusRoute;
}> = ({ buses, selectedBus, followBus, selectedRoute }) => {
  const map = useMap();

  // Follow active bus if enabled
  useEffect(() => {
    if (!map || !selectedBus || !followBus) return;
    map.panTo({ lat: selectedBus.latitude, lng: selectedBus.longitude });
  }, [map, selectedBus?.latitude, selectedBus?.longitude, followBus]);

  // When selected route changes, fit route bounds if no bus is specifically tracked
  useEffect(() => {
    if (!map || !selectedRoute || selectedBus) return;
    if (typeof google === 'undefined' || !google.maps) return;

    const bounds = new google.maps.LatLngBounds();
    selectedRoute.scheduledStops.forEach(stop => {
      bounds.extend({ lat: stop.lat, lng: stop.lng });
    });
    buses
      .filter(b => b.routeId === selectedRoute.routeId)
      .forEach(b => {
        bounds.extend({ lat: b.latitude, lng: b.longitude });
      });

    map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
  }, [map, selectedRoute?.routeId]);

  return null;
};

export const GoogleBusMap: React.FC<GoogleBusMapProps> = ({
  buses,
  routes,
  selectedRouteId = 'all',
  onSelectRouteId,
  selectedBusId,
  onSelectBus,
  heightClass = 'h-[440px] sm:h-[520px]',
  showControls = true,
  allowFullscreen = true,
  className = '',
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const [activeBusId, setActiveBusId] = useState<string | null>(selectedBusId || null);
  const [followBus, setFollowBus] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap');
  const [showStops, setShowStops] = useState<boolean>(true);
  const [activeStop, setActiveStop] = useState<Stop | null>(null);
  const [lastHeartbeat, setLastHeartbeat] = useState<Date>(new Date());

  // Keep internal selection synced with prop if provided
  useEffect(() => {
    if (selectedBusId !== undefined) {
      setActiveBusId(selectedBusId);
    }
  }, [selectedBusId]);

  // Update heartbeat on bus position changes
  useEffect(() => {
    setLastHeartbeat(new Date());
  }, [buses]);

  // Filtered buses
  const filteredBuses = useMemo(() => {
    if (!selectedRouteId || selectedRouteId === 'all') return buses;
    return buses.filter(b => b.routeId === selectedRouteId);
  }, [buses, selectedRouteId]);

  // Currently selected bus object
  const selectedBus = useMemo(() => {
    if (!activeBusId) return null;
    return buses.find(b => b.busId === activeBusId) || null;
  }, [buses, activeBusId]);

  const activeRoute = useMemo(() => {
    if (!selectedRouteId || selectedRouteId === 'all') return undefined;
    return routes.find(r => r.routeId === selectedRouteId);
  }, [routes, selectedRouteId]);

  const handleMarkerClick = (bus: Bus) => {
    setActiveBusId(bus.busId);
    if (onSelectBus) onSelectBus(bus);
  };

  const handleCloseInfoWindow = () => {
    setActiveBusId(null);
    setFollowBus(false);
    if (onSelectBus) onSelectBus(null);
  };

  // Build route polyline paths
  const routePaths = useMemo(() => {
    const targetRoutes = selectedRouteId === 'all'
      ? routes
      : routes.filter(r => r.routeId === selectedRouteId);

    return targetRoutes.map(r => ({
      routeId: r.routeId,
      color: ROUTE_COLORS[r.routeId] || '#FF6B00',
      path: r.scheduledStops.map(s => ({ lat: s.lat, lng: s.lng })),
    }));
  }, [routes, selectedRouteId]);

  // Stops to display
  const stopsToDisplay = useMemo(() => {
    if (!showStops) return [];
    if (selectedRouteId === 'all') {
      // Show major stops only across all routes to prevent clutter
      return routes.flatMap(r => r.scheduledStops.filter(s => s.isMajor));
    }
    const r = routes.find(item => item.routeId === selectedRouteId);
    return r ? r.scheduledStops : [];
  }, [routes, selectedRouteId, showStops]);

  return (
    <div
      id="live-google-bus-map-container"
      className={`relative rounded-3xl overflow-hidden border border-neutral-200/90 shadow-lg bg-neutral-900 flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen' : heightClass
      } ${className}`}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: GPS Stream Status Badge & Corridor Quick Tabs */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          <div className="bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-neutral-700/80 text-xs font-bold text-white flex items-center gap-2 shadow-md">
            <Radio className="w-4 h-4 text-[#FF6B00] animate-pulse" />
            <span className="hidden sm:inline">Live Telemetry</span>
            <span className="w-2 h-2 rounded-full bg-[#22A06B] animate-ping" />
            <span className="text-[10px] font-mono text-neutral-300">
              {filteredBuses.length} {filteredBuses.length === 1 ? 'Bus' : 'Buses'}
            </span>
          </div>

          {/* Quick Route Filter Selector */}
          {onSelectRouteId && (
            <div className="bg-neutral-900/90 backdrop-blur-md p-1 rounded-2xl border border-neutral-700/80 flex items-center gap-1 shadow-md overflow-x-auto max-w-[280px] sm:max-w-none">
              <button
                type="button"
                onClick={() => onSelectRouteId('all')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  selectedRouteId === 'all'
                    ? 'bg-[#FF6B00] text-white shadow-xs'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                All
              </button>
              {routes.map(r => (
                <button
                  type="button"
                  key={r.routeId}
                  onClick={() => onSelectRouteId(r.routeId)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    selectedRouteId === r.routeId
                      ? 'bg-[#FF6B00] text-white shadow-xs'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  R-{r.routeNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Map Controls (Satellite Toggle, Stops Toggle, Fullscreen) */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setMapType(prev => (prev === 'roadmap' ? 'hybrid' : 'roadmap'))}
            title="Toggle Map Type"
            className="p-2 rounded-xl bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 text-white hover:bg-neutral-800 text-xs font-bold transition-colors cursor-pointer shadow-md"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowStops(prev => !prev)}
            title="Toggle Bus Stops"
            className={`px-2.5 py-1.5 rounded-xl backdrop-blur-md border text-xs font-bold transition-colors cursor-pointer shadow-md flex items-center gap-1.5 ${
              showStops
                ? 'bg-[#FF6B00]/90 border-[#FF6B00] text-white'
                : 'bg-neutral-900/90 border-neutral-700/80 text-neutral-300'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Stops</span>
          </button>

          {allowFullscreen && (
            <button
              type="button"
              onClick={() => setIsFullscreen(prev => !prev)}
              title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
              className="p-2 rounded-xl bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 text-white hover:bg-neutral-800 text-xs font-bold transition-colors cursor-pointer shadow-md"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Google Map Canvas via @vis.gl/react-google-maps */}
      <div className="flex-1 w-full h-full relative">
        <APIProvider apiKey={apiKey} libraries={['marker', 'geometry']}>
          <Map
            mapId={MAP_ID}
            defaultCenter={PUNE_CENTER}
            defaultZoom={12}
            mapTypeId={mapType}
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={ATTRIBUTION_IDS}
            style={{ width: '100%', height: '100%' }}
          >
            <MapCameraController
              buses={buses}
              selectedBus={selectedBus}
              followBus={followBus}
              selectedRoute={activeRoute}
            />

            {/* Corridor Polylines */}
            {routePaths.map(rp => (
              <Polyline
                key={rp.routeId}
                path={rp.path}
                strokeColor={rp.color}
                strokeOpacity={0.8}
                strokeWeight={4}
              />
            ))}

            {/* Bus Stop Markers */}
            {stopsToDisplay.map(stop => (
              <AdvancedMarker
                key={stop.stopId}
                position={{ lat: stop.lat, lng: stop.lng }}
                title={`Stop: ${stop.name}`}
                onClick={() => setActiveStop(stop)}
              >
                <div className="flex flex-col items-center group cursor-pointer">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-125 ${
                      stop.isMajor ? 'bg-[#FF6B00] ring-2 ring-[#FF6B00]/40' : 'bg-neutral-600'
                    }`}
                  />
                  <span className="text-[9px] font-bold text-neutral-800 bg-white/95 px-1 py-0.2 rounded shadow-xs border border-neutral-200 mt-0.5 opacity-80 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                    {stop.name.split(' ')[0]}
                  </span>
                </div>
              </AdvancedMarker>
            ))}

            {/* Stop Info Window */}
            {activeStop && (
              <InfoWindow
                position={{ lat: activeStop.lat, lng: activeStop.lng }}
                onCloseClick={() => setActiveStop(null)}
              >
                <div className="p-2 min-w-[180px] text-[#171717]">
                  <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#FF6B00] uppercase tracking-wider">
                    <MapPin className="w-3 h-3" />
                    <span>{activeStop.isMajor ? 'Major Terminal Stop' : 'Bus Stop'}</span>
                  </div>
                  <h4 className="text-sm font-black text-[#171717] mt-0.5">{activeStop.name}</h4>
                  <div className="text-[11px] text-[#6B6B6B] mt-1 space-y-0.5">
                    <p>Stop #{activeStop.order}</p>
                    <p>Scheduled offset: +{activeStop.etaMinutes} min</p>
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* Live Bus Advanced Markers */}
            {filteredBuses.map(bus => {
              const isSelected = activeBusId === bus.busId;
              const statusColor =
                bus.status === 'breakdown'
                  ? '#E5484D'
                  : bus.status === 'delayed'
                  ? '#FF8A1F'
                  : '#22A06B';

              return (
                <AdvancedMarker
                  key={bus.busId}
                  position={{ lat: bus.latitude, lng: bus.longitude }}
                  title={`${bus.busNumber} • Route ${bus.routeNumber}`}
                  onClick={() => handleMarkerClick(bus)}
                  zIndex={isSelected ? 100 : 10}
                >
                  <div className="relative flex flex-col items-center cursor-pointer group">
                    {/* Live Ping Beacon Effect */}
                    <div
                      className="absolute -top-1 w-9 h-9 rounded-full animate-ping opacity-40"
                      style={{ backgroundColor: statusColor }}
                    />

                    {/* Bus Marker Vehicle Body */}
                    <div
                      className={`relative flex items-center justify-center gap-1 px-2 py-1 rounded-xl shadow-lg border-2 transition-transform duration-300 ${
                        isSelected
                          ? 'scale-115 ring-3 ring-white shadow-2xl'
                          : 'group-hover:scale-110'
                      }`}
                      style={{
                        backgroundColor: '#171717',
                        borderColor: statusColor,
                      }}
                    >
                      <BusIcon
                        className="w-3.5 h-3.5"
                        style={{ color: statusColor }}
                      />
                      <span className="text-[10px] font-black text-white font-mono tracking-tight">
                        {bus.routeNumber}
                      </span>
                    </div>

                    {/* Speed / Load Sub-tag */}
                    <div className="mt-0.5 px-1 py-0.2 rounded-md bg-neutral-900/90 text-white text-[9px] font-mono font-bold shadow-xs border border-neutral-700/60 whitespace-nowrap">
                      {bus.currentSpeed} km/h
                    </div>

                    {/* Active Selection Pointer Caret */}
                    {isSelected && (
                      <div
                        className="w-2 h-2 rotate-45 -mt-1 shadow-xs"
                        style={{ backgroundColor: statusColor }}
                      />
                    )}
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Selected Bus Live InfoWindow */}
            {selectedBus && (
              <InfoWindow
                position={{ lat: selectedBus.latitude, lng: selectedBus.longitude }}
                onCloseClick={handleCloseInfoWindow}
              >
                <div className="p-3 min-w-[260px] sm:min-w-[300px] text-[#171717] space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-neutral-100 pb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black font-mono bg-neutral-900 text-white px-2 py-0.5 rounded">
                          {selectedBus.busNumber}
                        </span>
                        <StatusBadge status={selectedBus.status} size="sm" />
                      </div>
                      <h3 className="text-sm font-black text-[#171717] mt-1">
                        Route {selectedBus.routeNumber}
                      </h3>
                      <p className="text-[11px] text-[#6B6B6B] truncate max-w-[200px]">
                        {selectedBus.routeName}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFollowBus(prev => !prev)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        followBus
                          ? 'bg-[#FF6B00] text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                      title="Keep map camera centered on bus"
                    >
                      <Crosshair className="w-3 h-3" />
                      {followBus ? 'Following' : 'Follow'}
                    </button>
                  </div>

                  {/* Real-time Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="flex items-center gap-1 text-[10px] text-[#6B6B6B] font-bold uppercase">
                        <Gauge className="w-3 h-3 text-[#FF6B00]" /> Speed
                      </div>
                      <div className="text-sm font-black text-[#171717] font-mono mt-0.5">
                        {selectedBus.currentSpeed} km/h
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="flex items-center gap-1 text-[10px] text-[#6B6B6B] font-bold uppercase">
                        <Users className="w-3 h-3 text-[#FF6B00]" /> Load
                      </div>
                      <div className="text-sm font-black text-[#171717] mt-0.5">
                        {selectedBus.currentLoad}%{' '}
                        <span className="text-[10px] text-[#6B6B6B] font-normal">
                          ({selectedBus.currentPassengers}/{selectedBus.capacity})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Next Stop & ETA Banner */}
                  <div className="p-2.5 rounded-xl bg-orange-50/80 border border-orange-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6B00] block">
                        Approaching Next Stop
                      </span>
                      <strong className="text-xs text-[#171717] font-bold">
                        {selectedBus.nextStop}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-[#FF6B00] block">
                        {selectedBus.etaNextStopMin} min
                      </span>
                      <span className="text-[10px] text-[#6B6B6B]">Live ETA</span>
                    </div>
                  </div>

                  {/* Crew & Contact */}
                  <div className="pt-1 text-[11px] text-[#6B6B6B] flex items-center justify-between">
                    <div>
                      <span>Driver: </span>
                      <strong className="text-[#171717]">{selectedBus.driverName}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        alert(`Direct Dispatch Radio to ${selectedBus.driverName} (${selectedBus.busNumber}): Connected.`)
                      }
                      className="inline-flex items-center gap-1 text-[#FF6B00] hover:text-[#E55F00] font-bold text-[10px] cursor-pointer"
                    >
                      <PhoneCall className="w-3 h-3" /> Contact
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      {/* Map Bottom Legend & Telemetry Ticker */}
      <div className="relative z-10 bg-neutral-900/95 backdrop-blur-md px-4 py-2.5 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-white text-xs">
        {/* Status Legend */}
        <div className="flex items-center gap-3.5 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22A06B]" />
            <span>On-Time</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A1F]" />
            <span>Delayed</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5484D]" />
            <span>Breakdown</span>
          </span>
        </div>

        {/* Real-time Tick Info */}
        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#FF6B00]" />
            <span>Updates every 3s</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline font-mono">
            {lastHeartbeat.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};
