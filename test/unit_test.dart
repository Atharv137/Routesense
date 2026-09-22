import 'package:flutter_test/flutter_test.dart';
import 'package:routesense/core/utils/formatters.dart';
import 'package:routesense/models/bus_model.dart';
import 'package:routesense/models/incident_model.dart';
import 'package:routesense/models/ticket_model.dart';

void main() {
  group('Formatters Test', () {
    test('currency formatting', () {
      expect(Formatters.currency(25), contains('25'));
    });

    test('time format', () {
      final dt = DateTime(2026, 9, 22, 14, 30);
      expect(Formatters.time(dt), contains('02:30'));
    });

    test('date format', () {
      final dt = DateTime(2026, 9, 22, 14, 30);
      expect(Formatters.date(dt), contains('2026'));
    });
  });

  group('Models Serialization Test', () {
    test('TicketModel serialization roundtrip', () {
      final ticket = TicketModel(
        ticketId: 'TCK-1234',
        tripId: 'TRIP-101',
        routeId: 'route_101',
        routeName: 'Majestic to Electronic City',
        routeNumber: '356-M',
        busNumber: 'KA-01-F-1001',
        fromStop: 'Majestic Terminal',
        toStop: 'Electronic City Phase 1',
        passengerCount: 2,
        fare: 45.0,
        totalFare: 90.0,
        paymentType: 'razorpay_digital',
        timestamp: '2026-09-22T10:00:00Z',
        qrCodeData: 'ROUTESENSE:TCK-1234',
        issuedByRole: 'passenger',
      );

      final json = ticket.toJson();
      expect(json['ticketId'], 'TCK-1234');
      expect(json['totalFare'], 90.0);
      expect(ticket.isDigital, true);

      final fromJson = TicketModel.fromJson(json);
      expect(fromJson.ticketId, ticket.ticketId);
      expect(fromJson.totalFare, ticket.totalFare);
      expect(fromJson.passengerCount, 2);
    });

    test('BusModel serialization roundtrip', () {
      final bus = BusModel(
        busId: 'BUS-01',
        busNumber: 'KA-01-F-1001',
        routeId: 'route_101',
        routeName: 'Majestic to Electronic City',
        routeNumber: '356-M',
        driverId: 'drv_1',
        driverName: 'Ramesh K',
        conductorId: 'cnd_1',
        conductorName: 'Suresh M',
        capacity: 60,
        currentLoad: 75,
        currentPassengers: 45,
        status: 'on_time',
        currentSpeed: 35,
        nextStop: 'Silk Board',
        etaNextStopMin: 4,
        latitude: 12.9716,
        longitude: 77.5946,
        lastUpdated: '2026-09-22T12:00:00Z',
      );

      final json = bus.toJson();
      expect(json['busId'], 'BUS-01');
      expect(json['currentLoad'], 75);

      final fromJson = BusModel.fromJson(json);
      expect(fromJson.busId, bus.busId);
      expect(fromJson.busNumber, bus.busNumber);
      expect(fromJson.isOnTime, true);
    });

    test('IncidentModel serialization roundtrip', () {
      final incident = IncidentModel(
        incidentId: 'INC-999',
        routeId: 'route_101',
        routeName: 'Majestic to Electronic City',
        routeNumber: '356-M',
        busId: 'BUS-01',
        busNumber: 'KA-01-F-1001',
        driverId: 'drv_1',
        driverName: 'Ramesh K',
        type: 'breakdown',
        description: 'Flat tire near Silk Board',
        severity: 'high',
        status: 'open',
        delayMinutes: 20,
        locationName: 'Silk Board Junction',
        timestamp: '2026-09-22T13:00:00Z',
      );

      final json = incident.toJson();
      expect(json['incidentId'], 'INC-999');
      expect(json['type'], 'breakdown');

      final fromJson = IncidentModel.fromJson(json);
      expect(fromJson.incidentId, incident.incidentId);
      expect(fromJson.delayMinutes, 20);
      expect(fromJson.isOpen, true);
    });
  });
}
