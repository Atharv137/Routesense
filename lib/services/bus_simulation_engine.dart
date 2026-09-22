import 'dart:async';
import 'dart:math' as math;
import '../models/bus_model.dart';
import '../models/route_model.dart';

typedef OnBusesUpdatedCallback = void Function(List<BusModel> buses);

class BusSimulationEngine {
  static final BusSimulationEngine _instance = BusSimulationEngine._internal();
  factory BusSimulationEngine() => _instance;
  BusSimulationEngine._internal();

  Timer? _timer;
  bool _isRunning = false;
  OnBusesUpdatedCallback? onBusesUpdated;

  bool get isRunning => _isRunning;

  void start(List<BusModel> Function() getBuses, List<RouteModel> Function() getRoutes, OnBusesUpdatedCallback callback) {
    if (_isRunning) return;
    _isRunning = true;
    onBusesUpdated = callback;

    _timer = Timer.periodic(const Duration(seconds: 3), (_) {
      _tick(getBuses, getRoutes);
    });
  }

  void stop() {
    _timer?.cancel();
    _timer = null;
    _isRunning = false;
  }

  void _tick(List<BusModel> Function() getBuses, List<RouteModel> Function() getRoutes) {
    final buses = getBuses();
    final routes = getRoutes();

    final updated = buses.map((bus) {
      final route = routes.firstWhere(
        (r) => r.routeId == bus.routeId,
        orElse: () => routes.first,
      );

      if (bus.status == 'breakdown' || bus.status == 'maintenance') {
        return bus;
      }

      final stops = route.scheduledStops;
      if (stops.length < 2) return bus;

      // Find closest stop
      int closestIndex = 0;
      double minDistance = 999999.0;

      for (int i = 0; i < stops.length; i++) {
        final stop = stops[i];
        final d = math.sqrt(
          math.pow(stop.lat - bus.latitude, 2) + math.pow(stop.lng - bus.longitude, 2),
        );
        if (d < minDistance) {
          minDistance = d;
          closestIndex = i;
        }
      }

      final nextIndex = (closestIndex + 1) % stops.length;
      final targetStop = stops[nextIndex];

      const step = 0.0008; // ~80m per 3s = ~96 km/h max or slower
      final dLat = targetStop.lat - bus.latitude;
      final dLng = targetStop.lng - bus.longitude;
      final distToTarget = math.sqrt(dLat * dLat + dLng * dLng);

      double newLat = bus.latitude;
      double newLng = bus.longitude;
      int newSpeed = bus.currentSpeed;
      int newEta = bus.etaNextStopMin;

      if (distToTarget < 0.001) {
        // Reached stop
        newLat = targetStop.lat;
        newLng = targetStop.lng;
        final nextStopAfter = stops[(nextIndex + 1) % stops.length];
        newEta = math.max(1, nextStopAfter.etaMinutes > 0 ? nextStopAfter.etaMinutes : 5);
        newSpeed = math.Random().nextInt(10) + 15;
      } else {
        newLat += (dLat / distToTarget) * step;
        newLng += (dLng / distToTarget) * step;
        final speedDelta = math.Random().nextInt(7) - 3;
        newSpeed = math.max(12, math.min(48, bus.currentSpeed + speedDelta));
        newEta = math.max(1, (distToTarget * 120).round());
      }

      return bus.copyWith(
        latitude: double.parse(newLat.toStringAsFixed(6)),
        longitude: double.parse(newLng.toStringAsFixed(6)),
        currentSpeed: newSpeed,
        nextStop: targetStop.name,
        etaNextStopMin: newEta,
        lastUpdated: DateTime.now().toIso8601String(),
      );
    }).toList();

    onBusesUpdated?.call(updated);
  }
}
