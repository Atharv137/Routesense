import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Ticket,
  Navigation,
  Clock,
  ArrowRight,
  Sparkles,
  QrCode,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOperations } from '../../context/OperationsContext';
import { StatusBadge } from '../common/StatusBadge';
import { DigitalTicketingModal } from './DigitalTicketingModal';
import { PassengerTicketsView } from './PassengerTicketsView';
import { LiveTrackingView } from './LiveTrackingView';
import { RouteSearchView } from './RouteSearchView';

interface PassengerHomeProps {
  onNavigateTab?: (tab: string) => void;
}

export const PassengerHome: React.FC<PassengerHomeProps> = ({ onNavigateTab }) => {
  const { currentUser } = useAuth();
  const { routes, buses, tickets } = useOperations();

  const [activeSubView, setActiveSubView] = useState<'home' | 'tickets' | 'tracking' | 'search'>('home');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route_101');
  const [showTicketingModal, setShowTicketingModal] = useState(false);

  // Search input state (PRD Section 15)
  const [fromInput, setFromInput] = useState('Pune Station');
  const [toInput, setToInput] = useState('Swargate');

  const passengerTickets = tickets.filter(
    t => t.passengerId === currentUser?.uid || t.issuedByRole === 'passenger'
  );

  if (activeSubView === 'tickets') {
    return (
      <PassengerTicketsView
        onBack={() => setActiveSubView('home')}
        onOpenBookModal={() => setShowTicketingModal(true)}
      />
    );
  }

  if (activeSubView === 'tracking') {
    return (
      <LiveTrackingView
        onBack={() => setActiveSubView('home')}
        routeId={selectedRouteId}
      />
    );
  }

  if (activeSubView === 'search') {
    return (
      <RouteSearchView
        onBack={() => setActiveSubView('home')}
        onSelectRouteForBooking={routeId => {
          setSelectedRouteId(routeId);
          setShowTicketingModal(true);
        }}
        onSelectRouteForTracking={routeId => {
          setSelectedRouteId(routeId);
          setActiveSubView('tracking');
        }}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto pb-24 md:pb-12 animate-in fade-in duration-200">
      {/* Top Banner / Passenger Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF6B00]">
            RouteSense Commuter Pass
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            Where are you going?
          </h1>
          <p className="text-xs font-semibold text-[#6B6B6B] mt-0.5">
            Real-time regional bus arrival and QR ticketing
          </p>
        </div>

        {passengerTickets.length > 0 && (
          <button
            onClick={() => setActiveSubView('tickets')}
            className="px-3 py-1.5 rounded-2xl bg-orange-50 text-[#FF6B00] border border-orange-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{passengerTickets.length} Active Pass</span>
          </button>
        )}
      </div>

      {/* Destination Search Box (PRD Section 15) */}
      <div className="rs-card p-5 sm:p-6 border border-neutral-100 shadow-md bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* From Input */}
          <div className="relative md:col-span-1 lg:col-span-5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#22A06B] absolute left-3.5 top-1/2 -translate-y-1/2 ring-4 ring-emerald-100" />
            <input
              type="text"
              value={fromInput}
              onChange={e => setFromInput(e.target.value)}
              placeholder="Boarding Stop..."
              className="w-full pl-9 pr-4 py-2.5 md:py-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs sm:text-sm font-bold text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden"
            />
          </div>

          {/* Destination Input */}
          <div className="relative md:col-span-1 lg:col-span-4">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] absolute left-3.5 top-1/2 -translate-y-1/2 ring-4 ring-orange-100" />
            <input
              type="text"
              value={toInput}
              onChange={e => setToInput(e.target.value)}
              placeholder="Destination Stop..."
              className="w-full pl-9 pr-4 py-2.5 md:py-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs sm:text-sm font-bold text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden"
            />
          </div>

          {/* Search CTA Button */}
          <button
            onClick={() => setShowTicketingModal(true)}
            className="w-full md:col-span-2 lg:col-span-3 py-2.5 md:py-3 bg-[#FF6B00] hover:bg-[#E55F00] text-white rounded-xl text-xs sm:text-sm font-black shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-98"
          >
            <span className="truncate">Find Available Buses & Book</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>

      {/* 3 Quick Action Shortcuts (PRD Section 15) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        <button
          onClick={() => setShowTicketingModal(true)}
          className="rs-card rs-card-hover p-4 sm:p-5 lg:p-6 text-center border border-neutral-100 cursor-pointer flex flex-col items-center justify-center"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mb-2 sm:mb-2.5">
            <Ticket className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#171717]">Book Ticket</span>
          <span className="text-[10px] sm:text-xs text-[#6B6B6B]">Razorpay UPI</span>
        </button>

        <button
          onClick={() => (onNavigateTab ? onNavigateTab('tracking') : setActiveSubView('tracking'))}
          className="rs-card rs-card-hover p-4 sm:p-5 lg:p-6 text-center border border-neutral-100 cursor-pointer flex flex-col items-center justify-center"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 sm:mb-2.5">
            <Navigation className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#171717]">Live Tracking</span>
          <span className="text-[10px] sm:text-xs text-[#6B6B6B]">GPS ETA</span>
        </button>

        <button
          onClick={() => (onNavigateTab ? onNavigateTab('tickets') : setActiveSubView('tickets'))}
          className="rs-card rs-card-hover p-4 sm:p-5 lg:p-6 text-center border border-neutral-100 cursor-pointer flex flex-col items-center justify-center"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-[#22A06B] flex items-center justify-center mb-2 sm:mb-2.5">
            <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#171717]">My Tickets</span>
          <span className="text-[10px] sm:text-xs text-[#6B6B6B]">QR Pass</span>
        </button>
      </div>

      {/* Available Routes List (PRD Section 15) */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#6B6B6B]">
            Available Transit Corridors
          </h3>
          <button
            onClick={() => (onNavigateTab ? onNavigateTab('routes') : setActiveSubView('search'))}
            className="text-xs sm:text-sm font-bold text-[#FF6B00] hover:underline cursor-pointer"
          >
            View All ({routes.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {/* Route 101 (PRD Section 15) */}
          <div className="rs-card rs-card-hover p-5 border border-neutral-100/90 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-[#FF6B00] text-white text-xs font-black">
                    Route 101
                  </span>
                  <span className="text-sm font-black text-[#171717]">
                    Pune Station → Swargate
                  </span>
                </div>
                <StatusBadge status="on_time" size="sm" />
              </div>

              <div className="flex items-center justify-between text-xs text-[#6B6B6B] pt-2">
                <div className="flex items-center gap-1 font-bold text-[#FF6B00]">
                  <Clock className="w-4 h-4" />
                  <span>Arriving in: 8 min</span>
                </div>
                <span>Fare from ₹15</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-100">
              <button
                onClick={() => {
                  setSelectedRouteId('route_101');
                  setActiveSubView('tracking');
                }}
                className="py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" /> Live Track
              </button>
              <button
                onClick={() => {
                  setSelectedRouteId('route_101');
                  setShowTicketingModal(true);
                }}
                className="py-2.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Ticket className="w-3.5 h-3.5" /> Book Ticket
              </button>
            </div>
          </div>

          {/* Route 202 (PRD Section 15) */}
          <div className="rs-card rs-card-hover p-5 border border-neutral-100/90 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-[#3478F6] text-white text-xs font-black">
                    Route 202
                  </span>
                  <span className="text-sm font-black text-[#171717]">
                    Shivaji Nagar → Hinjewadi
                  </span>
                </div>
                <StatusBadge status="delayed" size="sm" />
              </div>

              <div className="flex items-center justify-between text-xs text-[#6B6B6B] pt-2">
                <div className="flex items-center gap-1 font-bold text-[#FF6B00]">
                  <Clock className="w-4 h-4" />
                  <span>Arriving in: 14 min</span>
                </div>
                <span>Fare from ₹25</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-100">
              <button
                onClick={() => {
                  setSelectedRouteId('route_202');
                  setActiveSubView('tracking');
                }}
                className="py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" /> Live Track
              </button>
              <button
                onClick={() => {
                  setSelectedRouteId('route_202');
                  setShowTicketingModal(true);
                }}
                className="py-2.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Ticket className="w-3.5 h-3.5" /> Book Ticket
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ticketing Modal */}
      <DigitalTicketingModal
        isOpen={showTicketingModal}
        onClose={() => setShowTicketingModal(false)}
        preselectedRouteId={selectedRouteId}
      />
    </div>
  );
};
