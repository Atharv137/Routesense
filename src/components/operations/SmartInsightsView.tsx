import React from 'react';
import { Sparkles, ArrowLeft, TrendingUp, AlertTriangle, ShieldCheck, ArrowRight, Lightbulb } from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';

interface SmartInsightsViewProps {
  onBack?: () => void;
}

export const SmartInsightsView: React.FC<SmartInsightsViewProps> = ({ onBack }) => {
  const { smartInsights } = useOperations();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B6B6B] hover:text-[#171717] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        )}
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
          Smart Advisory Engine Active
        </span>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#171717]">Smart Operational Insights</h2>
        </div>
        <p className="text-xs text-[#6B6B6B] mt-1">
          Automated corridor telemetry analysis and operational suggestions
        </p>
      </div>

      {/* Advisory Banner */}
      <div className="p-3.5 rounded-2xl bg-neutral-100 text-xs text-neutral-600 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          Note: These recommendations are data-driven operational insights calculated from recent corridor logs, not guaranteed predictions.
        </span>
      </div>

      {/* Insights List (PRD Section 20) */}
      <div className="space-y-4">
        {smartInsights.map(insight => (
          <div
            key={insight.id}
            className="rs-card p-6 sm:p-7 border border-neutral-200/90 shadow-md space-y-4 hover:border-[#FF6B00]/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#FF6B00] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                {insight.title}
              </span>
              <span className="text-xs font-mono font-bold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-lg">
                {insight.metricValue}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-[#171717]">{insight.routeName}</h3>
              <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">{insight.summary}</p>
            </div>

            {/* Recommendation Box */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                <span>Operational Recommendation:</span>
              </div>
              <p className="text-neutral-800 leading-relaxed font-medium">
                {insight.recommendation}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#6B6B6B] pt-2 border-t border-neutral-100">
              <span>Evaluated on: {insight.timestamp}</span>
              <button
                onClick={() => alert(`Operational suggestion logged for ${insight.routeName}. Dispatch scheduler notified.`)}
                className="text-[#FF6B00] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                Apply Recommendation <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
