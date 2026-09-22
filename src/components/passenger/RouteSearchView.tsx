import React, { useState } from 'react';
import { Search, MapPin, ArrowRight, ArrowLeft, Clock, Ticket, Navigation, CheckCircle } from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { StatusBadge } from '../common/StatusBadge';
import { DigitalTicketingModal } from './DigitalTicketingModal';

interface RouteSearchViewProps {
  onBack?: () => void;
  onSelectRouteForBooking?: (routeId: string) => void;
  onSelectRouteForTracking?: (routeId: string) => void;
}

export const RouteSearchView: React.FC<RouteSearchViewProps> = ({
  onBack,
  onSelectRouteForBooking,
  onSelectRouteForTracking,
}) => {
  const { routes } = useOperations();
  const [search, setSearch] = useState('');
  const [bookingRouteId, setBookingRouteId] = useState<string | null>(null);

  const handleBooking = (routeId: string) => {
    if (onSelectRouteForBooking) {
      onSelectRouteForBooking(routeId);
    } else {
      setBookingRouteId(routeId);
    }
  };

  const handleTracking = (routeId: string) => {
    if (onSelectRouteForTracking) {
      onSelectRouteForTracking(routeId);
    }
  };

  const filteredRoutes = routes.filter(
    r =>
      r.routeNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.routeName.toLowerCase().includes(search.toLowerCase()) ||
      r.scheduledStops.some(s => s.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B6B6B] hover:text-[#171717] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        )}
        <span className="text-xs font-bold text-neutral-600">Transit Network Search</span>
      </div>

      <div>
        <h2 className="text-2xl font-black text-[#171717]">Find Transit Corridors</h2>
        <p className="text-xs text-[#6B6B6B] mt-0.5">
          Search regional bus routes, stops, schedules, and fares across Pune
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by stop name (e.g. Swargate, Hinjewadi, Katraj)..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-neutral-200 text-xs font-medium text-[#171717] focus:border-[#FF6B00] outline-hidden shadow-xs"
        />
      </div>

      {/* Routes list */}
      <div className="space-y-4">
        {filteredRoutes.map(r => (
          <div key={r.routeId} className="rs-card p-5 border border-neutral-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-[#FF6B00] text-white text-xs font-black">
                  Route {r.routeNumber}
                </span>
                <span className="text-xs font-bold text-[#171717]">{r.routeName}</span>
              </div>
              <StatusBadge status="on_time" size="sm" />
            </div>

            <div className="text-xs text-[#6B6B6B]">
              <strong>Frequency:</strong> Every {r.frequencyMin} mins • Fare from ₹{r.baseFare} • {r.scheduledStops.length} stops
            </div>

            {/* Stops preview */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {r.scheduledStops.map((stop, idx) => (
                <React.Fragment key={stop.stopId}>
                  <span className="px-2 py-0.5 rounded-lg bg-neutral-100 text-[10px] font-semibold text-neutral-700 shrink-0">
                    {stop.name}
                  </span>
                  {idx < r.scheduledStops.length - 1 && <span className="text-neutral-400 text-xs">→</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
              <button
                onClick={() => handleTracking(r.routeId)}
                className="py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" /> Track Live Bus
              </button>
              <button
                onClick={() => handleBooking(r.routeId)}
                className="py-2.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Ticket className="w-3.5 h-3.5" /> Book Ticket
              </button>
            </div>
          </div>
        ))}
      </div>

      {bookingRouteId && (
        <DigitalTicketingModal
          isOpen={!!bookingRouteId}
          onClose={() => setBookingRouteId(null)}
          preselectedRouteId={bookingRouteId}
        />
      )}
    </div>
  );
};
