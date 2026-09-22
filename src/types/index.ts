export type UserRole = 'conductor' | 'driver' | 'operations_manager' | 'passenger';

export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  routeAssigned?: string;
  busAssigned?: string;
  profilePhoto?: string;
  createdAt: string;
  employeeId?: string;
  shiftStatus?: 'on_duty' | 'off_duty' | 'on_break';
}

export interface Stop {
  stopId: string;
  name: string;
  order: number;
  etaMinutes: number;
  lat: number;
  lng: number;
  isMajor?: boolean;
}

export interface BusRoute {
  routeId: string;
  routeName: string;
  routeNumber: string;
  startPoint: string;
  endPoint: string;
  scheduledStops: Stop[];
  farePerStop: number;
  baseFare: number;
  activeFlag: boolean;
  totalDistanceKm: number;
  avgDurationMin: number;
  frequencyMin: number;
  activeBusesCount: number;
  createdAt: string;
}

export interface Trip {
  tripId: string;
  routeId: string;
  routeName: string;
  routeNumber: string;
  busId: string;
  busNumber: string;
  conductorId: string;
  conductorName: string;
  driverId: string;
  driverName: string;
  ticketCount: number;
  passengerLoad: number; // percentage 0-100
  capacity: number;
  currentPassengers: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  startTime: string;
  endTime?: string;
  timestamp: string;
  currentStopIndex: number;
  currentStopName: string;
  nextStopName: string;
  direction: 'UP' | 'DOWN';
  totalRevenue: number;
  delayMinutes: number;
}

export type IncidentType = 'delay' | 'breakdown' | 'obstruction';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'in_review' | 'resolved';

export interface Incident {
  incidentId: string;
  routeId: string;
  routeName: string;
  routeNumber: string;
  busId: string;
  busNumber: string;
  driverId: string;
  driverName: string;
  type: IncidentType;
  description: string;
  photoUrl?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  delayMinutes: number;
  locationName: string;
  lat?: number;
  lng?: number;
  timestamp: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface Ticket {
  ticketId: string;
  tripId: string;
  routeId: string;
  routeName: string;
  routeNumber: string;
  busNumber: string;
  passengerId?: string;
  passengerName?: string;
  fromStop: string;
  toStop: string;
  passengerCount: number;
  fare: number;
  totalFare: number;
  paymentType: 'cash' | 'razorpay_digital' | 'pass';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  timestamp: string;
  qrCodeData: string;
  conductorId?: string;
  conductorName?: string;
  issuedByRole: 'conductor' | 'passenger';
}

export type BusStatus = 'on_time' | 'delayed' | 'breakdown' | 'idle' | 'maintenance';

export interface Bus {
  busId: string;
  busNumber: string;
  routeId: string;
  routeName: string;
  routeNumber: string;
  driverId: string;
  driverName: string;
  conductorId: string;
  conductorName: string;
  capacity: number;
  currentLoad: number; // percentage
  currentPassengers: number;
  status: BusStatus;
  currentSpeed: number; // km/h
  nextStop: string;
  etaNextStopMin: number;
  latitude: number;
  longitude: number;
  lastUpdated: string;
  delayMinutes: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'delay' | 'breakdown' | 'obstruction' | 'ticket' | 'recurring' | 'system';
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  targetRoles: UserRole[];
  routeId?: string;
  link?: string;
}

export interface PaymentRecord {
  paymentId: string;
  ticketId: string;
  userId: string;
  amount: number;
  status: 'captured' | 'failed' | 'processing';
  method: 'upi' | 'card' | 'netbanking' | 'wallet';
  razorpayPaymentId: string;
  timestamp: string;
}

export interface RecurringIssue {
  id: string;
  routeId: string;
  routeName: string;
  routeNumber: string;
  incidentCount: number;
  period: '7_days' | '30_days';
  mostCommonType: IncidentType;
  peakProblemPeriod: string;
  lastIncidentTime: string;
  recommendation: string;
  confidenceScore: number;
  affectedStops: string[];
}

export interface SmartInsight {
  id: string;
  title: string;
  routeId: string;
  routeName: string;
  summary: string;
  recommendation: string;
  type: 'capacity_alert' | 'delay_pattern' | 'fuel_efficiency' | 'revenue_peak';
  metricValue: string;
  timestamp: string;
}

export interface ShiftSummary {
  conductorId: string;
  conductorName: string;
  date: string;
  totalTickets: number;
  totalPassengers: number;
  totalTrips: number;
  shiftTotalRevenue: number;
  cashRevenue: number;
  digitalRevenue: number;
  startTime: string;
  endTime?: string;
  status: 'active' | 'closed';
}

export interface GroundingCitation {
  title?: string;
  url?: string;
  source?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: string;
  modelUsed?: string;
  groundingType?: 'google_search' | 'google_maps' | 'standard';
  citations?: GroundingCitation[];
  groundingChunks?: Array<{
    web?: { uri: string; title: string };
    maps?: { title?: string; address?: string; placeId?: string; uri?: string };
  }>;
}
