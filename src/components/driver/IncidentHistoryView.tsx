import React, { useState } from 'react';
import { AlertTriangle, Clock, MapPin, ArrowLeft, Plus, CheckCircle2, Eye } from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { Incident } from '../../types';
import { ReportIncidentModal } from './ReportIncidentModal';

interface IncidentHistoryViewProps {
  onBack: () => void;
  onOpenReportModal?: () => void;
}

export const IncidentHistoryView: React.FC<IncidentHistoryViewProps> = ({ onBack, onOpenReportModal }) => {
  const { incidents } = useOperations();
  const { currentUser } = useAuth();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [internalReportModal, setInternalReportModal] = useState(false);

  const handleOpenReportModal = () => {
    if (onOpenReportModal) {
      onOpenReportModal();
    } else {
      setInternalReportModal(true);
    }
  };

  const driverIncidents = incidents.filter(
    i => i.driverId === currentUser?.uid || i.routeId === currentUser?.routeAssigned
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
          onClick={handleOpenReportModal}
          className="px-3.5 py-1.5 bg-[#E5484D] hover:bg-[#c93b40] text-white rounded-full text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Report Issue
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-black text-[#171717]">Incident Log History</h2>
        <p className="text-xs text-[#6B6B6B] mt-0.5">
          {driverIncidents.length} incidents recorded on this driver profile
        </p>
      </div>

      {/* List */}
      <div className="space-y-3">
        {driverIncidents.length === 0 ? (
          <div className="rs-card p-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#171717]">No incidents recorded</p>
            <p className="text-xs text-[#6B6B6B] mt-1">Your route operations have been smooth and on-time.</p>
          </div>
        ) : (
          driverIncidents.map(inc => (
            <div
              key={inc.incidentId}
              onClick={() => setSelectedIncident(inc)}
              className="rs-card rs-card-hover p-4 border border-neutral-100 cursor-pointer space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge status={inc.type} size="sm" />
                  <StatusBadge status={inc.status} size="sm" />
                </div>
                <span className="text-[11px] text-[#6B6B6B] flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs font-bold text-[#171717] line-clamp-2">
                {inc.description}
              </p>

              <div className="flex items-center justify-between text-[11px] text-[#6B6B6B] pt-1 border-t border-neutral-100">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#FF6B00]" />
                  {inc.locationName}
                </span>
                <span className="font-semibold text-neutral-800">
                  +{inc.delayMinutes} min delay
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 border border-neutral-100">
            <div className="flex items-center justify-between">
              <StatusBadge status={selectedIncident.type} />
              <StatusBadge status={selectedIncident.status} />
            </div>

            {selectedIncident.photoUrl && (
              <div className="w-full h-44 rounded-2xl overflow-hidden border border-neutral-200">
                <img src={selectedIncident.photoUrl} alt="Proof" className="w-full h-full object-cover" />
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-[#171717]">{selectedIncident.locationName}</h3>
              <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">{selectedIncident.description}</p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Route:</span>
                <span className="font-bold text-[#171717]">{selectedIncident.routeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Bus Unit:</span>
                <span className="font-bold text-[#171717]">{selectedIncident.busNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Reported At:</span>
                <span className="font-mono text-neutral-700">{new Date(selectedIncident.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedIncident(null)}
              className="w-full py-2.5 bg-neutral-900 text-white rounded-xl font-bold text-xs hover:bg-neutral-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Report Incident Modal fallback */}
      <ReportIncidentModal
        isOpen={internalReportModal}
        onClose={() => setInternalReportModal(false)}
      />
    </div>
  );
};
