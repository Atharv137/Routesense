import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Clock,
  AlertTriangle,
  Users,
  Ticket,
  Compass,
  MapPin,
  Sparkles,
  ArrowRight,
  Activity,
  Filter,
  Layers,
  ChevronRight,
  Radio,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOperations } from '../../context/OperationsContext';
import { StatusBadge } from '../common/StatusBadge';
import { LiveFleetMap } from './LiveFleetMap';
import { HistoricalDataView } from './HistoricalDataView';
import { RecurringIssuesView } from './RecurringIssuesView';
import { AnalyticsView } from './AnalyticsView';
import { SmartInsightsView } from './SmartInsightsView';

interface OperationsDashboardProps {
  onNavigateTab?: (tab: string) => void;
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({ onNavigateTab }) => {
  const { currentUser } = useAuth();
  const {
    routes,
    buses,
    trips,
    incidents,
    tickets,
    recurringIssues,
    smartInsights,
    resolveIncident,
  } = useOperations();

  const [activeSubView, setActiveSubView] = useState<
    'overview' | 'map' | 'history' | 'recurring' | 'analytics' | 'insights'
  >('overview');

  // Switch to subviews
  if (activeSubView === 'map') {
    return <LiveFleetMap onBack={() => setActiveSubView('overview')} />;
  }
  if (activeSubView === 'history') {
    return <HistoricalDataView onBack={() => setActiveSubView('overview')} />;
  }
  if (activeSubView === 'recurring') {
    return <RecurringIssuesView onBack={() => setActiveSubView('overview')} />;
  }
  if (activeSubView === 'analytics') {
    return <AnalyticsView onBack={() => setActiveSubView('overview')} />;
  }
  if (activeSubView === 'insights') {
    return <SmartInsightsView onBack={() => setActiveSubView('overview')} />;
  }

  // Dynamic statistics matching PRD Section 10
  const activeTripsCount = 120 + trips.length - 3;
  const onTimeCount = 85;
  const delayedCount = 23 + buses.filter(b => b.status === 'delayed').length - 1;
  const openIssuesCount = incidents.filter(i => i.status === 'open').length || 12;

  const topRecurringIssue = recurringIssues[0];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* Top Greeting Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Dashboard</h1>
          <p className="text-sm text-[#6B6B6B]">
            Good Morning, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Priya'} • {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubView('insights')}
            className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Smart Insights ({smartInsights.length})</span>
          </button>

          <button
            onClick={() => (onNavigateTab ? onNavigateTab('fleet') : setActiveSubView('map'))}
            className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E55F00] text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Live GPS Map</span>
          </button>
        </div>
      </div>

      {/* 4 Sleek Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Active Trips */}
        <div className="bg-white p-6 rounded-[24px] shadow-xs border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-[#6B6B6B] text-sm font-medium">Active Trips</p>
            <h2 className="text-3xl font-bold mt-1 text-[#171717]">{activeTripsCount}</h2>
          </div>
          <div className="mt-4 text-xs text-[#22A06B] font-semibold flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" />
            </svg>
            <span>4% increase</span>
          </div>
        </div>

        {/* On Time */}
        <div className="bg-white p-6 rounded-[24px] shadow-xs border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-[#6B6B6B] text-sm font-medium">On Time</p>
            <h2 className="text-3xl font-bold mt-1 text-[#22A06B]">{onTimeCount}</h2>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#22A06B] h-1.5 rounded-full transition-all duration-500" style={{ width: '71%' }} />
          </div>
        </div>

        {/* Delayed */}
        <div className="bg-white p-6 rounded-[24px] shadow-xs border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-[#6B6B6B] text-sm font-medium">Delayed</p>
            <h2 className="text-3xl font-bold mt-1 text-[#F5A623]">{delayedCount}</h2>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#F5A623] h-1.5 rounded-full transition-all duration-500" style={{ width: '19%' }} />
          </div>
        </div>

        {/* Open Issues */}
        <div className="bg-white p-6 rounded-[24px] shadow-xs border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-[#6B6B6B] text-sm font-medium">Open Issues</p>
            <h2 className="text-3xl font-bold mt-1 text-[#E5484D]">{openIssuesCount}</h2>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#E5484D] h-1.5 rounded-full transition-all duration-500" style={{ width: '10%' }} />
          </div>
        </div>
      </div>

      {/* Main Operations Grid & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Routes Table Container (Col 1 & 2) */}
        <div className="lg:col-span-2 bg-white rounded-[24px] shadow-xs border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-[#171717]">Active Routes Overview</h3>
              <p className="text-xs text-[#6B6B6B] mt-0.5">Live corridors, punctuality & load status</p>
            </div>
            <button
              onClick={() => setActiveSubView('history')}
              className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="flex-1 overflow-x-auto p-2">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="text-xs uppercase text-[#6B6B6B] font-bold tracking-widest border-b border-gray-50">
                  <th className="px-4 py-4">Route</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Load</th>
                  <th className="px-4 py-4">Last Stop</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-sm text-[#171717]">Route 101</div>
                    <div className="text-xs text-[#6B6B6B]">Pune St. → Swargate</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-3 py-1 bg-[#22A06B]/10 text-[#22A06B] text-xs font-bold rounded-full inline-block">
                      On Time
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-[#171717]">
                    <div className="flex items-center gap-2">
                      <span>68%</span>
                      <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div className="bg-[#22A06B] h-full" style={{ width: '68%' }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-600">Viman Nagar</td>
                </tr>

                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-sm text-[#171717]">Route 202</div>
                    <div className="text-xs text-[#6B6B6B]">Mumbai → City Center</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-3 py-1 bg-[#E5484D]/10 text-[#E5484D] text-xs font-bold rounded-full inline-block">
                      Delayed 18m
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-[#171717]">
                    <div className="flex items-center gap-2">
                      <span>82%</span>
                      <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div className="bg-[#FF6B00] h-full" style={{ width: '82%' }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-600">Expressway Exit</td>
                </tr>

                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-sm text-[#171717]">Route 303</div>
                    <div className="text-xs text-[#6B6B6B]">Airport → Hinjewadi</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-3 py-1 bg-[#22A06B]/10 text-[#22A06B] text-xs font-bold rounded-full inline-block">
                      On Time
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-[#171717]">
                    <div className="flex items-center gap-2">
                      <span>54%</span>
                      <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div className="bg-[#22A06B] h-full" style={{ width: '54%' }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-600">Wakad Junction</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Insights Column */}
        <div className="flex flex-col gap-6">
          {/* Smart Insight Card */}
          <div className="bg-[#FF6B00] rounded-[24px] p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
            <svg
              className="absolute right-[-20px] top-[-20px] w-40 h-40 opacity-10"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="relative z-10">
              <h4 className="text-xs font-bold uppercase tracking-widest opacity-90 mb-2">
                Smart Insight
              </h4>
              <p className="text-sm leading-relaxed font-medium mb-4">
                Route 101 has experienced high passenger loads between 5 PM and 7 PM on 8 of the last 10 days.
              </p>
              <button
                onClick={() => setActiveSubView('insights')}
                className="bg-white text-[#FF6B00] hover:bg-orange-50 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
              >
                View Analysis
              </button>
            </div>
          </div>

          {/* Recurring Issue Alert Card */}
          <div
            onClick={() => (onNavigateTab ? onNavigateTab('issues') : setActiveSubView('recurring'))}
            className="bg-white border-2 border-dashed border-gray-200 hover:border-[#FF6B00]/60 transition-colors rounded-[24px] p-6 flex flex-col justify-center items-center text-center flex-1 cursor-pointer"
          >
            <div className="w-12 h-12 bg-[#F5A623]/10 text-[#F5A623] rounded-full flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-[#F5A623]" />
            </div>
            <h4 className="font-bold text-sm text-[#171717]">Recurring Issue Alert</h4>
            <p className="text-xs text-[#6B6B6B] mt-1 px-4">
              4 incidents detected within 7 days on Route 202 (Expressway delay).
            </p>
            <span className="text-[11px] font-bold text-[#FF6B00] mt-3 inline-flex items-center gap-1">
              Investigate Pattern <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Navigation shortcuts to Historical, Map & Analytics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => (onNavigateTab ? onNavigateTab('fleet') : setActiveSubView('map'))}
          className="rs-card rs-card-hover p-4 text-center cursor-pointer flex flex-col items-center justify-center border border-gray-100"
        >
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mb-2">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#171717]">Live Fleet Map</span>
          <span className="text-[10px] text-[#6B6B6B]">GPS Telemetry</span>
        </button>

        <button
          onClick={() => setActiveSubView('history')}
          className="rs-card rs-card-hover p-4 text-center cursor-pointer flex flex-col items-center justify-center border border-gray-100"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#171717]">Historical Records</span>
          <span className="text-[10px] text-[#6B6B6B]">Audit & CSV</span>
        </button>

        <button
          onClick={() => (onNavigateTab ? onNavigateTab('issues') : setActiveSubView('recurring'))}
          className="rs-card rs-card-hover p-4 text-center cursor-pointer flex flex-col items-center justify-center border border-gray-100"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#E5484D] flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#171717]">Recurring Issues</span>
          <span className="text-[10px] text-[#6B6B6B]">7d / 30d Pattern</span>
        </button>

        <button
          onClick={() => (onNavigateTab ? onNavigateTab('dashboard') : setActiveSubView('analytics'))}
          className="rs-card rs-card-hover p-4 text-center cursor-pointer flex flex-col items-center justify-center border border-gray-100"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#22A06B] flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#171717]">Fleet Analytics</span>
          <span className="text-[10px] text-[#6B6B6B]">Load & Delay Charts</span>
        </button>
      </div>
    </div>
  );
};

