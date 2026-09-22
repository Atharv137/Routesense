import React, { useState, useEffect } from 'react';
import { X, Ticket, ArrowRight, Check, QrCode, Sparkles, Download, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useOperations } from '../../context/OperationsContext';
import { useAuth } from '../../context/AuthContext';
import { RazorpayModal } from './RazorpayModal';
import { generateQrDataUrl } from '../../services/qrService';
import { Ticket as TicketType } from '../../types';

interface DigitalTicketingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedRouteId?: string;
}

export const DigitalTicketingModal: React.FC<DigitalTicketingModalProps> = ({
  isOpen,
  onClose,
  preselectedRouteId,
}) => {
  const { routes, trips, logTicket } = useOperations();
  const { currentUser } = useAuth();

  const [selectedRouteId, setSelectedRouteId] = useState(preselectedRouteId || 'route_101');
  const activeRoute = routes.find(r => r.routeId === selectedRouteId) || routes[0];
  const stops = activeRoute.scheduledStops;

  const [fromStop, setFromStop] = useState(stops[0]?.name || 'Pune Station');
  const [toStop, setToStop] = useState(stops[stops.length - 1]?.name || 'Swargate Stand');
  const [ticketType, setTicketType] = useState<'standard' | 'student' | 'senior' | 'pass'>('standard');
  const [passengerCount, setPassengerCount] = useState(1);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [issuedTicket, setIssuedTicket] = useState<TicketType | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (preselectedRouteId) {
      setSelectedRouteId(preselectedRouteId);
    }
  }, [preselectedRouteId]);

  useEffect(() => {
    if (stops.length > 0) {
      setFromStop(stops[0].name);
      setToStop(stops[stops.length - 1].name);
    }
  }, [selectedRouteId]);

  if (!isOpen) return null;

  const fromIdx = stops.findIndex(s => s.name === fromStop);
  const toIdx = stops.findIndex(s => s.name === toStop);
  const distanceStops = Math.max(1, Math.abs(toIdx - fromIdx));

  // Fare multipliers
  let baseUnitFare = activeRoute.baseFare + (distanceStops - 1) * activeRoute.farePerStop;
  if (ticketType === 'student') baseUnitFare = Math.round(baseUnitFare * 0.5);
  if (ticketType === 'senior') baseUnitFare = Math.round(baseUnitFare * 0.7);
  if (ticketType === 'pass') baseUnitFare = 70; // Daily unlimited pass

  const totalPayable = baseUnitFare * (ticketType === 'pass' ? 1 : passengerCount);

  const handleOpenPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setShowRazorpay(true);
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    setShowRazorpay(false);

    const trip = trips.find(t => t.routeId === activeRoute.routeId) || trips[0];
    const ticket = logTicket({
      tripId: trip.tripId,
      routeId: activeRoute.routeId,
      fromStop,
      toStop,
      passengerCount: ticketType === 'pass' ? 1 : passengerCount,
      paymentType: 'razorpay_digital',
      farePerPassenger: baseUnitFare,
    });

    const qrUrl = await generateQrDataUrl(ticket.qrCodeData);
    setQrDataUrl(qrUrl);
    setIssuedTicket(ticket);

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B00', '#FF8A1F', '#22A06B'],
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-neutral-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-orange-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#171717]">
                {issuedTicket ? 'Your Digital QR Ticket' : 'Book Digital Ticket'}
              </h3>
              <p className="text-xs text-[#6B6B6B]">Route {activeRoute.routeNumber} • Instant QR Gate Pass</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Issued Digital QR Ticket View (PRD Section 16) */}
        {issuedTicket ? (
          <div className="p-6 text-center space-y-4 overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Ticket Card Container */}
            <div className="bg-gradient-to-b from-white to-orange-50/40 rounded-3xl p-5 border-2 border-orange-200 shadow-md relative overflow-hidden text-left space-y-3">
              <div className="flex items-center justify-between border-b border-orange-100 pb-3">
                <div>
                  <span className="font-black text-sm text-[#171717]">RouteSense Transit</span>
                  <p className="text-[10px] text-[#6B6B6B]">Regional Bus Digital Boarding Pass</p>
                </div>
                <span className="text-xs font-black text-white bg-[#FF6B00] px-2.5 py-1 rounded-xl">
                  Route {issuedTicket.routeNumber}
                </span>
              </div>

              {/* QR Code Container */}
              <div className="p-3 bg-white rounded-2xl border border-neutral-200/80 mx-auto w-48 h-48 flex items-center justify-center shadow-inner">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Ticket QR" className="w-full h-full object-contain" />
                ) : (
                  <QrCode className="w-32 h-32 text-neutral-800 animate-pulse" />
                )}
              </div>

              {/* Details grid (PRD Section 16) */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[10px] font-bold text-[#6B6B6B] uppercase block">From:</span>
                  <strong className="text-[#171717]">{issuedTicket.fromStop}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#6B6B6B] uppercase block">To:</span>
                  <strong className="text-[#171717]">{issuedTicket.toStop}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#6B6B6B] uppercase block">Date:</span>
                  <span className="font-semibold text-neutral-800">
                    {new Date(issuedTicket.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#6B6B6B] uppercase block">Time:</span>
                  <span className="font-semibold text-neutral-800">
                    {new Date(issuedTicket.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-dashed border-neutral-300 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-neutral-700">
                    Ticket ID: <strong className="text-[#171717]">{issuedTicket.ticketId}</strong>
                  </span>
                  <span className="font-black text-sm text-[#22A06B]">PAID ₹{issuedTicket.totalFare}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#6B6B6B]">
              Show this QR code to the bus conductor or scan at terminal validator.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Save to My Tickets
            </button>
          </div>
        ) : (
          /* Ticketing Flow (PRD Section 16) */
          <form onSubmit={handleOpenPayment} className="p-5 space-y-4 overflow-y-auto">
            {/* Step 1: Select Route */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                1. Select Route Corridor
              </label>
              <select
                value={selectedRouteId}
                onChange={e => setSelectedRouteId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-bold text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden cursor-pointer"
              >
                {routes.map(r => (
                  <option key={r.routeId} value={r.routeId}>
                    Route {r.routeNumber} — {r.routeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Boarding & Destination */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                  2. Boarding Stop
                </label>
                <select
                  value={fromStop}
                  onChange={e => setFromStop(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden cursor-pointer"
                >
                  {stops.map(s => (
                    <option key={s.stopId} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                  Destination Stop
                </label>
                <select
                  value={toStop}
                  onChange={e => setToStop(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden cursor-pointer"
                >
                  {stops.map(s => (
                    <option key={s.stopId} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 3: Ticket Type */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                3. Ticket Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'standard', label: 'Standard', desc: 'Full fare' },
                  { id: 'student', label: 'Student (50% Off)', desc: 'Valid ID required' },
                  { id: 'senior', label: 'Senior Citizen', desc: '30% concession' },
                  { id: 'pass', label: '1-Day Unlimited', desc: '₹70 all lines' },
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTicketType(t.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      ticketType === t.id
                        ? 'border-[#FF6B00] bg-[#FF6B00]/10 text-[#171717] ring-1 ring-[#FF6B00]'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    <div className="text-xs font-bold">{t.label}</div>
                    <div className="text-[10px] text-[#6B6B6B]">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Number of passengers */}
            {ticketType !== 'pass' && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                <span className="text-xs font-bold text-[#171717]">Passenger Count:</span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPassengerCount(num)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        passengerCount === num ? 'bg-[#FF6B00] text-white shadow-xs' : 'bg-white border border-neutral-200 text-neutral-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Total Fare & Razorpay CTA */}
            <div className="pt-2">
              <div className="p-3.5 bg-neutral-900 text-white rounded-2xl mb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Fare</span>
                  <span className="text-2xl font-black text-white">₹{totalPayable}</span>
                </div>
                <div className="text-right text-[11px] text-neutral-300">
                  <span>{distanceStops} stops travel</span>
                  <span className="text-[10px] text-neutral-400 block">Instant QR generation</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8A1F] hover:from-[#E55F00] hover:to-[#FF6B00] text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <span>Pay ₹{totalPayable} via Razorpay</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Razorpay Modal */}
      <RazorpayModal
        isOpen={showRazorpay}
        amount={totalPayable}
        routeName={`Route ${activeRoute.routeNumber} (${fromStop} → ${toStop})`}
        onSuccess={handlePaymentSuccess}
        onClose={() => setShowRazorpay(false)}
      />
    </div>
  );
};
