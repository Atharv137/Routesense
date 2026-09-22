import React, { useState } from 'react';
import { X, Plus, Minus, Check, Ticket, Banknote, QrCode, ArrowRight, Sparkles, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useOperations } from '../../context/OperationsContext';
import { useAuth } from '../../context/AuthContext';
import { Ticket as TicketType } from '../../types';

interface TicketLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TicketLoggerModal: React.FC<TicketLoggerModalProps> = ({ isOpen, onClose }) => {
  const { routes, trips, logTicket } = useOperations();
  const { currentUser } = useAuth();

  const assignedRoute = routes.find(r => r.routeId === currentUser?.routeAssigned) || routes[0];
  const activeTrip = trips.find(t => t.conductorId === currentUser?.uid || t.routeId === assignedRoute.routeId) || trips[0];

  const stops = assignedRoute.scheduledStops;
  const [fromStop, setFromStop] = useState(stops[0]?.name || 'Pune Station');
  const [toStop, setToStop] = useState(stops[stops.length - 1]?.name || 'Swargate Stand');
  const [passengerCount, setPassengerCount] = useState(1);
  const [paymentType, setPaymentType] = useState<'cash' | 'razorpay_digital'>('cash');
  const [lastIssuedTicket, setLastIssuedTicket] = useState<TicketType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const fromIdx = stops.findIndex(s => s.name === fromStop);
  const toIdx = stops.findIndex(s => s.name === toStop);
  const stopCount = Math.max(1, Math.abs(toIdx - fromIdx));
  const unitFare = assignedRoute.baseFare + (stopCount - 1) * assignedRoute.farePerStop;
  const totalFare = unitFare * passengerCount;

  const handleAdjustCount = (delta: number) => {
    setPassengerCount(prev => Math.max(1, Math.min(20, prev + delta)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const ticket = logTicket({
        tripId: activeTrip.tripId,
        routeId: assignedRoute.routeId,
        fromStop,
        toStop,
        passengerCount,
        paymentType,
        farePerPassenger: unitFare,
      });

      // Trigger celebratory micro-confetti
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#FF6B00', '#FF8A1F', '#22A06B'],
        });
      } catch (err) {
        // ignore
      }

      setLastIssuedTicket(ticket);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNextTicket = () => {
    setLastIssuedTicket(null);
    setPassengerCount(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-neutral-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-orange-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#171717]">
                {lastIssuedTicket ? 'Ticket Recorded ✓' : 'Rapid Ticket Logging'}
              </h3>
              <p className="text-xs text-[#6B6B6B]">
                Route {assignedRoute.routeNumber} • Bus {activeTrip.busNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {lastIssuedTicket ? (
          <div className="p-6 text-center space-y-5 animate-in zoom-in-95 duration-200 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-[#22A06B]/10 text-[#22A06B] flex items-center justify-center mx-auto border-2 border-[#22A06B]/30">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#22A06B] bg-[#22A06B]/10 px-3 py-1 rounded-full">
                Ticket Recorded Successfully ✓
              </span>
              <h4 className="text-2xl font-black text-[#171717] mt-3">
                ₹{lastIssuedTicket.totalFare}
              </h4>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Ticket ID: <span className="font-mono font-bold text-neutral-800">{lastIssuedTicket.ticketId}</span>
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-neutral-50 rounded-2xl p-4 border border-dashed border-neutral-300 text-left space-y-2.5 text-xs">
              <div className="flex justify-between text-[#6B6B6B]">
                <span>Journey:</span>
                <span className="font-bold text-[#171717]">{lastIssuedTicket.fromStop} → {lastIssuedTicket.toStop}</span>
              </div>
              <div className="flex justify-between text-[#6B6B6B]">
                <span>Passenger Count:</span>
                <span className="font-bold text-[#171717]">{lastIssuedTicket.passengerCount} Pax</span>
              </div>
              <div className="flex justify-between text-[#6B6B6B]">
                <span>Payment Mode:</span>
                <span className="font-bold text-[#171717] uppercase">{lastIssuedTicket.paymentType.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-[#6B6B6B]">
                <span>Timestamp:</span>
                <span className="font-mono font-medium text-neutral-700">
                  {new Date(lastIssuedTicket.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleResetForNextTicket}
                className="py-3 bg-[#FF6B00] hover:bg-[#E55F00] text-white rounded-2xl font-bold text-xs shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" /> Next Passenger
              </button>
              <button
                onClick={onClose}
                className="py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Rapid Entry Form (< 10-15 seconds) */
          <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto">
            {/* Quick Stop Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                  Boarding (From)
                </label>
                <select
                  value={fromStop}
                  onChange={e => setFromStop(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-bold text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden cursor-pointer"
                >
                  {stops.map(s => (
                    <option key={s.stopId} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                  Destination (To)
                </label>
                <select
                  value={toStop}
                  onChange={e => setToStop(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-bold text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden cursor-pointer"
                >
                  {stops.map(s => (
                    <option key={s.stopId} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Passenger Count Numeric Stepper */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                  Passenger Count (Quick Stepper)
                </label>
                <span className="text-xs font-bold text-[#FF6B00]">₹{unitFare}/ticket</span>
              </div>

              <div className="flex items-center justify-between bg-neutral-50 p-2 rounded-2xl border border-neutral-200/80">
                <button
                  type="button"
                  onClick={() => handleAdjustCount(-1)}
                  disabled={passengerCount <= 1}
                  className="w-12 h-12 rounded-xl bg-white text-[#171717] shadow-xs border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-transform active:scale-95"
                >
                  <Minus className="w-5 h-5 stroke-[2.5]" />
                </button>

                <div className="text-center px-4">
                  <span className="text-3xl font-black text-[#171717]">{passengerCount}</span>
                  <span className="text-xs text-[#6B6B6B] block font-medium">Passenger{passengerCount > 1 ? 's' : ''}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdjustCount(1)}
                  className="w-12 h-12 rounded-xl bg-[#FF6B00] text-white shadow-md shadow-orange-500/20 flex items-center justify-center hover:bg-[#E55F00] cursor-pointer transition-transform active:scale-95"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Quick Multiplier Pills (+1, +2, +5) */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-[#6B6B6B] font-semibold">Presets:</span>
                {[1, 2, 3, 5].map(qty => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setPassengerCount(qty)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      passengerCount === qty
                        ? 'bg-[#FF6B00] text-white shadow-xs'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentType('cash')}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                    paymentType === 'cash'
                      ? 'border-[#FF6B00] bg-orange-50/50 text-[#171717] ring-1 ring-[#FF6B00]'
                      : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${paymentType === 'cash' ? 'bg-[#FF6B00] text-white' : 'bg-neutral-200 text-neutral-600'}`}>
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Cash</div>
                    <div className="text-[10px] text-[#6B6B6B]">Collected in hand</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('razorpay_digital')}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                    paymentType === 'razorpay_digital'
                      ? 'border-[#FF6B00] bg-orange-50/50 text-[#171717] ring-1 ring-[#FF6B00]'
                      : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${paymentType === 'razorpay_digital' ? 'bg-[#FF6B00] text-white' : 'bg-neutral-200 text-neutral-600'}`}>
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">UPI / QR</div>
                    <div className="text-[10px] text-[#6B6B6B]">Digital Fare QR</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Total Fare & Submit Button */}
            <div className="pt-2">
              <div className="bg-neutral-900 text-white rounded-2xl p-4 mb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                    Total Amount Due
                  </span>
                  <span className="text-2xl font-black text-white">₹{totalFare}</span>
                </div>
                <div className="text-right text-[11px] text-neutral-300">
                  <span className="font-semibold text-white">{passengerCount} Ticket{passengerCount > 1 ? 's' : ''}</span>
                  <span className="block text-[10px] text-neutral-400">{stopCount} stops distance</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8A1F] hover:from-[#E55F00] hover:to-[#FF6B00] text-white rounded-2xl font-extrabold text-base shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-98"
              >
                <span>Submit Ticket (₹{totalFare})</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
              <p className="text-[10px] text-center text-[#6B6B6B] mt-2">
                Fast recording enabled • Synced immediately to Operations Dashboard
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
