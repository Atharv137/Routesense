import 'dart:async';
import 'dart:math' as math;
import '../models/route_model.dart';
import '../models/bus_model.dart';
import '../models/trip_model.dart';
import '../models/ticket_model.dart';
import '../models/incident_model.dart';
import '../models/notification_model.dart';
import '../models/recurring_issue_model.dart';
import '../models/shift_model.dart';
import '../core/constants/initial_data.dart';
import 'bus_simulation_engine.dart';

class FirestoreService {
  static final FirestoreService _instance = FirestoreService._internal();
  factory FirestoreService() => _instance;

  FirestoreService._internal() {
    _routes = List.from(InitialData.routes);
    _buses = List.from(InitialData.buses);
    _trips = List.from(InitialData.trips);
    _tickets = List.from(InitialData.tickets);
    _incidents = List.from(InitialData.incidents);
    _notifications = List.from(InitialData.notifications);
    _recurringIssues = List.from(InitialData.recurringIssues);

    _startSimulation();
  }

  // Internal In-Memory cache mirroring Firestore real-time state
  late List<RouteModel> _routes;
  late List<BusModel> _buses;
  late List<TripModel> _trips;
  late List<TicketModel> _tickets;
  late List<IncidentModel> _incidents;
  late List<NotificationModel> _notifications;
  late List<RecurringIssueModel> _recurringIssues;

  final List<Map<String, dynamic>> _offlineQueue = [];
  bool _isOffline = false;

  // Stream controllers for real-time Firestore listeners
  final _routesController = StreamController<List<RouteModel>>.broadcast();
  final _busesController = StreamController<List<BusModel>>.broadcast();
  final _tripsController = StreamController<List<TripModel>>.broadcast();
  final _ticketsController = StreamController<List<TicketModel>>.broadcast();
  final _incidentsController = StreamController<List<IncidentModel>>.broadcast();
  final _notificationsController = StreamController<List<NotificationModel>>.broadcast();
  final _recurringIssuesController = StreamController<List<RecurringIssueModel>>.broadcast();

  // Getters
  List<RouteModel> get routes => List.unmodifiable(_routes);
  List<BusModel> get buses => List.unmodifiable(_buses);
  List<TripModel> get trips => List.unmodifiable(_trips);
  List<TicketModel> get tickets => List.unmodifiable(_tickets);
  List<IncidentModel> get incidents => List.unmodifiable(_incidents);
  List<NotificationModel> get notifications => List.unmodifiable(_notifications);
  List<RecurringIssueModel> get recurringIssues => List.unmodifiable(_recurringIssues);
  bool get isOffline => _isOffline;
  int get offlineQueueCount => _offlineQueue.length;

  // Streams
  Stream<List<RouteModel>> get routesStream => _routesController.stream;
  Stream<List<BusModel>> get busesStream => _busesController.stream;
  Stream<List<TripModel>> get tripsStream => _tripsController.stream;
  Stream<List<TicketModel>> get ticketsStream => _ticketsController.stream;
  Stream<List<IncidentModel>> get incidentsStream => _incidentsController.stream;
  Stream<List<NotificationModel>> get notificationsStream => _notificationsController.stream;
  Stream<List<RecurringIssueModel>> get recurringIssuesStream => _recurringIssuesController.stream;

  void _startSimulation() {
    BusSimulationEngine().start(
      () => _buses,
      () => _routes,
      (updatedBuses) {
        if (_isOffline) return;
        _buses = updatedBuses;
        _busesController.add(_buses);
      },
    );
  }

  void toggleOfflineMode() {
    _isOffline = !_isOffline;
    if (!_isOffline && _offlineQueue.isNotEmpty) {
      syncOfflineQueue();
    }
  }

  int syncOfflineQueue() {
    final count = _offlineQueue.length;
    if (count > 0) {
      _offlineQueue.clear();
      addNotification(NotificationModel(
        id: 'notif_sync_${DateTime.now().millisecondsSinceEpoch}',
        title: 'Offline Operations Synchronized ✓',
        message: 'Successfully committed $count offline record(s) to Cloud Firestore.',
        type: 'system',
        severity: 'success',
        timestamp: DateTime.now().toIso8601String(),
        targetRoles: ['conductor', 'driver', 'operations_manager'],
      ));
    }
    return count;
  }

  // --- CRUD: Tickets ---
  Future<TicketModel> issueTicket({
    required String tripId,
    required String routeId,
    required String fromStop,
    required String toStop,
    required int passengerCount,
    required String paymentType,
    String? passengerId,
    String? passengerName,
    String? conductorId,
    String? conductorName,
    String issuedByRole = 'conductor',
  }) async {
    final route = _routes.firstWhere((r) => r.routeId == routeId, orElse: () => _routes.first);
    final trip = _trips.firstWhere((t) => t.tripId == tripId, orElse: () => _trips.first);

    final fromIdx = route.scheduledStops.indexWhere((s) => s.name == fromStop);
    final toIdx = route.scheduledStops.indexWhere((s) => s.name == toStop);
    final dist = math.max(1, (toIdx - fromIdx).abs());
    final unitFare = dist <= 1 ? route.baseFare : route.baseFare + (dist - 1) * route.farePerStop;
    final totalFare = unitFare * passengerCount;
    final ticketNum = 'RS-${100000 + math.Random().nextInt(900000)}';

    final ticket = TicketModel(
      ticketId: ticketNum,
      tripId: trip.tripId,
      routeId: route.routeId,
      routeName: route.routeName,
      routeNumber: route.routeNumber,
      busNumber: trip.busNumber,
      passengerId: passengerId,
      passengerName: passengerName,
      fromStop: fromStop,
      toStop: toStop,
      passengerCount: passengerCount,
      fare: unitFare,
      totalFare: totalFare,
      paymentType: paymentType,
      paymentStatus: 'paid',
      timestamp: DateTime.now().toIso8601String(),
      qrCodeData: 'RS-TKT-$ticketNum|${route.routeNumber}|$fromStop-$toStop|${passengerCount}PAX|₹$totalFare',
      conductorId: conductorId ?? trip.conductorId,
      conductorName: conductorName ?? trip.conductorName,
      issuedByRole: issuedByRole,
    );

    if (_isOffline) {
      _offlineQueue.add({'type': 'TICKET', 'data': ticket.toJson()});
    }

    _tickets.insert(0, ticket);
    _ticketsController.add(_tickets);

    // Update active trip passenger stats
    final tripIdx = _trips.indexWhere((t) => t.tripId == tripId);
    if (tripIdx >= 0) {
      final t = _trips[tripIdx];
      final newPassengers = t.currentPassengers + passengerCount;
      final newLoad = math.min(100, ((newPassengers / t.capacity) * 100).round());
      _trips[tripIdx] = t.copyWith(
        ticketCount: t.ticketCount + 1,
        currentPassengers: newPassengers,
        passengerLoad: newLoad,
        totalRevenue: t.totalRevenue + totalFare,
      );
      _tripsController.add(_trips);
    }

    // Update corresponding bus load
    final busIdx = _buses.indexWhere((b) => b.routeId == routeId);
    if (busIdx >= 0) {
      final b = _buses[busIdx];
      final newPassengers = b.currentPassengers + passengerCount;
      final newLoad = math.min(100, ((newPassengers / b.capacity) * 100).round());
      _buses[busIdx] = b.copyWith(
        currentPassengers: newPassengers,
        currentLoad: newLoad,
      );
      _busesController.add(_buses);
    }

    addNotification(NotificationModel(
      id: 'notif_${DateTime.now().millisecondsSinceEpoch}',
      title: 'Ticket #$ticketNum Issued',
      message: '$passengerCount pax ($fromStop → $toStop) • ₹$totalFare (${paymentType == "cash" ? "Cash" : "Digital"})',
      type: 'ticket',
      severity: 'success',
      timestamp: DateTime.now().toIso8601String(),
      targetRoles: ['conductor', 'operations_manager'],
      routeId: routeId,
    ));

    return ticket;
  }

  // --- CRUD: Incidents ---
  Future<IncidentModel> reportIncident({
    required String routeId,
    String? busId,
    required String type,
    required String description,
    required String severity,
    required int delayMinutes,
    required String locationName,
    String? photoUrl,
    String? driverId,
    String? driverName,
  }) async {
    final route = _routes.firstWhere((r) => r.routeId == routeId, orElse: () => _routes.first);
    final bus = _buses.firstWhere((b) => b.busId == busId || b.routeId == routeId, orElse: () => _buses.first);

    final incident = IncidentModel(
      incidentId: 'inc_${DateTime.now().millisecondsSinceEpoch}',
      routeId: route.routeId,
      routeName: route.routeName,
      routeNumber: route.routeNumber,
      busId: bus.busId,
      busNumber: bus.busNumber,
      driverId: driverId ?? bus.driverId,
      driverName: driverName ?? bus.driverName,
      type: type,
      description: description,
      photoUrl: photoUrl,
      severity: severity,
      status: 'open',
      delayMinutes: delayMinutes,
      locationName: locationName,
      lat: bus.latitude,
      lng: bus.longitude,
      timestamp: DateTime.now().toIso8601String(),
    );

    if (_isOffline) {
      _offlineQueue.add({'type': 'INCIDENT', 'data': incident.toJson()});
    }

    _incidents.insert(0, incident);
    _incidentsController.add(_incidents);

    // Update bus state
    final busIdx = _buses.indexWhere((b) => b.busId == bus.busId);
    if (busIdx >= 0) {
      final b = _buses[busIdx];
      if (type == 'breakdown') {
        _buses[busIdx] = b.copyWith(status: 'breakdown');
      } else if (type == 'delay' && delayMinutes > 10) {
        _buses[busIdx] = b.copyWith(status: 'delayed', delayMinutes: delayMinutes);
      }
      _busesController.add(_buses);
    }

    addNotification(NotificationModel(
      id: 'notif_inc_${DateTime.now().millisecondsSinceEpoch}',
      title: '${type.toUpperCase()} Reported: ${route.routeNumber}',
      message: '$description (Reported at $locationName)',
      type: type,
      severity: severity == 'critical' || severity == 'high' ? 'error' : 'warning',
      timestamp: DateTime.now().toIso8601String(),
      targetRoles: ['operations_manager', 'driver', 'passenger'],
      routeId: routeId,
    ));

    _detectRecurringIssues();

    return incident;
  }

  void resolveIncident(String incidentId, [String notes = 'Resolved by Operations Dispatch']) {
    final idx = _incidents.indexWhere((i) => i.incidentId == incidentId);
    if (idx >= 0) {
      final current = _incidents[idx];
      _incidents[idx] = IncidentModel(
        incidentId: current.incidentId,
        routeId: current.routeId,
        routeName: current.routeName,
        routeNumber: current.routeNumber,
        busId: current.busId,
        busNumber: current.busNumber,
        driverId: current.driverId,
        driverName: current.driverName,
        type: current.type,
        description: current.description,
        photoUrl: current.photoUrl,
        severity: current.severity,
        status: 'resolved',
        delayMinutes: current.delayMinutes,
        locationName: current.locationName,
        lat: current.lat,
        lng: current.lng,
        timestamp: current.timestamp,
        resolvedAt: DateTime.now().toIso8601String(),
        resolutionNotes: notes,
      );
      _incidentsController.add(_incidents);

      // Restore bus status if no more open critical incidents on this bus
      final hasOpen = _incidents.any((i) => i.busId == current.busId && i.status == 'open');
      if (!hasOpen) {
        final busIdx = _buses.indexWhere((b) => b.busId == current.busId);
        if (busIdx >= 0) {
          _buses[busIdx] = _buses[busIdx].copyWith(status: 'on_time', delayMinutes: 0);
          _busesController.add(_buses);
        }
      }
    }
  }

  // --- Notifications ---
  void addNotification(NotificationModel notif) {
    _notifications.insert(0, notif);
    if (_notifications.length > 50) _notifications.removeLast();
    _notificationsController.add(_notifications);
  }

  void markNotificationRead(String id) {
    final idx = _notifications.indexWhere((n) => n.id == id);
    if (idx >= 0) {
      _notifications[idx] = _notifications[idx].copyWith(read: true);
      _notificationsController.add(_notifications);
    }
  }

  void markAllNotificationsRead() {
    _notifications = _notifications.map((n) => n.copyWith(read: true)).toList();
    _notificationsController.add(_notifications);
  }

  // --- Recurring Issues Detection Algorithm (PRD Section 13) ---
  void _detectRecurringIssues() {
    final now = DateTime.now();
    final sevenDaysAgo = now.subtract(const Duration(days: 7));

    for (final route in _routes) {
      final routeIncidents = _incidents.where((i) {
        if (i.routeId != route.routeId) return false;
        try {
          final dt = DateTime.parse(i.timestamp);
          return dt.isAfter(sevenDaysAgo);
        } catch (_) {
          return true;
        }
      }).toList();

      if (routeIncidents.length >= 2) {
        final existingIdx = _recurringIssues.indexWhere((r) => r.routeId == route.routeId);
        final issue = RecurringIssueModel(
          id: 'rec_${route.routeId}_auto',
          routeId: route.routeId,
          routeName: route.routeName,
          routeNumber: route.routeNumber,
          incidentCount: routeIncidents.length,
          period: '7_days',
          mostCommonType: routeIncidents.first.type,
          peakProblemPeriod: route.routeId == 'route_101' ? '5:30 PM – 7:30 PM' : '8:45 AM – 10:30 AM',
          lastIncidentTime: routeIncidents.first.timestamp,
          recommendation: 'Corridor ${route.routeNumber} exhibits cluster of ${routeIncidents.length} incidents in 7 days. Recommend dispatching 1 headway buffer bus or re-allocating signal priority.',
          confidenceScore: math.min(96, 70 + routeIncidents.length * 6),
          affectedStops: route.scheduledStops.take(3).map((s) => s.name).toList(),
        );

        if (existingIdx >= 0) {
          _recurringIssues[existingIdx] = issue;
        } else {
          _recurringIssues.insert(0, issue);
        }
      }
    }
    _recurringIssuesController.add(_recurringIssues);
  }

  // --- Shift Summary Calculation ---
  ShiftModel getShiftSummary(String conductorId) {
    final conductorTickets = _tickets.where((t) => t.conductorId == conductorId || t.conductorId == null).toList();
    final totalPax = conductorTickets.fold<int>(0, (sum, t) => sum + t.passengerCount);
    final totalRev = conductorTickets.fold<double>(0.0, (sum, t) => sum + t.totalFare);
    final cashRev = conductorTickets.where((t) => t.paymentType == 'cash').fold<double>(0.0, (sum, t) => sum + t.totalFare);
    final digitalRev = conductorTickets.where((t) => t.paymentType != 'cash').fold<double>(0.0, (sum, t) => sum + t.totalFare);

    return ShiftModel(
      conductorId: conductorId,
      conductorName: 'Anita Deshmukh',
      date: DateTime.now().toString().substring(0, 10),
      totalTickets: conductorTickets.length,
      totalPassengers: totalPax,
      totalTrips: 3,
      shiftTotalRevenue: totalRev,
      cashRevenue: cashRev,
      digitalRevenue: digitalRev,
      startTime: '08:00 AM',
      status: 'active',
    );
  }

  void dispose() {
    BusSimulationEngine().stop();
    _routesController.close();
    _busesController.close();
    _tripsController.close();
    _ticketsController.close();
    _incidentsController.close();
    _notificationsController.close();
    _recurringIssuesController.close();
  }
}
