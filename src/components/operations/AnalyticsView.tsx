import React, { useState } from 'react';
import { BarChart3, TrendingUp, Clock, AlertTriangle, ArrowLeft, ArrowUpRight, ArrowDownRight, Award, ShieldCheck } from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';

interface AnalyticsViewProps {
  onBack?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onBack }) => {
  const { routes, incidents } = useOperations();
  const [period, setPeriod] = useState<'7_days' | '30_days'>('7_days');

  // Chart Mock telemetry tailored to PRD
  const loadData7Days = [
    { day: 'Mon', load: 64, delayMin: 12 },
    { day: 'Tue', load: 72, delayMin: 18 },
    { day: 'Wed', load: 68, delayMin: 14 },
    { day: 'Thu', load: 81, delayMin: 24 },
    { day: 'Fri', load: 88, delayMin: 29 },
    { day: 'Sat', load: 76, delayMin: 15 },
    { day: 'Sun', load: 58, delayMin: 8 },
  ];

  const loadData30Days = [
    { day: 'Week 1', load: 68, delayMin: 14 },
    { day: 'Week 2', load: 74, delayMin: 19 },
    { day: 'Week 3', load: 79, delayMin: 22 },
    { day: 'Week 4', load: 71, delayMin: 16 },
  ];

  const activeChartData = period === '7_days' ? loadData7Days : loadData30Days;

  // Incident breakdown counts
  const totalIncidents = incidents.length;
  const delayCount = incidents.filter(i => i.type === 'delay').length || 18;
  const breakdownCount = incidents.filter(i => i.type === 'breakdown').length || 4;
  const obstructionCount = incidents.filter(i => i.type === 'obstruction').length || 3;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* Header & Period Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B6B6B] hover:text-[#171717] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        )}

        <div className="flex items-center p-1 bg-neutral-100 rounded-2xl border border-neutral-200">
          <button
            onClick={() => setPeriod('7_days')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === '7_days' ? 'bg-white text-[#FF6B00] shadow-xs' : 'text-[#6B6B6B]'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setPeriod('30_days')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === '30_days' ? 'bg-white text-[#FF6B00] shadow-xs' : 'text-[#6B6B6B]'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#171717]">Fleet Analytics & Performance</h2>
        <p className="text-xs text-[#6B6B6B] mt-0.5">
          Corridor efficiency metrics, passenger load distribution, and schedule adherence
        </p>
      </div>

      {/* 2 Main Visual Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Passenger Load Factor Graph */}
        <div className="rs-card p-5 sm:p-6 border border-neutral-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#171717]">Passenger Load Factor (%)</h3>
              <p className="text-xs text-[#6B6B6B]">Average capacity utilization across corridors</p>
            </div>
            <span className="text-xs font-black text-[#FF6B00] bg-orange-50 px-2.5 py-1 rounded-xl">
              Avg 71.8%
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-6 pb-2 flex items-end justify-between gap-2 h-44 border-b border-neutral-100">
            {activeChartData.map(item => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-bold text-[#171717] opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.load}%
                </span>
                <div
                  className="w-full max-w-[36px] bg-gradient-to-t from-[#FF6B00] to-[#FF8A1F] rounded-t-xl transition-all duration-500 hover:brightness-110 shadow-xs"
                  style={{ height: `${(item.load / 100) * 100}%` }}
                />
                <span className="text-[11px] font-semibold text-[#6B6B6B]">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-[#6B6B6B] pt-1">
            <span>Peak Day: Friday (88% Load)</span>
            <span className="text-[#22A06B] font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +4.2% vs last cycle
            </span>
          </div>
        </div>

        {/* Delay Minutes Distribution */}
        <div className="rs-card p-5 sm:p-6 border border-neutral-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#171717]">Average Delay per Run (Minutes)</h3>
              <p className="text-xs text-[#6B6B6B]">Traffic loss & bottleneck duration</p>
            </div>
            <span className="text-xs font-black text-[#E5484D] bg-rose-50 px-2.5 py-1 rounded-xl">
              Avg 17.2m
            </span>
          </div>

          {/* Line/Bar visualization for delay */}
          <div className="pt-6 pb-2 flex items-end justify-between gap-2 h-44 border-b border-neutral-100">
            {activeChartData.map(item => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-bold text-[#E5484D] opacity-0 group-hover:opacity-100 transition-opacity">
                  +{item.delayMin}m
                </span>
                <div
                  className="w-full max-w-[36px] bg-[#E5484D]/80 hover:bg-[#E5484D] rounded-t-xl transition-all duration-500 shadow-xs"
                  style={{ height: `${(item.delayMin / 35) * 100}%` }}
                />
                <span className="text-[11px] font-semibold text-[#6B6B6B]">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-[#6B6B6B] pt-1">
            <span>Max Bottleneck: Friday (29 mins)</span>
            <span className="text-[#E5484D] font-bold">Concentrated in 5 PM - 7 PM</span>
          </div>
        </div>
      </div>

      {/* Incident Breakdown Distribution (PRD Section 19) */}
      <div className="rs-card p-5 sm:p-6 border border-neutral-100 space-y-4">
        <h3 className="text-sm font-bold text-[#171717]">Incident Distribution by Classification</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200">
            <span className="text-xs font-bold text-orange-950 uppercase">Traffic & Delays</span>
            <div className="text-3xl font-black text-[#FF6B00] mt-1">{delayCount}</div>
            <p className="text-[11px] text-orange-800 mt-1">72% of total operational disruptions</p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
            <span className="text-xs font-bold text-rose-950 uppercase">Vehicle Breakdowns</span>
            <div className="text-3xl font-black text-[#E5484D] mt-1">{breakdownCount}</div>
            <p className="text-[11px] text-rose-800 mt-1">Coolant spike & tyre puncture causes</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <span className="text-xs font-bold text-amber-950 uppercase">Route Obstructions</span>
            <div className="text-3xl font-black text-amber-600 mt-1">{obstructionCount}</div>
            <p className="text-[11px] text-amber-800 mt-1">Roadwork diversions & fallen trees</p>
          </div>
        </div>
      </div>

      {/* Route Performance Rankings (PRD Section 19) */}
      <div className="rs-card p-5 sm:p-6 border border-neutral-100 space-y-4">
        <h3 className="text-sm font-bold text-[#171717]">Corridor Performance Benchmarks</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Best Performing Corridor</span>
              </div>
              <p className="text-sm font-black text-emerald-950 mt-1">Route 303 (Katraj ↔ Hadapsar)</p>
              <span className="text-[11px] text-emerald-800">99.1% on-time departure score</span>
            </div>
            <span className="text-xl font-black text-[#22A06B]">★ 9.8</span>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-950">
                <TrendingUp className="w-4 h-4 text-[#FF6B00]" />
                <span>Highest Passenger Load</span>
              </div>
              <p className="text-sm font-black text-orange-950 mt-1">Route 202 (Shivaji Nagar ↔ Hinjewadi)</p>
              <span className="text-[11px] text-orange-800">82% average peak occupancy</span>
            </div>
            <span className="text-xl font-black text-[#FF6B00]">82%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
