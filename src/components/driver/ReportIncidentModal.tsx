import React, { useState, useRef } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  Wrench,
  Ban,
  Camera,
  MapPin,
  Check,
  ArrowRight,
  UploadCloud,
  Image as ImageIcon,
} from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { useAuth } from '../../context/AuthContext';
import { IncidentType, IncidentSeverity, Incident } from '../../types';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({ isOpen, onClose }) => {
  const { routes, buses, reportIncident } = useOperations();
  const { currentUser } = useAuth();

  const assignedRoute = routes.find(r => r.routeId === currentUser?.routeAssigned) || routes[0];
  const assignedBus = buses.find(b => b.driverId === currentUser?.uid || b.routeId === assignedRoute.routeId) || buses[0];

  const [type, setType] = useState<IncidentType>('delay');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('medium');
  const [delayMinutes, setDelayMinutes] = useState(15);
  const [locationName, setLocationName] = useState('Near Sarasbaug Junction');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(
    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop&q=80'
  );
  const [submittedIncident, setSubmittedIncident] = useState<Incident | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const incidentTypes: { id: IncidentType; label: string; desc: string; icon: any; color: string }[] = [
    {
      id: 'delay',
      label: 'Delay / Traffic',
      desc: 'Heavy traffic congestion or slow road movement',
      icon: Clock,
      color: 'text-[#FF6B00] bg-orange-50',
    },
    {
      id: 'breakdown',
      label: 'Vehicle Breakdown',
      desc: 'Engine, tyre, mechanical or electrical breakdown',
      icon: Wrench,
      color: 'text-[#E5484D] bg-rose-50',
    },
    {
      id: 'obstruction',
      label: 'Obstruction / Block',
      desc: 'Roadblock, accident, tree fall or water logging',
      icon: Ban,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const incident = reportIncident({
        routeId: assignedRoute.routeId,
        busId: assignedBus.busId,
        type,
        description,
        severity,
        delayMinutes: type === 'delay' ? delayMinutes : type === 'breakdown' ? 45 : 20,
        locationName,
        photoUrl,
      });
      setSubmittedIncident(incident);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedIncident(null);
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-neutral-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-rose-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E5484D] text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#171717]">
                {submittedIncident ? 'Incident Reported ✓' : 'Report Driver Incident'}
              </h3>
              <p className="text-xs text-[#6B6B6B]">
                Bus: {assignedBus.busNumber} • Route {assignedRoute.routeNumber}
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
        {submittedIncident ? (
          <div className="p-6 text-center space-y-5 animate-in zoom-in-95 duration-200 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-[#22A06B]/10 text-[#22A06B] flex items-center justify-center mx-auto border-2 border-[#22A06B]/30">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#22A06B] bg-[#22A06B]/10 px-3 py-1 rounded-full">
                Incident Reported Successfully ✓
              </span>
              <h4 className="text-xl font-black text-[#171717] mt-3 capitalize">
                {submittedIncident.type} Alert Dispatched
              </h4>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Incident ID: <span className="font-mono font-bold text-neutral-800">{submittedIncident.incidentId}</span>
              </p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-4 border border-dashed border-neutral-300 text-left space-y-2 text-xs">
              <div className="flex justify-between text-[#6B6B6B]">
                <span>Location:</span>
                <span className="font-bold text-[#171717]">{submittedIncident.locationName}</span>
              </div>
              <div className="flex justify-between text-[#6B6B6B]">
                <span>Estimated Impact:</span>
                <span className="font-bold text-[#FF6B00]">+{submittedIncident.delayMinutes} mins delay</span>
              </div>
              <div className="flex justify-between text-[#6B6B6B]">
                <span>Operations Status:</span>
                <span className="font-bold text-[#E5484D] uppercase">Alert Transmitted to Ops Control</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleReset}
                className="py-3 bg-[#FF6B00] hover:bg-[#E55F00] text-white rounded-2xl font-bold text-xs shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                Report Another
              </button>
              <button
                onClick={onClose}
                className="py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Form (PRD Section 9) */
          <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto">
            {/* 3 Large Selectable Cards: Delay, Breakdown, Obstruction */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-2">
                Select Incident Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {incidentTypes.map(item => {
                  const Icon = item.icon;
                  const isSelected = type === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setType(item.id)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-[#FF6B00] bg-[#FF6B00]/10 text-[#171717] ring-2 ring-[#FF6B00]/40'
                          : 'border-neutral-200/80 bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-1.5 ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-[#171717]">{item.label.split('/')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delay Estimated Minutes if Delay type */}
            {type === 'delay' && (
              <div className="p-3 rounded-2xl bg-orange-50/60 border border-orange-200/60">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-orange-950">Estimated Delay Duration</label>
                  <span className="text-xs font-extrabold text-[#FF6B00]">{delayMinutes} Minutes</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={delayMinutes}
                  onChange={e => setDelayMinutes(Number(e.target.value))}
                  className="w-full accent-[#FF6B00] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-orange-800/70 font-semibold mt-1">
                  <span>5 mins</span>
                  <span>30 mins</span>
                  <span>60 mins</span>
                </div>
              </div>
            )}

            {/* Location Tag */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                Incident Location (GPS Auto-tagged)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#FF6B00] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  placeholder="e.g. Sarasbaug Junction / Nana Peth"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                Issue Description
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe road blockage, tyre blowout, or delay cause..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden resize-none"
              />
            </div>

            {/* Severity Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                Severity Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'critical'] as IncidentSeverity[]).map(sev => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-2 rounded-xl text-[11px] font-bold uppercase transition-all cursor-pointer ${
                      severity === sev
                        ? sev === 'critical'
                          ? 'bg-[#E5484D] text-white shadow-xs'
                          : sev === 'high'
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-neutral-800 text-white'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Attachment (Firebase Storage Upload simulator) */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                Incident Photo Proof
              </label>
              <div className="flex items-center gap-3">
                {photoUrl ? (
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-neutral-200 shrink-0">
                    <img src={photoUrl} alt="Incident" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl(undefined)}
                      className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full text-[10px]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : null}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 px-4 rounded-2xl border border-dashed border-neutral-300 hover:border-[#FF6B00] bg-neutral-50 hover:bg-orange-50/20 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Camera className="w-4 h-4 text-[#FF6B00]" />
                  <span>{photoUrl ? 'Change Photo' : 'Capture / Upload Photo'}</span>
                </button>
              </div>
            </div>

            {/* Primary Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="w-full py-4 bg-gradient-to-r from-[#E5484D] to-[#FF6B00] hover:from-[#c93b40] hover:to-[#E55F00] text-white rounded-2xl font-extrabold text-base shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Submit Report</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
              <p className="text-[10px] text-center text-[#6B6B6B] mt-2">
                Broadcasts immediately to Central Operations Dashboard (&lt; 2-3s sync)
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
