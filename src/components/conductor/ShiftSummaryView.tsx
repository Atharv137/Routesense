import React, { useState } from 'react';
import { Clock, Ticket, Users, Navigation, Banknote, QrCode, CheckCircle, ArrowLeft, Download, ShieldCheck } from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { useAuth } from '../../context/AuthContext';

interface ShiftSummaryViewProps {
  onBack: () => void;
}

export const ShiftSummaryView: React.FC<ShiftSummaryViewProps> = ({ onBack }) => {
  const { getShiftSummary } = useOperations();
  const { currentUser } = useAuth();
  const [shiftClosed, setShiftClosed] = useState(false);

  const summary = getShiftSummary(currentUser?.uid || 'user_cond_01');

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B6B6B] hover:text-[#171717] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#22A06B]/10 text-[#22A06B]">
          {shiftClosed ? 'Shift Closed ✓' : 'Shift In Progress'}
        </span>
      </div>

      <div>
        <h2 className="text-2xl font-black text-[#171717]">Shift Reconciliation</h2>
        <p className="text-xs text-[#6B6B6B] mt-0.5">
          Conductor: <span className="font-bold text-[#171717]">{summary.conductorName}</span> • Date: {summary.date}
        </p>
      </div>

      {/* Main Revenue Card */}
      <div className="rs-card-orange p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">Total Shift Revenue</span>
            <span className="text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              Live Auto-Calc
            </span>
          </div>
          <div className="text-4xl font-black tracking-tight">₹{summary.shiftTotalRevenue.toLocaleString()}</div>
          <p className="text-xs text-white/80 mt-1">Ready for depot handover audit</p>
        </div>

        {/* Background Glow */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
      </div>

      {/* 4-Grid Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rs-card p-4 text-center">
          <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center mx-auto mb-2">
            <Ticket className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-[#171717]">{summary.totalTickets}</div>
          <div className="text-[11px] text-[#6B6B6B] font-semibold mt-0.5">Total Tickets</div>
        </div>

        <div className="rs-card p-4 text-center">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-2">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-[#171717]">{summary.totalPassengers}</div>
          <div className="text-[11px] text-[#6B6B6B] font-semibold mt-0.5">Total Passengers</div>
        </div>

        <div className="rs-card p-4 text-center">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Navigation className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-[#171717]">{summary.totalTrips}</div>
          <div className="text-[11px] text-[#6B6B6B] font-semibold mt-0.5">Trips Completed</div>
        </div>

        <div className="rs-card p-4 text-center">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-[#171717]">{summary.startTime}</div>
          <div className="text-[11px] text-[#6B6B6B] font-semibold mt-0.5">Shift Started</div>
        </div>
      </div>

      {/* Payment Split */}
      <div className="rs-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#171717]">Payment Collection Breakdown</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#22A06B]/10 text-[#22A06B]">
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#171717]">Physical Cash Collected</span>
                <p className="text-[10px] text-[#6B6B6B]">To be submitted at depot cash counter</p>
              </div>
            </div>
            <div className="text-base font-black text-[#171717]">₹{summary.cashRevenue.toLocaleString()}</div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#3478F6]/10 text-[#3478F6]">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#171717]">Digital UPI Payments</span>
                <p className="text-[10px] text-[#6B6B6B]">Directly settled in operator account</p>
              </div>
            </div>
            <div className="text-base font-black text-[#171717]">₹{summary.digitalRevenue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Close Shift CTA */}
      <div className="pt-2">
        {!shiftClosed ? (
          <button
            onClick={() => setShiftClosed(true)}
            className="w-full py-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
          >
            <CheckCircle className="w-4 h-4 text-[#22A06B]" />
            <span>Close Shift & Generate Handover Receipt</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <div className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Shift Closed Successfully. Digital reconciliation receipt ready.
            </div>
            <p className="text-[11px] text-emerald-700">Handover token: #HO-20260821-098</p>
          </div>
        )}
      </div>
    </div>
  );
};
