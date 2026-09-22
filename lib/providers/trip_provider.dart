import 'package:flutter/material.dart';
import '../models/trip_model.dart';
import '../services/firestore_service.dart';

class TripProvider extends ChangeNotifier {
  final FirestoreService _firestore = FirestoreService();
  List<TripModel> _trips = [];

  List<TripModel> get trips => _trips;

  TripProvider() {
    _trips = _firestore.trips;
    _firestore.tripsStream.listen((updated) {
      _trips = updated;
      notifyListeners();
    });
  }

  TripModel? getTripForDriver(String driverId) {
    try {
      return _trips.firstWhere(
        (t) => t.driverId == driverId && t.status != 'completed',
      );
    } catch (_) {
      return _trips.isNotEmpty ? _trips.first : null;
    }
  }

  TripModel? getTripForConductor(String conductorId) {
    try {
      return _trips.firstWhere(
        (t) => t.conductorId == conductorId && t.status != 'completed',
      );
    } catch (_) {
      return _trips.isNotEmpty ? _trips.first : null;
    }
  }
}
