import React, { useState } from 'react';
import { Search, Filter, Calendar, AlertTriangle, ArrowLeft, Download, CheckCircle2, Clock, MapPin, X } from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { StatusBadge } from '../common/StatusBadge';
import { Incident, IncidentType, IncidentStatus } from '../../types';

interface HistoricalDataViewProps {
  onBack?: () => void;
}

export const HistoricalDataView: React.FC<HistoricalDataViewProps> = ({ onBack }) => {
  const { incidents, routes, resolveIncident } = useOperations();

  const [routeFilter, setRouteFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<IncidentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<'today' | '7_days' | '30_days'>('7_days');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const filteredIncidents = incidents.filter(inc => {
    if (routeFilter !== 'all' && inc.routeId !== routeFilter) return false;
    if (typeFilter !== 'all' && inc.type !== typeFilter) return false;
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        inc.description.toLowerCase().includes(q) ||
        inc.routeName.toLowerCase().includes(q) ||
        inc.locationName.toLowerCase().includes(q) ||
        inc.driverName.toLowerCase().includes(q);
      if (!match) return false;
    }

    const incTime = new Date(inc.timestamp).getTime();
    const now = Date.now();
    if (dateRange === 'today') {
      return now - incTime <= 24 * 60 * 60 * 1000;
    } else if (dateRange === '7_days') {
      return now - incTime <= 7 * 24 * 60 * 60 * 1000;
    } else if (dateRange === '30_days') {
      return now - incTime <= 30 * 24 * 60 * 60 * 1000;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['IncidentID', 'Route', 'Bus', 'Driver', 'Type', 'Severity', 'Status', 'DelayMinutes', 'Location', 'Timestamp'];
    const rows = filteredIncidents.map(i => [
      i.incidentId,
      i.routeName,
      i.busNumber,
      i.driverName,
      i.type,
      i.severity,
      i.status,
      i.delayMinutes,
      `"${i.locationName.replace(/"/g, '""')}"`,
      i.timestamp,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `routesense_incidents_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B6B6B] hover:text-[#171717] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV ({filteredIncidents.length})
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#171717]">Historical Operational Records</h2>
        <p className="text-xs text-[#6B6B6B] mt-0.5">
          Comprehensive incident audit trail, recurring trends, and resolution logs
        </p>
      </div>

      {/* Filters Bar (PRD Section 12) */}
      <div className="rs-card p-4 sm:p-5 border border-neutral-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#FF6B00]" /> Filter Records
          </span>
          <span className="text-xs font-bold text-[#FF6B00]">
            {filteredIncidents.length} Match{filteredIncidents.length === 1 ? '' : 'es'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Route Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Route</label>
            <select
              value={routeFilter}
              onChange={e => setRouteFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden cursor-pointer"
            >
              <option value="all">All Corridors ({routes.length})</option>
              {routes.map(r => (
                <option key={r.routeId} value={r.routeId}>
                  Route {r.routeNumber} — {r.routeName.split('↔')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden cursor-pointer"
            >
              <option value="today">Today (Last 24h)</option>
              <option value="7_days">Last 7 Days</option>
              <option value="30_days">Last 30 Days</option>
            </select>
          </div>

          {/* Incident Type */}
          <div>
            <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Incident Type</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="delay">Delay / Traffic</option>
              <option value="breakdown">Breakdown</option>
              <option value="obstruction">Obstruction</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Resolution Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open Alerts</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search keywords, driver name, location, or details..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-neutral-200 text-xs text-[#171717] focus:border-[#FF6B00] outline-hidden"
          />
        </div>
      </div>

      {/* Incidents Table / List */}
      <div className="space-y-3">
        {filteredIncidents.length === 0 ? (
          <div className="rs-card p-12 text-center">
            <AlertTriangle className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#171717]">No incidents found</p>
            <p className="text-xs text-[#6B6B6B] mt-1">There are no incidents matching your selected filter criteria.</p>
          </div>
        ) : (
          filteredIncidents.map(inc => (
            <div
              key={inc.incidentId}
              onClick={() => setSelectedIncident(inc)}
              className="rs-card rs-card-hover p-4 sm:p-5 border border-neutral-100/90 cursor-pointer transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[#171717]">Route {inc.routeNumber}</span>
                  <span className="text-xs text-[#6B6B6B] hidden sm:inline">({inc.routeName})</span>
                  <StatusBadge status={inc.type} size="sm" />
                  <StatusBadge status={inc.status} size="sm" />
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                  <span className="font-mono">{new Date(inc.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  <span>•</span>
                  <span className="font-mono">{new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <p className="text-xs text-[#171717] font-semibold leading-relaxed">
                {inc.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6B6B6B] pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                    {inc.locationName}
                  </span>
                  <span>Bus: <strong className="text-neutral-800">{inc.busNumber}</strong></span>
                  <span>Driver: <strong className="text-neutral-800">{inc.driverName}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#FF6B00]">+{inc.delayMinutes} min delay</span>
                  {inc.status === 'open' && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        resolveIncident(inc.incidentId);
                      }}
                      className="px-2.5 py-1 bg-[#22A06B] hover:bg-emerald-600 text-white rounded-lg font-bold text-[10px] cursor-pointer"
                    >
                      Resolve ✓
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Incident Detail / Resolution Drawer */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 border border-neutral-100">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#171717]">Incident Dossier</h3>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={selectedIncident.type} />
              <StatusBadge status={selectedIncident.severity} />
              <StatusBadge status={selectedIncident.status} />
            </div>

            {selectedIncident.photoUrl && (
              <div className="w-full h-44 rounded-2xl overflow-hidden border border-neutral-200">
                <img src={selectedIncident.photoUrl} alt="Proof" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">Description</span>
              <p className="text-xs text-[#171717] font-semibold">{selectedIncident.description}</p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Location:</span>
                <span className="font-bold text-[#171717]">{selectedIncident.locationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Reported By Driver:</span>
                <span className="font-bold text-[#171717]">{selectedIncident.driverName} ({selectedIncident.busNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Delay Incurred:</span>
                <span className="font-bold text-[#FF6B00]">+{selectedIncident.delayMinutes} minutes</span>
              </div>
              {selectedIncident.resolvedAt && (
                <div className="flex justify-between text-[#22A06B]">
                  <span>Resolved Timestamp:</span>
                  <span className="font-mono font-bold">{new Date(selectedIncident.resolvedAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            {selectedIncident.status !== 'resolved' ? (
              <button
                onClick={() => {
                  resolveIncident(selectedIncident.incidentId);
                  setSelectedIncident(null);
                }}
                className="w-full py-3 bg-[#22A06B] hover:bg-emerald-600 text-white rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark as Resolved by Operations
              </button>
            ) : (
              <div className="text-center text-xs font-bold text-[#22A06B] p-2 bg-emerald-50 rounded-xl">
                Incident Resolved & Logged ✓
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
