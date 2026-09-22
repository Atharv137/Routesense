import React, { useState } from 'react';
import {
  AlertTriangle,
  Bus,
  Navigation,
  Clock,
  MapPin,
  CheckCircle,
  Gauge,
  Users,
  ShieldCheck,
  PhoneCall,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOperations } from '../../context/OperationsContext';
import { StatusBadge } from '../common/StatusBadge';
import { ReportIncidentModal } from './ReportIncidentModal';
import { IncidentHistoryView } from './IncidentHistoryView';
import { DriverTripView } from './DriverTripView';

interface DriverHomeProps {
  onNavigateTab?: (tab: string) => void;
}

export const DriverHome: React.FC<DriverHomeProps> = ({ onNavigateTab }) => {
  const { currentUser } = useAuth();
  const { routes, buses, trips, incidents } = useOperations();

  const [activeSubView, setActiveSubView] = useState<'home' | 'trip' | 'history'>('home');
  const [showReportModal, setShowReportModal] = useState(false);

  const assignedRoute = routes.find(r => r.routeId === currentUser?.routeAssigned) || routes[0];
  const assignedBus = buses.find(b => b.driverId === currentUser?.uid || b.routeId === assignedRoute.routeId) || buses[0];
  const activeTrip = trips.find(t => t.driverId === currentUser?.uid || t.busId === assignedBus.busId) || trips[0];

  const recentDriverIncidents = incidents.filter(
    i => i.driverId === currentUser?.uid || i.routeId === assignedRoute.routeId
  );

  if (activeSubView === 'trip') {
    return (
      <DriverTripView
        onBack={() => setActiveSubView('home')}
        onOpenReportModal={() => setShowReportModal(true)}
      />
    );
  }

  if (activeSubView === 'history') {
    return (
      <IncidentHistoryView
        onBack={() => setActiveSubView('home')}
        onOpenReportModal={() => setShowReportModal(true)}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* Driver Greeting Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            Good Morning, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Ramesh'} 👋
          </h1>
          <p className="text-xs font-semibold text-[#6B6B6B] mt-0.5">
            Driver ID: <span className="text-[#171717]">{currentUser?.employeeId || 'DRV-4412'}</span> • Depot Shift #1
          </p>
        </div>
        <StatusBadge status="on_duty" />
      </div>

      {/* Hero Card: Assigned Route & Current Trip (PRD Section 9) */}
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
            <span className="text-[11px] font-bold text-[#6B6B6B]">Vehicle Plate</span>
            <div className="text-xs font-extrabold font-mono bg-neutral-900 text-white px-3 py-1 rounded-xl mt-0.5">
              {assignedBus.busNumber}
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
              Next Stop: <span className="font-semibold text-neutral-800">{assignedBus.nextStop}</span> ({assignedBus.etaNextStopMin} min)
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B6B6B] block mb-1">
              Status
            </span>
            <StatusBadge status={assignedBus.status === 'on_time' ? 'on_route' : assignedBus.status} />
          </div>
        </div>
      </div>

      {/* Driver Telemetry 2-Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Speed */}
        <div className="rs-card p-5 border border-neutral-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6B6B6B]">Cruising Speed</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Gauge className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#171717]">
            {assignedBus.currentSpeed}
            <span className="text-xs font-bold text-[#6B6B6B] ml-1">km/h</span>
          </div>
          <span className="text-[10px] text-[#22A06B] font-bold mt-1 block">Optimal Speed Zone</span>
        </div>

        {/* Bus Status */}
        <div className="rs-card p-5 border border-neutral-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6B6B6B]">Passenger Load</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#22A06B] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#171717]">
            {assignedBus.currentLoad}%
          </div>
          <span className="text-[10px] text-[#6B6B6B] font-medium mt-1 block">
            {assignedBus.currentPassengers} / {assignedBus.capacity} seated
          </span>
        </div>
      </div>

      {/* PRIMARY CTA: Report Issue (PRD Section 9) */}
      <button
        onClick={() => setShowReportModal(true)}
        className="w-full py-4 sm:py-5 bg-gradient-to-r from-[#E5484D] to-[#FF6B00] hover:from-[#c93b40] hover:to-[#E55F00] text-white rounded-3xl font-extrabold text-base sm:text-lg shadow-xl shadow-rose-500/25 flex items-center justify-center gap-3 cursor-pointer transition-all hover:scale-[1.01] active:scale-98"
      >
        <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
        <span>Report Issue (Delay / Breakdown / Obstruction)</span>
      </button>

      {/* Quick Action Tiles (PRD Section 9) */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#6B6B6B]">
          Quick Actions
        </span>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setShowReportModal(true)}
            className="rs-card rs-card-hover p-4 text-center border border-neutral-100 cursor-pointer flex flex-col items-center justify-center"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#E5484D] flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#171717]">Report Issue</span>
            <span className="text-[10px] text-[#6B6B6B]">Instant broadcast</span>
          </button>

          <button
            onClick={() => (onNavigateTab ? onNavigateTab('trips') : setActiveSubView('trip'))}
            className="rs-card rs-card-hover p-4 text-center border border-neutral-100 cursor-pointer flex flex-col items-center justify-center"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <Navigation className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#171717]">My Trip</span>
            <span className="text-[10px] text-[#6B6B6B]">GPS Telemetry</span>
          </button>

          <button
            onClick={() => (onNavigateTab ? onNavigateTab('issues') : setActiveSubView('history'))}
            className="rs-card rs-card-hover p-4 text-center border border-neutral-100 cursor-pointer flex flex-col items-center justify-center"
          >
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#171717]">Incident Log</span>
            <span className="text-[10px] text-[#6B6B6B]">Past reports</span>
          </button>
        </div>
      </div>

      {/* Operations Control Hotline Quick Bar */}
      <div className="p-4 rounded-2xl bg-neutral-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#FF8A1F]">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold">Depot Dispatch Hotline</div>
            <div className="text-[10px] text-neutral-400">Emergency & route controller line</div>
          </div>
        </div>
        <button
          onClick={() => alert('Dialing Operations Dispatch: +91 20 2612 0000')}
          className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
        >
          Call Control
        </button>
      </div>

      {/* Report Modal */}
      <ReportIncidentModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
};
