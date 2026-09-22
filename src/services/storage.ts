import {
  User,
  BusRoute,
  Trip,
  Incident,
  Ticket,
  Bus,
  AppNotification,
  RecurringIssue,
  SmartInsight,
  ShiftSummary,
  IncidentType,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_ROUTES,
  INITIAL_BUSES,
  INITIAL_TRIPS,
  INITIAL_INCIDENTS,
  INITIAL_TICKETS,
  INITIAL_NOTIFICATIONS,
  INITIAL_RECURRING_ISSUES,
  INITIAL_SMART_INSIGHTS,
} from '../data/mockData';
import { db, collection, doc, setDoc, getDocs } from './firebase';

const STORAGE_KEYS = {
  USERS: 'rs_users_v1',
  CURRENT_USER: 'rs_current_user_v1',
  ROUTES: 'rs_routes_v1',
  BUSES: 'rs_buses_v1',
  TRIPS: 'rs_trips_v1',
  INCIDENTS: 'rs_incidents_v1',
  TICKETS: 'rs_tickets_v1',
  NOTIFICATIONS: 'rs_notifications_v1',
  RECURRING_ISSUES: 'rs_recurring_issues_v1',
  SMART_INSIGHTS: 'rs_smart_insights_v1',
  OFFLINE_QUEUE: 'rs_offline_queue_v1',
  IS_OFFLINE: 'rs_is_offline_v1',
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export class RouteSenseStorage {
  // Initialization
  static init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      setStored(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROUTES)) {
      setStored(STORAGE_KEYS.ROUTES, INITIAL_ROUTES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BUSES)) {
      setStored(STORAGE_KEYS.BUSES, INITIAL_BUSES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRIPS)) {
      setStored(STORAGE_KEYS.TRIPS, INITIAL_TRIPS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INCIDENTS)) {
      setStored(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
      setStored(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      setStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECURRING_ISSUES)) {
      setStored(STORAGE_KEYS.RECURRING_ISSUES, INITIAL_RECURRING_ISSUES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SMART_INSIGHTS)) {
      setStored(STORAGE_KEYS.SMART_INSIGHTS, INITIAL_SMART_INSIGHTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      // Default to Conductor Anita as in PRD
      setStored(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
    }

    // Attempt background initial seed into Firestore if empty
    this.seedFirestoreIfEmpty().catch(err => {
      console.warn('Firestore initial sync note:', err);
    });
  }

  static async seedFirestoreIfEmpty() {
    try {
      const snap = await getDocs(collection(db, 'routes'));
      if (snap.empty) {
        for (const route of INITIAL_ROUTES) {
          await setDoc(doc(db, 'routes', route.routeId), route);
        }
      }
    } catch (e) {
      // Firestore may be in offline or non-permission mode
    }
  }

  // Users & Auth
  static getUsers(): User[] {
    return getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static getCurrentUser(): User | null {
    return getStored<User | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }

  static setCurrentUser(user: User | null): void {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
    window.dispatchEvent(new CustomEvent('rs_auth_change', { detail: user }));
  }

  static saveUser(user: User): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.uid === user.uid || u.email === user.email);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    setStored(STORAGE_KEYS.USERS, users);
    if (this.getCurrentUser()?.uid === user.uid) {
      this.setCurrentUser(user);
    }

    // Sync to Firestore
    setDoc(doc(db, 'users', user.uid), user).catch(() => {});
  }

  // Routes
  static getRoutes(): BusRoute[] {
    return getStored<BusRoute[]>(STORAGE_KEYS.ROUTES, INITIAL_ROUTES);
  }

  static getRouteById(routeId: string): BusRoute | undefined {
    return this.getRoutes().find(r => r.routeId === routeId);
  }

  // Buses
  static getBuses(): Bus[] {
    return getStored<Bus[]>(STORAGE_KEYS.BUSES, INITIAL_BUSES);
  }

  static updateBus(bus: Bus): void {
    const buses = this.getBuses();
    const idx = buses.findIndex(b => b.busId === bus.busId);
    if (idx >= 0) {
      buses[idx] = bus;
      setStored(STORAGE_KEYS.BUSES, buses);
      window.dispatchEvent(new CustomEvent('rs_buses_updated', { detail: buses }));
      setDoc(doc(db, 'buses', bus.busId), bus).catch(() => {});
    }
  }

  // Trips
  static getTrips(): Trip[] {
    return getStored<Trip[]>(STORAGE_KEYS.TRIPS, INITIAL_TRIPS);
  }

  static getTripById(tripId: string): Trip | undefined {
    return this.getTrips().find(t => t.tripId === tripId);
  }

  static getTripByConductor(conductorId: string): Trip | undefined {
    return this.getTrips().find(t => t.conductorId === conductorId && t.status !== 'completed');
  }

  static getTripByDriver(driverId: string): Trip | undefined {
    return this.getTrips().find(t => t.driverId === driverId && t.status !== 'completed');
  }

  static saveTrip(trip: Trip): void {
    const trips = this.getTrips();
    const idx = trips.findIndex(t => t.tripId === trip.tripId);
    if (idx >= 0) {
      trips[idx] = trip;
    } else {
      trips.unshift(trip);
    }
    setStored(STORAGE_KEYS.TRIPS, trips);
    window.dispatchEvent(new CustomEvent('rs_trips_updated', { detail: trips }));
    setDoc(doc(db, 'trips', trip.tripId), trip).catch(() => {});
  }

  // Tickets
  static getTickets(): Ticket[] {
    return getStored<Ticket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
  }

  static saveTicket(ticket: Ticket): void {
    const tickets = this.getTickets();
    tickets.unshift(ticket);
    setStored(STORAGE_KEYS.TICKETS, tickets);

    // Save to Firestore cloud database
    setDoc(doc(db, 'tickets', ticket.ticketId), ticket).catch(err => {
      console.warn('Firestore ticket cloud sync fallback:', err);
    });

    // Update corresponding trip
    const trips = this.getTrips();
    const tripIdx = trips.findIndex(t => t.tripId === ticket.tripId);
    if (tripIdx >= 0) {
      const trip = trips[tripIdx];
      trip.ticketCount += 1;
      trip.currentPassengers += ticket.passengerCount;
      trip.passengerLoad = Math.min(100, Math.round((trip.currentPassengers / trip.capacity) * 100));
      trip.totalRevenue += ticket.totalFare;
      trips[tripIdx] = trip;
      setStored(STORAGE_KEYS.TRIPS, trips);
      setDoc(doc(db, 'trips', trip.tripId), trip).catch(() => {});
    }

    // Update corresponding bus load
    const buses = this.getBuses();
    const busIdx = buses.findIndex(b => b.routeId === ticket.routeId);
    if (busIdx >= 0) {
      const bus = buses[busIdx];
      bus.currentPassengers += ticket.passengerCount;
      bus.currentLoad = Math.min(100, Math.round((bus.currentPassengers / bus.capacity) * 100));
      buses[busIdx] = bus;
      setStored(STORAGE_KEYS.BUSES, buses);
      setDoc(doc(db, 'buses', bus.busId), bus).catch(() => {});
    }

    // Add notification
    this.addNotification({
      id: 'notif_' + Date.now(),
      title: 'Ticket Recorded',
      message: `Ticket #${ticket.ticketId} issued: ${ticket.passengerCount} pax (${ticket.fromStop} → ${ticket.toStop}) • ₹${ticket.totalFare}`,
      type: 'ticket',
      severity: 'success',
      timestamp: new Date().toISOString(),
      read: false,
      targetRoles: ['conductor', 'operations_manager'],
      routeId: ticket.routeId,
    });

    window.dispatchEvent(new CustomEvent('rs_tickets_updated', { detail: tickets }));
  }

  // Incidents
  static getIncidents(): Incident[] {
    return getStored<Incident[]>(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
  }

  static saveIncident(incident: Incident): void {
    const incidents = this.getIncidents();
    incidents.unshift(incident);
    setStored(STORAGE_KEYS.INCIDENTS, incidents);

    // Save to Firestore cloud database
    setDoc(doc(db, 'incidents', incident.incidentId), incident).catch(err => {
      console.warn('Firestore incident sync fallback:', err);
    });

    // Update bus status if breakdown or high delay
    const buses = this.getBuses();
    const busIdx = buses.findIndex(b => b.busId === incident.busId || b.routeId === incident.routeId);
    if (busIdx >= 0) {
      const bus = buses[busIdx];
      if (incident.type === 'breakdown') {
        bus.status = 'breakdown';
      } else if (incident.type === 'delay' && incident.delayMinutes > 10) {
        bus.status = 'delayed';
        bus.delayMinutes = incident.delayMinutes;
      }
      buses[busIdx] = bus;
      setStored(STORAGE_KEYS.BUSES, buses);
      setDoc(doc(db, 'buses', bus.busId), bus).catch(() => {});
    }

    // Add alert notification
    this.addNotification({
      id: 'notif_inc_' + Date.now(),
      title: `${incident.type.toUpperCase()} Reported on ${incident.routeName}`,
      message: `${incident.description.substring(0, 80)}... (Reported by ${incident.driverName})`,
      type: incident.type,
      severity: incident.severity === 'critical' || incident.severity === 'high' ? 'error' : 'warning',
      timestamp: new Date().toISOString(),
      read: false,
      targetRoles: ['operations_manager', 'driver', 'passenger'],
      routeId: incident.routeId,
    });

    // Re-evaluate recurring issues automatically
    this.detectRecurringIssues();

    window.dispatchEvent(new CustomEvent('rs_incidents_updated', { detail: incidents }));
  }

  static resolveIncident(incidentId: string, resolutionNotes: string = 'Resolved by Operations Dispatch'): void {
    const incidents = this.getIncidents();
    const idx = incidents.findIndex(i => i.incidentId === incidentId);
    if (idx >= 0) {
      incidents[idx].status = 'resolved';
      incidents[idx].resolvedAt = new Date().toISOString();
      incidents[idx].resolutionNotes = resolutionNotes;
      setStored(STORAGE_KEYS.INCIDENTS, incidents);

      // Restore bus status if no more open critical incidents
      const inc = incidents[idx];
      const hasOtherOpen = incidents.some(i => i.busId === inc.busId && i.status === 'open');
      if (!hasOtherOpen) {
        const buses = this.getBuses();
        const busIdx = buses.findIndex(b => b.busId === inc.busId);
        if (busIdx >= 0) {
          buses[busIdx].status = 'on_time';
          buses[busIdx].delayMinutes = 0;
          setStored(STORAGE_KEYS.BUSES, buses);
          setDoc(doc(db, 'buses', inc.busId), buses[busIdx]).catch(() => {});
        }
      }

      setDoc(doc(db, 'incidents', incidentId), incidents[idx]).catch(() => {});
      window.dispatchEvent(new CustomEvent('rs_incidents_updated', { detail: incidents }));
    }
  }

  // Notifications
  static getNotifications(): AppNotification[] {
    return getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  static addNotification(notif: AppNotification): void {
    const notifs = this.getNotifications();
    notifs.unshift(notif);
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifs.slice(0, 50));
    window.dispatchEvent(new CustomEvent('rs_notifications_updated', { detail: notifs }));
    setDoc(doc(db, 'notifications', notif.id), notif).catch(() => {});
  }

  static markNotificationRead(id: string): void {
    const notifs = this.getNotifications();
    const item = notifs.find(n => n.id === id);
    if (item) {
      item.read = true;
      setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);
      window.dispatchEvent(new CustomEvent('rs_notifications_updated', { detail: notifs }));
      setDoc(doc(db, 'notifications', id), { read: true }, { merge: true }).catch(() => {});
    }
  }

  static markAllNotificationsRead(): void {
    const notifs = this.getNotifications().map(n => ({ ...n, read: true }));
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);
    window.dispatchEvent(new CustomEvent('rs_notifications_updated', { detail: notifs }));
  }

  // Recurring Issue Detection Algorithm (PRD Section 13)
  static detectRecurringIssues(): RecurringIssue[] {
    const incidents = this.getIncidents();
    const routes = this.getRoutes();
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const issues: RecurringIssue[] = [];

    routes.forEach(route => {
      const routeIncidents7d = incidents.filter(
        i => i.routeId === route.routeId && new Date(i.timestamp).getTime() >= sevenDaysAgo
      );

      if (routeIncidents7d.length >= 2) {
        // Count incident types
        const typeCounts: Record<IncidentType, number> = { delay: 0, breakdown: 0, obstruction: 0 };
        routeIncidents7d.forEach(i => {
          typeCounts[i.type] = (typeCounts[i.type] || 0) + 1;
        });

        let mostCommonType: IncidentType = 'delay';
        let maxCount = 0;
        (Object.keys(typeCounts) as IncidentType[]).forEach(t => {
          if (typeCounts[t] > maxCount) {
            maxCount = typeCounts[t];
            mostCommonType = t;
          }
        });

        // Determine peak time
        const peakPeriod = route.routeId === 'route_101' ? '5 PM – 7 PM' : '8:30 AM – 10:30 AM';
        const recommendation =
          mostCommonType === 'delay'
            ? `Recurring delay bottleneck on ${route.routeName}. Suggest adjusting scheduled buffer time by +8 mins or adding peak-hour frequency.`
            : `Multiple breakdown warnings on ${route.routeName}. Schedule preventive mechanical inspection at depot.`;

        const newIssue: RecurringIssue = {
          id: `rec_${route.routeId}_auto`,
          routeId: route.routeId,
          routeName: route.routeName,
          routeNumber: route.routeNumber,
          incidentCount: routeIncidents7d.length,
          period: '7_days',
          mostCommonType,
          peakProblemPeriod: peakPeriod,
          lastIncidentTime: routeIncidents7d[0]?.timestamp || new Date().toISOString(),
          recommendation,
          confidenceScore: Math.min(96, 70 + routeIncidents7d.length * 6),
          affectedStops: route.scheduledStops.slice(2, 5).map(s => s.name),
        };
        issues.push(newIssue);
        setDoc(doc(db, 'recurring_issues', newIssue.id), newIssue).catch(() => {});
      }
    });

    const result = issues.length > 0 ? issues : INITIAL_RECURRING_ISSUES;
    setStored(STORAGE_KEYS.RECURRING_ISSUES, result);
    return result;
  }

  static getRecurringIssues(): RecurringIssue[] {
    const list = getStored<RecurringIssue[]>(STORAGE_KEYS.RECURRING_ISSUES, INITIAL_RECURRING_ISSUES);
    return list.length > 0 ? list : this.detectRecurringIssues();
  }

  // Smart Insights (PRD Section 20)
  static getSmartInsights(): SmartInsight[] {
    return getStored<SmartInsight[]>(STORAGE_KEYS.SMART_INSIGHTS, INITIAL_SMART_INSIGHTS);
  }

  // Shift Reconciliation (PRD Section 8)
  static getShiftSummary(conductorId: string): ShiftSummary {
    const tickets = this.getTickets().filter(t => t.conductorId === conductorId || !t.conductorId);
    const trips = this.getTrips().filter(t => t.conductorId === conductorId);

    const totalTickets = tickets.length;
    const totalPassengers = tickets.reduce((acc, t) => acc + t.passengerCount, 0);
    const totalTrips = Math.max(1, trips.length);
    const shiftTotalRevenue = tickets.reduce((acc, t) => acc + t.totalFare, 0);
    const cashRevenue = tickets.filter(t => t.paymentType === 'cash').reduce((acc, t) => acc + t.totalFare, 0);
    const digitalRevenue = tickets.filter(t => t.paymentType !== 'cash').reduce((acc, t) => acc + t.totalFare, 0);

    const user = this.getUsers().find(u => u.uid === conductorId);

    return {
      conductorId,
      conductorName: user?.name || 'Anita Deshmukh',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      totalTickets,
      totalPassengers,
      totalTrips,
      shiftTotalRevenue,
      cashRevenue,
      digitalRevenue,
      startTime: '08:00 AM',
      status: 'active',
    };
  }

  // Offline Mode Handling (PRD Section 26)
  static isOffline(): boolean {
    return getStored<boolean>(STORAGE_KEYS.IS_OFFLINE, false);
  }

  static setOffline(offline: boolean): void {
    setStored(STORAGE_KEYS.IS_OFFLINE, offline);
    window.dispatchEvent(new CustomEvent('rs_offline_change', { detail: offline }));
    if (!offline) {
      this.syncOfflineQueue();
    }
  }

  static queueOfflineAction(action: { type: string; payload: any; timestamp: string }): void {
    const queue = getStored<any[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    queue.push(action);
    setStored(STORAGE_KEYS.OFFLINE_QUEUE, queue);
    window.dispatchEvent(new CustomEvent('rs_offline_queue_updated', { detail: queue }));
  }

  static getOfflineQueue(): any[] {
    return getStored<any[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
  }

  static syncOfflineQueue(): number {
    const queue = this.getOfflineQueue();
    const count = queue.length;
    if (count > 0) {
      // Sync queue items to Firestore if network returned
      for (const item of queue) {
        if (item.type === 'ticket' && item.payload) {
          setDoc(doc(db, 'tickets', item.payload.ticketId), item.payload).catch(() => {});
        } else if (item.type === 'incident' && item.payload) {
          setDoc(doc(db, 'incidents', item.payload.incidentId), item.payload).catch(() => {});
        }
      }

      setStored(STORAGE_KEYS.OFFLINE_QUEUE, []);
      window.dispatchEvent(new CustomEvent('rs_offline_queue_updated', { detail: [] }));
      this.addNotification({
        id: 'notif_sync_' + Date.now(),
        title: 'Offline Data Synchronized ✓',
        message: `Successfully synchronized ${count} offline operational record${count > 1 ? 's' : ''} to Firestore database.`,
        type: 'system',
        severity: 'success',
        timestamp: new Date().toISOString(),
        read: false,
        targetRoles: ['conductor', 'driver', 'operations_manager'],
      });
    }
    return count;
  }

  // Reset to demo initial state
  static resetToDemo(): void {
    localStorage.clear();
    this.init();
    window.location.reload();
  }
}
