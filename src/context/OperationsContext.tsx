import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  BusRoute,
  Bus,
  Trip,
  Incident,
  Ticket,
  AppNotification,
  RecurringIssue,
  SmartInsight,
  ShiftSummary,
  IncidentType,
  IncidentSeverity,
} from '../types';
import { RouteSenseStorage } from '../services/storage';
import { busSimulation } from '../services/busSimulation';

interface OperationsContextType {
  routes: BusRoute[];
  buses: Bus[];
  trips: Trip[];
  incidents: Incident[];
  tickets: Ticket[];
  notifications: AppNotification[];
  recurringIssues: RecurringIssue[];
  smartInsights: SmartInsight[];
  unreadNotificationCount: number;
  isOffline: boolean;
  offlineQueueCount: number;
  toggleOfflineMode: () => void;
  syncOfflineData: () => number;
  syncOfflineQueue: () => number;
  logTicket: (params: {
    tripId: string;
    routeId: string;
    fromStop: string;
    toStop: string;
    passengerCount: number;
    paymentType: 'cash' | 'razorpay_digital';
    farePerPassenger?: number;
  }) => Ticket;
  reportIncident: (params: {
    routeId: string;
    busId?: string;
    type: IncidentType;
    description: string;
    severity: IncidentSeverity;
    delayMinutes: number;
    locationName: string;
    photoUrl?: string;
  }) => Incident;
  resolveIncident: (incidentId: string, notes?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  getShiftSummary: (conductorId: string) => ShiftSummary;
  refreshData: () => void;
  selectedRouteIdFilter: string | 'all';
  setSelectedRouteIdFilter: (id: string | 'all') => void;
  selectedIncidentTypeFilter: IncidentType | 'all';
  setSelectedIncidentTypeFilter: (type: IncidentType | 'all') => void;
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

export const OperationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routes, setRoutes] = useState<BusRoute[]>(() => RouteSenseStorage.getRoutes());
  const [buses, setBuses] = useState<Bus[]>(() => RouteSenseStorage.getBuses());
  const [trips, setTrips] = useState<Trip[]>(() => RouteSenseStorage.getTrips());
  const [incidents, setIncidents] = useState<Incident[]>(() => RouteSenseStorage.getIncidents());
  const [tickets, setTickets] = useState<Ticket[]>(() => RouteSenseStorage.getTickets());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => RouteSenseStorage.getNotifications());
  const [recurringIssues, setRecurringIssues] = useState<RecurringIssue[]>(() => RouteSenseStorage.getRecurringIssues());
  const [smartInsights, setSmartInsights] = useState<SmartInsight[]>(() => RouteSenseStorage.getSmartInsights());
  const [isOffline, setIsOffline] = useState<boolean>(() => RouteSenseStorage.isOffline());
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(() => RouteSenseStorage.getOfflineQueue().length);

  // Filters for Operations Manager
  const [selectedRouteIdFilter, setSelectedRouteIdFilter] = useState<string | 'all'>('all');
  const [selectedIncidentTypeFilter, setSelectedIncidentTypeFilter] = useState<IncidentType | 'all'>('all');

  const refreshData = useCallback(() => {
    setRoutes(RouteSenseStorage.getRoutes());
    setBuses(RouteSenseStorage.getBuses());
    setTrips(RouteSenseStorage.getTrips());
    setIncidents(RouteSenseStorage.getIncidents());
    setTickets(RouteSenseStorage.getTickets());
    setNotifications(RouteSenseStorage.getNotifications());
    setRecurringIssues(RouteSenseStorage.getRecurringIssues());
    setSmartInsights(RouteSenseStorage.getSmartInsights());
    setIsOffline(RouteSenseStorage.isOffline());
    setOfflineQueueCount(RouteSenseStorage.getOfflineQueue().length);
  }, []);

  useEffect(() => {
    RouteSenseStorage.init();
    busSimulation.start();

    const handleBuses = () => setBuses(RouteSenseStorage.getBuses());
    const handleTrips = () => setTrips(RouteSenseStorage.getTrips());
    const handleIncidents = () => {
      setIncidents(RouteSenseStorage.getIncidents());
      setRecurringIssues(RouteSenseStorage.getRecurringIssues());
    };
    const handleTickets = () => setTickets(RouteSenseStorage.getTickets());
    const handleNotifs = () => setNotifications(RouteSenseStorage.getNotifications());
    const handleOffline = (e: any) => setIsOffline(e.detail);
    const handleQueue = (e: any) => setOfflineQueueCount(e.detail.length);

    window.addEventListener('rs_buses_updated', handleBuses);
    window.addEventListener('rs_trips_updated', handleTrips);
    window.addEventListener('rs_incidents_updated', handleIncidents);
    window.addEventListener('rs_tickets_updated', handleTickets);
    window.addEventListener('rs_notifications_updated', handleNotifs);
    window.addEventListener('rs_offline_change', handleOffline);
    window.addEventListener('rs_offline_queue_updated', handleQueue);

    return () => {
      busSimulation.stop();
      window.removeEventListener('rs_buses_updated', handleBuses);
      window.removeEventListener('rs_trips_updated', handleTrips);
      window.removeEventListener('rs_incidents_updated', handleIncidents);
      window.removeEventListener('rs_tickets_updated', handleTickets);
      window.removeEventListener('rs_notifications_updated', handleNotifs);
      window.removeEventListener('rs_offline_change', handleOffline);
      window.removeEventListener('rs_offline_queue_updated', handleQueue);
    };
  }, [refreshData]);

  const toggleOfflineMode = () => {
    const nextState = !isOffline;
    RouteSenseStorage.setOffline(nextState);
    setIsOffline(nextState);
  };

  const syncOfflineData = () => {
    return RouteSenseStorage.syncOfflineQueue();
  };

  const logTicket = (params: {
    tripId: string;
    routeId: string;
    fromStop: string;
    toStop: string;
    passengerCount: number;
    paymentType: 'cash' | 'razorpay_digital';
    farePerPassenger?: number;
  }): Ticket => {
    const route = routes.find(r => r.routeId === params.routeId) || routes[0];
    const trip = trips.find(t => t.tripId === params.tripId) || trips[0];
    const currentUser = RouteSenseStorage.getCurrentUser();

    const fromIdx = route.scheduledStops.findIndex(s => s.name === params.fromStop);
    const toIdx = route.scheduledStops.findIndex(s => s.name === params.toStop);
    const stopDistance = Math.max(1, Math.abs(toIdx - fromIdx));

    const unitFare = params.farePerPassenger || route.baseFare + (stopDistance - 1) * route.farePerStop;
    const totalFare = unitFare * params.passengerCount;
    const ticketId = 'RS-' + Math.floor(100000 + Math.random() * 900000);

    const newTicket: Ticket = {
      ticketId,
      tripId: trip.tripId,
      routeId: route.routeId,
      routeName: route.routeName,
      routeNumber: route.routeNumber,
      busNumber: trip.busNumber,
      passengerId: currentUser?.role === 'passenger' ? currentUser.uid : undefined,
      passengerName: currentUser?.role === 'passenger' ? currentUser.name : undefined,
      fromStop: params.fromStop,
      toStop: params.toStop,
      passengerCount: params.passengerCount,
      fare: unitFare,
      totalFare,
      paymentType: params.paymentType,
      paymentStatus: 'paid',
      timestamp: new Date().toISOString(),
      qrCodeData: `RS-TKT-${ticketId}|${route.routeNumber}|${params.fromStop}-${params.toStop}|${params.passengerCount}PAX|₹${totalFare}`,
      conductorId: currentUser?.role === 'conductor' ? currentUser.uid : trip.conductorId,
      conductorName: currentUser?.role === 'conductor' ? currentUser.name : trip.conductorName,
      issuedByRole: currentUser?.role === 'conductor' ? 'conductor' : 'passenger',
    };

    if (isOffline) {
      RouteSenseStorage.queueOfflineAction({
        type: 'LOG_TICKET',
        payload: newTicket,
        timestamp: new Date().toISOString(),
      });
    }

    RouteSenseStorage.saveTicket(newTicket);
    refreshData();
    return newTicket;
  };

  const reportIncident = (params: {
    routeId: string;
    busId?: string;
    type: IncidentType;
    description: string;
    severity: IncidentSeverity;
    delayMinutes: number;
    locationName: string;
    photoUrl?: string;
  }): Incident => {
    const route = routes.find(r => r.routeId === params.routeId) || routes[0];
    const bus = buses.find(b => b.busId === params.busId || b.routeId === params.routeId) || buses[0];
    const currentUser = RouteSenseStorage.getCurrentUser();

    const newIncident: Incident = {
      incidentId: 'inc_' + Date.now(),
      routeId: route.routeId,
      routeName: route.routeName,
      routeNumber: route.routeNumber,
      busId: bus.busId,
      busNumber: bus.busNumber,
      driverId: currentUser?.uid || bus.driverId,
      driverName: currentUser?.name || bus.driverName,
      type: params.type,
      description: params.description,
      photoUrl: params.photoUrl,
      severity: params.severity,
      status: 'open',
      delayMinutes: params.delayMinutes,
      locationName: params.locationName,
      lat: bus.latitude,
      lng: bus.longitude,
      timestamp: new Date().toISOString(),
    };

    if (isOffline) {
      RouteSenseStorage.queueOfflineAction({
        type: 'REPORT_INCIDENT',
        payload: newIncident,
        timestamp: new Date().toISOString(),
      });
    }

    RouteSenseStorage.saveIncident(newIncident);
    refreshData();
    return newIncident;
  };

  const resolveIncident = (incidentId: string, notes: string = 'Resolved by Operations Desk') => {
    RouteSenseStorage.resolveIncident(incidentId, notes);
    refreshData();
  };

  const markNotificationRead = (id: string) => {
    RouteSenseStorage.markNotificationRead(id);
    refreshData();
  };

  const markAllNotificationsRead = () => {
    RouteSenseStorage.markAllNotificationsRead();
    refreshData();
  };

  const getShiftSummary = (conductorId: string): ShiftSummary => {
    return RouteSenseStorage.getShiftSummary(conductorId);
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <OperationsContext.Provider
      value={{
        routes,
        buses,
        trips,
        incidents,
        tickets,
        notifications,
        recurringIssues,
        smartInsights,
        unreadNotificationCount,
        isOffline,
        offlineQueueCount,
        toggleOfflineMode,
        syncOfflineData,
        syncOfflineQueue: syncOfflineData,
        logTicket,
        reportIncident,
        resolveIncident,
        markNotificationRead,
        markAllNotificationsRead,
        getShiftSummary,
        refreshData,
        selectedRouteIdFilter,
        setSelectedRouteIdFilter,
        selectedIncidentTypeFilter,
        setSelectedIncidentTypeFilter,
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
};

export const useOperations = (): OperationsContextType => {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
};
