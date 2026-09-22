import React, { useState } from 'react';
import { Ticket, Search, QrCode, ArrowLeft, Download, ArrowRight, UserCheck } from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { useAuth } from '../../context/AuthContext';
import { Ticket as TicketType } from '../../types';
import { TicketLoggerModal } from './TicketLoggerModal';

interface TicketHistoryViewProps {
  onBack: () => void;
  onOpenLogModal?: () => void;
}

export const TicketHistoryView: React.FC<TicketHistoryViewProps> = ({ onBack, onOpenLogModal }) => {
  const { tickets } = useOperations();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [internalLogModal, setInternalLogModal] = useState(false);

  const handleOpenLogModal = () => {
    if (onOpenLogModal) {
      onOpenLogModal();
    } else {
      setInternalLogModal(true);
    }
  };

  const conductorTickets = tickets.filter(
    t => t.conductorId === currentUser?.uid || t.issuedByRole === 'conductor' || !t.conductorId
  );

  const filteredTickets = conductorTickets.filter(
    t =>
      t.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      t.fromStop.toLowerCase().includes(search.toLowerCase()) ||
      t.toStop.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B6B6B] hover:text-[#171717] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <button
          onClick={handleOpenLogModal}
          className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white rounded-full text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
        >
          <Ticket className="w-3.5 h-3.5" /> + Log Ticket
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-black text-[#171717]">Issued Ticket History</h2>
        <p className="text-xs text-[#6B6B6B] mt-0.5">
          {conductorTickets.length} tickets recorded on current shift
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by ticket ID, boarding or destination stop..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-neutral-200/80 text-xs font-medium text-[#171717] focus:border-[#FF6B00] outline-hidden shadow-xs"
        />
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="rs-card p-10 text-center">
            <Ticket className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#171717]">No tickets found</p>
            <p className="text-xs text-[#6B6B6B] mt-1">No ticket records match your search filter.</p>
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <div
              key={ticket.ticketId}
              onClick={() => setSelectedTicket(ticket)}
              className="rs-card rs-card-hover p-4 border border-neutral-100 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center font-black text-xs">
                  {ticket.passengerCount}P
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#171717]">
                      {ticket.fromStop} → {ticket.toStop}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                      #{ticket.ticketId}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[#6B6B6B] mt-1">
                    <span>
                      {new Date(ticket.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>•</span>
                    <span className="uppercase font-semibold text-neutral-700">
                      {ticket.paymentType.replace('_', ' ')}
                    </span>
                    <span>•</span>
                    <span>Route {ticket.routeNumber}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-[#171717]">₹{ticket.totalFare}</span>
                <span className="block text-[10px] text-[#22A06B] font-bold">PAID ✓</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 border border-neutral-100">
            <div className="text-center">
              <span className="text-[10px] font-extrabold tracking-widest text-[#FF6B00] uppercase bg-[#FF6B00]/10 px-3 py-1 rounded-full">
                RouteSense Digital Ticket
              </span>
              <h3 className="text-xl font-black text-[#171717] mt-2">{selectedTicket.routeName}</h3>
              <p className="text-xs font-mono font-bold text-neutral-600">Ticket ID: {selectedTicket.ticketId}</p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">From:</span>
                <span className="font-bold text-[#171717]">{selectedTicket.fromStop}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">To:</span>
                <span className="font-bold text-[#171717]">{selectedTicket.toStop}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Passengers:</span>
                <span className="font-bold text-[#171717]">{selectedTicket.passengerCount} Pax</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Amount Paid:</span>
                <span className="font-black text-[#171717]">₹{selectedTicket.totalFare}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Time:</span>
                <span className="font-mono text-neutral-700">{new Date(selectedTicket.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full py-2.5 bg-neutral-900 text-white rounded-xl font-bold text-xs hover:bg-neutral-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Ticket Logger Modal fallback */}
      <TicketLoggerModal
        isOpen={internalLogModal}
        onClose={() => setInternalLogModal(false)}
      />
    </div>
  );
};
