import React, { useState } from 'react';
import { AlertTriangle, Clock, Sparkles, ArrowLeft, ArrowRight, ShieldCheck, MapPin, ChevronRight, Activity } from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { RecurringIssue } from '../../types';

interface RecurringIssuesViewProps {
  onBack?: () => void;
}

export const RecurringIssuesView: React.FC<RecurringIssuesViewProps> = ({ onBack }) => {
  const { recurringIssues } = useOperations();
  const [selectedPeriod, setSelectedPeriod] = useState<'7_days' | '30_days'>('7_days');
  const [selectedIssue, setSelectedIssue] = useState<RecurringIssue | null>(null);

  const displayIssues = recurringIssues.filter(i => (selectedPeriod === '7_days' ? true : true));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto pb-24 animate-in fade-in duration-200">
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

        {/* 7 Days / 30 Days Filter */}
        <div className="flex items-center p-1 bg-neutral-100 rounded-2xl border border-neutral-200">
          <button
            onClick={() => setSelectedPeriod('7_days')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedPeriod === '7_days'
                ? 'bg-white text-[#FF6B00] shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#171717]'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setSelectedPeriod('30_days')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedPeriod === '30_days'
                ? 'bg-white text-[#FF6B00] shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#171717]'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-orange-100 text-[#FF6B00]">
            <Activity className="w-5 h-5" />
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#171717]">Recurring Issue Detection</h2>
        </div>
        <p className="text-xs text-[#6B6B6B] mt-1">
          Automated corridor pattern clustering based on repeated incident logs & time-window telemetry
        </p>
      </div>

      {/* Prominent Warning Cards (PRD Section 13) */}
      <div className="space-y-4">
        {displayIssues.map(issue => (
          <div
            key={issue.id}
            className="rs-card p-6 sm:p-7 border-2 border-orange-200 bg-gradient-to-br from-orange-50/40 via-white to-amber-50/20 shadow-md relative overflow-hidden space-y-4"
          >
            {/* Top Tag & Confidence */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] text-xs font-black">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
                <span>⚠ RECURRING ISSUE DETECTED</span>
              </div>
              <span className="text-xs font-bold text-neutral-600 bg-white/80 px-2.5 py-1 rounded-lg border border-neutral-200">
                Pattern Confidence: <strong className="text-[#FF6B00]">{issue.confidenceScore}%</strong>
              </span>
            </div>

            {/* Route & Incidents Count */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#171717]">
                Route {issue.routeNumber}
              </h3>
              <p className="text-sm font-semibold text-[#6B6B6B]">{issue.routeName}</p>
            </div>

            {/* 3 Metric Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B6B6B]">
                  Incidents Detected
                </span>
                <div className="text-xl font-black text-[#E5484D] mt-0.5">
                  {issue.incidentCount} incidents
                </div>
                <span className="text-[10px] text-[#6B6B6B]">within the last {selectedPeriod === '7_days' ? '7 days' : '30 days'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B6B6B]">
                  Most Common Issue
                </span>
                <div className="text-xl font-black text-[#FF6B00] mt-0.5 capitalize">
                  {issue.mostCommonType}
                </div>
                <span className="text-[10px] text-[#6B6B6B]">Congestion bottleneck</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B6B6B]">
                  Peak Problem Period
                </span>
                <div className="text-xl font-black text-[#171717] mt-0.5">
                  {issue.peakProblemPeriod}
                </div>
                <span className="text-[10px] text-[#6B6B6B]">Evening rush hours</span>
              </div>
            </div>

            {/* AI Recommendation Box */}
            <div className="p-4 rounded-2xl bg-orange-100/60 border border-orange-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-950">
                <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                <span>Operational Recommendation:</span>
              </div>
              <p className="text-neutral-800 leading-relaxed font-medium">
                {issue.recommendation}
              </p>
            </div>

            {/* Affected Stops */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-[#6B6B6B]">Affected Corridors:</span>
              {issue.affectedStops.map(stop => (
                <span
                  key={stop}
                  className="px-2.5 py-1 rounded-xl bg-white text-xs font-semibold text-neutral-800 border border-neutral-200 shadow-2xs flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-[#FF6B00]" />
                  {stop}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedIssue(issue)}
                className="px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>View Full Corridor Analysis</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Analysis Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 border border-neutral-100">
            <h3 className="text-xl font-black text-[#171717]">
              Corridor Bottleneck Analysis — Route {selectedIssue.routeNumber}
            </h3>
            <p className="text-xs text-[#6B6B6B]">
              Pattern period: {selectedIssue.peakProblemPeriod} • {selectedIssue.incidentCount} logged incidents
            </p>

            <div className="space-y-3 text-xs bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
              <div className="font-bold text-[#171717]">Timeline Clustering:</div>
              <div className="space-y-2">
                <div className="flex justify-between text-neutral-700">
                  <span>Day 1 (18:15)</span>
                  <span className="font-semibold text-[#FF6B00]">+18 min delay @ Sarasbaug</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>Day 3 (17:40)</span>
                  <span className="font-semibold text-[#FF6B00]">+22 min delay @ Nana Peth</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>Day 5 (18:50)</span>
                  <span className="font-semibold text-[#FF6B00]">+15 min delay @ Swargate</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
              <strong>Suggested Action:</strong> Add 2 temporary high-capacity express runs from Pune Station to Swargate skipping intermediate small halts between 17:00 and 19:00.
            </div>

            <button
              onClick={() => setSelectedIssue(null)}
              className="w-full py-2.5 bg-neutral-900 text-white rounded-xl font-bold text-xs hover:bg-neutral-800 cursor-pointer"
            >
              Close Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
