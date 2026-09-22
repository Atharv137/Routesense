import 'package:flutter/material.dart';
import '../models/bus_model.dart';
import '../services/firestore_service.dart';

class BusProvider extends ChangeNotifier {
  final FirestoreService _firestore = FirestoreService();
  List<BusModel> _buses = [];
  String _filterRouteId = 'all';

  List<BusModel> get buses {
    if (_filterRouteId == 'all') return _buses;
    return _buses.where((b) => b.routeId == _filterRouteId).toList();
  }

  List<BusModel> get allBuses => _buses;
  String get filterRouteId => _filterRouteId;

  BusProvider() {
    _buses = _firestore.buses;
    _firestore.busesStream.listen((updated) {
      _buses = updated;
      notifyListeners();
    });
  }

  void setFilterRouteId(String routeId) {
    _filterRouteId = routeId;
    notifyListeners();
  }

  BusModel? getBusById(String busId) {
    try {
      return _buses.firstWhere((b) => b.busId == busId);
    } catch (_) {
      return null;
    }
  }

  BusModel? getBusByRoute(String routeId) {
    try {
      return _buses.firstWhere((b) => b.routeId == routeId);
    } catch (_) {
      return null;
    }
  }
}
