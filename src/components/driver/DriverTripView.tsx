import React from 'react';
import { ArrowLeft, Navigation, MapPin, Gauge, Users, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { GoogleBusMap } from '../common/GoogleBusMap';

interface DriverTripViewProps {
  onBack: () => void;
  onOpenReportModal: () => void;
}

export const DriverTripView: React.FC<DriverTripViewProps> = ({ onBack, onOpenReportModal }) => {
  const { routes, buses, trips } = useOperations();
  const { currentUser } = useAuth();

  const assignedRoute = routes.find(r => r.routeId === currentUser?.routeAssigned) || routes[0];
  const assignedBus = buses.find(b => b.driverId === currentUser?.uid || b.routeId === assignedRoute.routeId) || buses[0];
  const activeTrip = trips.find(t => t.driverId === currentUser?.uid || t.busId === assignedBus.busId) || trips[0];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B6B6B] hover:text-[#171717] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <StatusBadge status={assignedBus.status} />
      </div>

      <div>
        <h2 className="text-2xl font-black text-[#171717]">Active Driver Trip</h2>
        <p className="text-xs text-[#6B6B6B] mt-0.5">
          Bus: <span className="font-bold text-[#171717]">{assignedBus.busNumber}</span> • Route {assignedRoute.routeNumber}
        </p>
      </div>

      {/* Live In-Cab Google Map */}
      <GoogleBusMap
        buses={[assignedBus]}
        routes={[assignedRoute]}
        selectedRouteId={assignedRoute.routeId}
        selectedBusId={assignedBus.busId}
        heightClass="h-[300px] sm:h-[360px]"
      />

      {/* Speedometer & Live Telemetry Card */}

      <div className="rs-card p-6 border border-neutral-100/90 text-center relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">GPS Telemetry</span>
          <span className="text-[11px] font-bold text-[#22A06B] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#22A06B] animate-ping" /> Live Tracking Active
          </span>
        </div>

        <div className="my-3">
          <div className="text-5xl sm:text-6xl font-black text-[#171717] tracking-tight">
            {assignedBus.currentSpeed}
            <span className="text-base sm:text-lg font-bold text-[#6B6B6B] ml-1">km/h</span>
          </div>
          <p className="text-xs font-semibold text-[#6B6B6B] mt-1">Current Cruising Speed</p>
        </div>

        {/* 3 Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-100 mt-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6B6B]">Next Stop</span>
            <p className="text-xs font-bold text-[#171717] truncate">{assignedBus.nextStop}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6B6B]">ETA</span>
            <p className="text-xs font-bold text-[#FF6B00]">{assignedBus.etaNextStopMin} mins</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6B6B]">Current Load</span>
            <p className="text-xs font-bold text-[#171717]">{assignedBus.currentLoad}%</p>
          </div>
        </div>
      </div>

      {/* Action to Report Issue immediately */}
      <button
        onClick={onOpenReportModal}
        className="w-full py-4 bg-[#E5484D] hover:bg-[#c93b40] text-white rounded-2xl font-bold text-sm shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
      >
        <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
        <span>Report Issue on this Corridor</span>
      </button>

      {/* Scheduled Stops Timeline */}
      <div className="rs-card p-5 border border-neutral-100">
        <h3 className="text-sm font-bold text-[#171717] mb-4">Route Schedule & Waypoints</h3>
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
          {assignedRoute.scheduledStops.map((stop, idx) => (
            <div key={stop.stopId} className="relative flex items-center justify-between text-xs">
              <div className="absolute -left-6 w-4 h-4 rounded-full bg-neutral-300 border-2 border-white" />
              <span className="font-semibold text-neutral-800">{stop.name}</span>
              <span className="text-neutral-500 font-mono">Stop #{idx + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
