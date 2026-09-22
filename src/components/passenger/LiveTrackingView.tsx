import React, { useState } from 'react';
import { ArrowLeft, Navigation, Clock, MapPin, Bus, Users, ShieldCheck, RefreshCw } from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { StatusBadge } from '../common/StatusBadge';
import { GoogleBusMap } from '../common/GoogleBusMap';

interface LiveTrackingViewProps {
  onBack?: () => void;
  routeId?: string;
}

export const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({ onBack, routeId = 'route_101' }) => {
  const { routes, buses, trips } = useOperations();
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routeId);

  const activeRoute = routes.find(r => r.routeId === selectedRouteId) || routes[0];
  const activeBus = buses.find(b => b.routeId === activeRoute.routeId) || buses[0];
  const activeTrip = trips.find(t => t.routeId === activeRoute.routeId) || trips[0];

  const stops = activeRoute.scheduledStops;

  // Calculate ETA clock time (e.g. 4:42 PM)
  const etaMinutes = activeBus.etaNextStopMin || 8;
  const arrivalDate = new Date(Date.now() + etaMinutes * 60 * 1000);
  const formattedArrival = arrivalDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B6B6B] hover:text-[#171717] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#22A06B]/10 text-[#22A06B] border border-[#22A06B]/20">
          <span className="w-2 h-2 rounded-full bg-[#22A06B] animate-ping" />
          Live Google Maps GPS
        </span>
      </div>

      {/* Corridor Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {routes.map(r => (
          <button
            key={r.routeId}
            onClick={() => setSelectedRouteId(r.routeId)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedRouteId === r.routeId
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Route {r.routeNumber}
          </button>
        ))}
      </div>

      {/* Real-time Google Bus Map */}
      <GoogleBusMap
        buses={buses.filter(b => b.routeId === activeRoute.routeId)}
        routes={[activeRoute]}
        selectedRouteId={activeRoute.routeId}
        selectedBusId={activeBus.busId}
        heightClass="h-[340px] sm:h-[400px]"
      />

      {/* Header & Status (PRD Section 17 & 18) */}
      <div className="rs-card p-6 border border-neutral-100 shadow-md space-y-4">

        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF6B00]">
              Active Corridor
            </span>
            <h2 className="text-xl font-black text-[#171717]">
              Route {activeRoute.routeNumber} ({activeRoute.startPoint.split(' ')[0]} → {activeRoute.endPoint.split(' ')[0]})
            </h2>
          </div>
          <StatusBadge status={activeBus.status} />
        </div>

        {/* Big ETA Callout (PRD Section 18) */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B6B6B]">
              Arriving In
            </span>
            <div className="text-3xl font-black text-[#FF6B00] mt-0.5">
              {etaMinutes} min
            </div>
            <span className="text-[10px] text-[#6B6B6B]">3 stops away</span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B6B6B]">
              Expected Arrival
            </span>
            <div className="text-2xl font-black text-[#171717] mt-1">
              {formattedArrival}
            </div>
            <span className="text-[10px] text-[#22A06B] font-bold">On Schedule</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#6B6B6B] pt-1">
          <span>Next Stop: <strong className="text-[#171717]">{activeBus.nextStop}</strong></span>
          <span>Bus Plate: <strong className="font-mono text-[#171717]">{activeBus.busNumber}</strong></span>
        </div>
      </div>

      {/* Stop Progression Timeline (PRD Section 17 & 18) */}
      <div className="rs-card p-6 border border-neutral-100 space-y-4">
        <h3 className="text-sm font-bold text-[#171717]">Route Waypoints & Progress</h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
          {stops.map((stop, idx) => {
            const isPassed = idx < activeTrip.currentStopIndex;
            const isCurrent = idx === activeTrip.currentStopIndex;
            return (
              <div key={stop.stopId} className="relative flex items-center justify-between text-xs">
                <div
                  className={`absolute -left-6 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                    isPassed
                      ? 'bg-[#22A06B]'
                      : isCurrent
                      ? 'bg-[#FF6B00] ring-4 ring-[#FF6B00]/25'
                      : 'bg-neutral-300'
                  }`}
                />
                <div>
                  <div className={`font-bold ${isCurrent ? 'text-[#FF6B00]' : isPassed ? 'text-neutral-500' : 'text-[#171717]'}`}>
                    {stop.name} {stop.isMajor && '★'}
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-[#FF6B00] block mt-0.5">
                      ● Bus currently approaching
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-[#6B6B6B]">
                  {isPassed ? 'Passed' : isCurrent ? `${etaMinutes} min` : `+${stop.etaMinutes} min`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
