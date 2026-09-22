import React, { useState, useEffect } from 'react';
import { Ticket, QrCode, ArrowLeft, Download, CheckCircle2, Plus, Calendar, Clock, MapPin } from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { useAuth } from '../../context/AuthContext';
import { generateQrDataUrl } from '../../services/qrService';
import { Ticket as TicketType } from '../../types';
import { DigitalTicketingModal } from './DigitalTicketingModal';

interface PassengerTicketsViewProps {
  onBack?: () => void;
  onOpenBookModal?: () => void;
}

export const PassengerTicketsView: React.FC<PassengerTicketsViewProps> = ({ onBack, onOpenBookModal }) => {
  const { tickets } = useOperations();
  const { currentUser } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [internalBookModal, setInternalBookModal] = useState(false);

  const handleOpenBookModal = () => {
    if (onOpenBookModal) {
      onOpenBookModal();
    } else {
      setInternalBookModal(true);
    }
  };

  // Passenger tickets
  const passengerTickets = tickets.filter(
    t => t.passengerId === currentUser?.uid || t.issuedByRole === 'passenger'
  );

  useEffect(() => {
    if (selectedTicket) {
      generateQrDataUrl(selectedTicket.qrCodeData).then(url => setQrUrl(url));
    }
  }, [selectedTicket]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B6B6B] hover:text-[#171717] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        )}
        <button
          onClick={handleOpenBookModal}
          className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white rounded-full text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Book Ticket
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-black text-[#171717]">My Digital QR Tickets</h2>
        <p className="text-xs text-[#6B6B6B] mt-0.5">
          Verifiable bus passes & journey tokens for conductor check
        </p>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {passengerTickets.length === 0 ? (
          <div className="rs-card p-12 text-center">
            <Ticket className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-[#171717]">No active tickets</p>
            <p className="text-xs text-[#6B6B6B] mt-1 mb-4">You have not booked any bus trips yet.</p>
            <button
              onClick={onOpenBookModal}
              className="px-4 py-2.5 bg-[#FF6B00] text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer hover:bg-[#E55F00]"
            >
              Book First Journey
            </button>
          </div>
        ) : (
          passengerTickets.map(ticket => (
            <div
              key={ticket.ticketId}
              onClick={() => setSelectedTicket(ticket)}
              className="rs-card rs-card-hover p-5 border border-neutral-100/90 cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-orange-50 text-[#FF6B00] text-xs font-extrabold">
                    Route {ticket.routeNumber}
                  </span>
                  <span className="font-mono text-xs font-bold text-neutral-700">#{ticket.ticketId}</span>
                </div>
                <span className="text-xs font-bold text-[#22A06B] bg-[#22A06B]/10 px-2.5 py-0.5 rounded-full">
                  Active Pass ✓
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-[#171717] flex items-center gap-1.5">
                    <span>{ticket.fromStop}</span>
                    <span className="text-neutral-400">→</span>
                    <span>{ticket.toStop}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#6B6B6B] mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(ticket.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-[#171717]">₹{ticket.totalFare}</span>
                  <span className="text-[10px] text-[#6B6B6B] block">{ticket.passengerCount} Passenger</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* QR Ticket Inspection Modal (PRD Section 16) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 border border-neutral-100">
            {/* Header */}
            <div className="text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF6B00] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                RouteSense Gate Pass
              </span>
              <h3 className="text-xl font-black text-[#171717] mt-2">
                Route {selectedTicket.routeNumber} ({selectedTicket.fromStop.split(' ')[0]} → {selectedTicket.toStop.split(' ')[0]})
              </h3>
              <p className="text-xs font-mono font-bold text-neutral-500">
                Ticket ID: {selectedTicket.ticketId}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-neutral-50 rounded-3xl border border-neutral-200 mx-auto w-52 h-52 flex items-center justify-center shadow-inner">
              {qrUrl ? (
                <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" />
              ) : (
                <QrCode className="w-36 h-36 text-neutral-800 animate-pulse" />
              )}
            </div>

            {/* Fare and details */}
            <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">From Stop:</span>
                <span className="font-bold text-[#171717]">{selectedTicket.fromStop}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">To Stop:</span>
                <span className="font-bold text-[#171717]">{selectedTicket.toStop}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Passengers:</span>
                <span className="font-bold text-[#171717]">{selectedTicket.passengerCount} Pax</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Payment Status:</span>
                <span className="font-bold text-[#22A06B]">PAID VIA RAZORPAY ₹{selectedTicket.totalFare}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full py-3 bg-neutral-900 text-white rounded-2xl font-bold text-xs hover:bg-neutral-800 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Digital Ticketing Modal Fallback */}
      <DigitalTicketingModal
        isOpen={internalBookModal}
        onClose={() => setInternalBookModal(false)}
      />
    </div>
  );
};
