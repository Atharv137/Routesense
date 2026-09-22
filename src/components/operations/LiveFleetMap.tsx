import React, { useState } from 'react';
import { Bus, MapPin, Gauge, Users, Clock, AlertTriangle, ArrowLeft, RefreshCw, PhoneCall, Radio, Crosshair } from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { StatusBadge } from '../common/StatusBadge';
import { Bus as BusType } from '../../types';
import { GoogleBusMap } from '../common/GoogleBusMap';

interface LiveFleetMapProps {
  onBack?: () => void;
}

export const LiveFleetMap: React.FC<LiveFleetMapProps> = ({ onBack }) => {
  const { buses, routes } = useOperations();
  const [selectedRouteId, setSelectedRouteId] = useState<string>('all');
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null);

  const filteredBuses = buses.filter(
    b => selectedRouteId === 'all' || b.routeId === selectedRouteId
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B6B6B] hover:text-[#171717] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#22A06B]/10 text-[#22A06B] border border-[#22A06B]/20">
            <span className="w-2 h-2 rounded-full bg-[#22A06B] animate-ping" />
            Live GPS Stream (3s Interval)
          </span>
        </div>
      </div>

      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#171717]">Live Fleet Visibility & Tracking</h2>
        <p className="text-xs text-[#6B6B6B] mt-0.5">
          Real-time Google Maps telemetry, vehicle locations, live speed, passenger occupancy, and corridor routing
        </p>
      </div>

      {/* Corridor Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => {
            setSelectedRouteId('all');
            setSelectedBus(null);
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
            selectedRouteId === 'all'
              ? 'bg-[#FF6B00] text-white shadow-xs'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          All Fleets ({buses.length})
        </button>
        {routes.map(r => (
          <button
            key={r.routeId}
            onClick={() => {
              setSelectedRouteId(r.routeId);
              setSelectedBus(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedRouteId === r.routeId
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            Route {r.routeNumber}
          </button>
        ))}
      </div>

      {/* Interactive Google Map with Live Buses */}
      <GoogleBusMap
        buses={filteredBuses}
        routes={routes}
        selectedRouteId={selectedRouteId}
        onSelectRouteId={setSelectedRouteId}
        selectedBusId={selectedBus?.busId}
        onSelectBus={setSelectedBus}
        heightClass="h-[460px] sm:h-[540px]"
      />

      {/* Active Bus Fleet Quick Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#171717]">
            Active Vehicles on Duty ({filteredBuses.length})
          </h3>
          <span className="text-[11px] text-[#6B6B6B]">
            Tap any bus to focus on Google Map
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {filteredBuses.map(bus => {
            const isSelected = selectedBus?.busId === bus.busId;
            return (
              <div
                key={bus.busId}
                onClick={() => setSelectedBus(isSelected ? null : bus)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-orange-50/70 border-[#FF6B00] shadow-md ring-2 ring-[#FF6B00]/40'
                    : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono font-bold bg-neutral-900 px-2 py-0.5 rounded text-white">
                    {bus.busNumber}
                  </span>
                  <StatusBadge status={bus.status} size="sm" />
                </div>

                <div className="text-sm font-black text-[#171717] truncate">
                  Route {bus.routeNumber}
                </div>
                <div className="text-[11px] text-[#6B6B6B] truncate">
                  Next: <strong className="text-neutral-800">{bus.nextStop}</strong>
                </div>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-neutral-100 text-[10px]">
                  <span className="text-neutral-600 font-mono">{bus.currentSpeed} km/h</span>
                  <span className="text-[#FF6B00] font-bold">{bus.currentLoad}% Load</span>
                  <span className="text-neutral-600 font-bold">ETA {bus.etaNextStopMin}m</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* Selected Bus Inspection Card */}
      {selectedBus && (
        <div className="rs-card p-5 border border-neutral-200/90 shadow-md animate-in slide-in-from-bottom-2 duration-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-[#171717]">
                  Bus {selectedBus.busNumber} — Route {selectedBus.routeNumber}
                </h3>
                <StatusBadge status={selectedBus.status} size="sm" />
              </div>
              <p className="text-xs text-[#6B6B6B]">{selectedBus.routeName}</p>
            </div>
            <button
              onClick={() => alert(`Calling driver ${selectedBus.driverName}: +91 98221 77662`)}
              className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call Driver ({selectedBus.driverName.split(' ')[0]})
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
              <span className="text-[10px] font-bold text-[#6B6B6B] uppercase">Driver Assigned</span>
              <p className="text-xs font-bold text-[#171717]">{selectedBus.driverName}</p>
            </div>
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
              <span className="text-[10px] font-bold text-[#6B6B6B] uppercase">Conductor</span>
              <p className="text-xs font-bold text-[#171717]">{selectedBus.conductorName}</p>
            </div>
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
              <span className="text-[10px] font-bold text-[#6B6B6B] uppercase">Live Speed</span>
              <p className="text-xs font-bold text-[#171717] font-mono">{selectedBus.currentSpeed} km/h</p>
            </div>
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
              <span className="text-[10px] font-bold text-[#6B6B6B] uppercase">Passenger Capacity</span>
              <p className="text-xs font-bold text-[#171717]">{selectedBus.currentPassengers} / {selectedBus.capacity} ({selectedBus.currentLoad}%)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
