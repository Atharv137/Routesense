import React, { useState } from 'react';
import {
  Ticket,
  Users,
  Navigation,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle,
  PlusCircle,
  Banknote,
  Bus,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOperations } from '../../context/OperationsContext';
import { TicketLoggerModal } from './TicketLoggerModal';
import { ShiftSummaryView } from './ShiftSummaryView';
import { TicketHistoryView } from './TicketHistoryView';

interface ConductorHomeProps {
  onNavigateTab?: (tab: string) => void;
}

export const ConductorHome: React.FC<ConductorHomeProps> = ({ onNavigateTab }) => {
  const { currentUser } = useAuth();
  const { routes, trips, tickets, buses } = useOperations();

  const [activeSubView, setActiveSubView] = useState<'home' | 'shift' | 'history'>('home');
  const [showLoggerModal, setShowLoggerModal] = useState(false);

  const assignedRoute = routes.find(r => r.routeId === currentUser?.routeAssigned) || routes[0];
  const activeTrip = trips.find(t => t.conductorId === currentUser?.uid || t.routeId === assignedRoute.routeId) || trips[0];
  const activeBus = buses.find(b => b.busId === activeTrip.busId) || buses[0];

  const conductorTicketsToday = tickets.filter(
    t => t.conductorId === currentUser?.uid || t.issuedByRole === 'conductor' || !t.conductorId
  );

  const ticketsCountToday = conductorTicketsToday.length || 86;
  const currentLoad = activeTrip?.passengerLoad || 68;

  if (activeSubView === 'shift') {
    return <ShiftSummaryView onBack={() => setActiveSubView('home')} />;
  }

  if (activeSubView === 'history') {
    return (
      <TicketHistoryView
        onBack={() => setActiveSubView('home')}
        onOpenLogModal={() => setShowLoggerModal(true)}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* Greeting Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            Good Morning, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Anita'} 👋
          </h1>
          <p className="text-xs font-semibold text-[#6B6B6B] mt-0.5">
            Shift Active • Conductor ID: <span className="text-[#171717]">{currentUser?.employeeId || 'CND-8821'}</span>
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#22A06B]/10 text-[#22A06B] border border-[#22A06B]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22A06B] animate-pulse" />
          On Duty
        </span>
      </div>

      {/* Assigned Route & Current Trip Hero Card */}
      <div className="rs-card p-5 sm:p-6 border border-neutral-100/90 shadow-md">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B6B6B]">
              Assigned Route
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-xl sm:text-2xl font-black text-[#171717]">
                Route {assignedRoute.routeNumber}
              </h2>
              <span className="text-xs font-semibold text-[#6B6B6B] hidden sm:inline">
                ({assignedRoute.routeName})
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-[#6B6B6B]">Bus Unit</span>
            <div className="text-xs font-extrabold font-mono bg-neutral-100 px-2.5 py-1 rounded-xl text-neutral-800 mt-0.5">
              {activeTrip.busNumber}
            </div>
          </div>
        </div>

        {/* Current Trip Segment */}
        <div className="pt-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF6B00]">
              Current Trip
            </span>
            <div className="text-base sm:text-lg font-bold text-[#171717] mt-0.5 flex items-center gap-1.5">
              <span>{assignedRoute.startPoint.split(' ')[0]}</span>
              <span className="text-neutral-400">→</span>
              <span>{assignedRoute.endPoint.split(' ')[0]}</span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-0.5">
              Next Stop: <span className="font-semibold text-neutral-800">{activeBus.nextStop}</span>
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
            <Navigation className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Two Main Key Metric Cards (PRD Section 8) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Tickets Today */}
        <div className="rs-card p-5 border border-neutral-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6B6B6B]">Tickets Today</span>
            <div className="w-7 h-7 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
              <Ticket className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#171717]">
            {ticketsCountToday}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#22A06B] mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12 on this trip</span>
          </div>
        </div>

        {/* Passenger Load */}
        <div className="rs-card p-5 border border-neutral-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6B6B6B]">Passenger Load</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#22A06B] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#171717]">
            {currentLoad}%
          </div>
          {/* Progress bar */}
          <div className="w-full bg-neutral-100 rounded-full h-2 mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                currentLoad > 85
                  ? 'bg-[#E5484D]'
                  : currentLoad > 65
                  ? 'bg-[#FF6B00]'
                  : 'bg-[#22A06B]'
              }`}
              style={{ width: `${currentLoad}%` }}
            />
          </div>
        </div>
      </div>

      {/* PRIMARY CTA: Log Ticket (< 10-15s) */}
      <button
        onClick={() => setShowLoggerModal(true)}
        className="w-full py-4 sm:py-5 bg-gradient-to-r from-[#FF6B00] to-[#FF8A1F] hover:from-[#E55F00] hover:to-[#FF6B00] text-white rounded-3xl font-extrabold text-base sm:text-lg shadow-xl shadow-orange-500/25 flex items-center justify-center gap-3 cursor-pointer transition-all hover:scale-[1.01] active:scale-98"
      >
        <PlusCircle className="w-6 h-6 stroke-[2.5]" />
        <span>Log Ticket (10s Fast Entry)</span>
      </button>

      {/* Quick Action Tiles (PRD Section 8) */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#6B6B6B]">
          Quick Actions
        </span>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setShowLoggerModal(true)}
            className="rs-card rs-card-hover p-4 text-center border border-neutral-100 cursor-pointer flex flex-col items-center justify-center"
          >
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mb-2">
              <Ticket className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#171717]">Log Ticket</span>
            <span className="text-[10px] text-[#6B6B6B]">Instant form</span>
          </button>

          <button
            onClick={() => (onNavigateTab ? onNavigateTab('trips') : setActiveSubView('shift'))}
            className="rs-card rs-card-hover p-4 text-center border border-neutral-100 cursor-pointer flex flex-col items-center justify-center"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#22A06B] flex items-center justify-center mb-2">
              <Banknote className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#171717]">Shift Total</span>
            <span className="text-[10px] text-[#6B6B6B]">Reconciliation</span>
          </button>

          <button
            onClick={() => (onNavigateTab ? onNavigateTab('history') : setActiveSubView('history'))}
            className="rs-card rs-card-hover p-4 text-center border border-neutral-100 cursor-pointer flex flex-col items-center justify-center"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#171717]">Ticket Logs</span>
            <span className="text-[10px] text-[#6B6B6B]">Today's list</span>
          </button>
        </div>
      </div>

      {/* Live Route Stops Progress */}
      <div className="rs-card p-5 border border-neutral-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#171717]">Live Trip Stops Progress</h3>
          <span className="text-[11px] text-[#FF6B00] font-bold">
            Stop {activeTrip.currentStopIndex} of {assignedRoute.scheduledStops.length}
          </span>
        </div>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
          {assignedRoute.scheduledStops.map((stop, idx) => {
            const isPassed = idx < activeTrip.currentStopIndex;
            const isCurrent = idx === activeTrip.currentStopIndex;
            return (
              <div key={stop.stopId} className="relative flex items-center justify-between text-xs">
                <div
                  className={`absolute -left-6 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                    isPassed
                      ? 'bg-[#22A06B]'
                      : isCurrent
                      ? 'bg-[#FF6B00] ring-4 ring-[#FF6B00]/20'
                      : 'bg-neutral-300'
                  }`}
                />
                <span className={`font-semibold ${isCurrent ? 'text-[#FF6B00] font-bold' : isPassed ? 'text-neutral-500' : 'text-[#171717]'}`}>
                  {stop.name} {stop.isMajor && '★'}
                </span>
                <span className="text-[11px] text-[#6B6B6B] font-mono">
                  {isPassed ? 'Passed' : isCurrent ? 'Next' : `+${stop.etaMinutes}m`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticket Modal */}
      <TicketLoggerModal
        isOpen={showLoggerModal}
        onClose={() => setShowLoggerModal(false)}
      />
    </div>
  );
};
