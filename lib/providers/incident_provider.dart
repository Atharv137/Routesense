import 'package:flutter/material.dart';
import '../models/incident_model.dart';
import '../services/firestore_service.dart';

class IncidentProvider extends ChangeNotifier {
  final FirestoreService _firestore = FirestoreService();
  List<IncidentModel> _incidents = [];
  String _typeFilter = 'all';
  bool _isSubmitting = false;

  List<IncidentModel> get incidents {
    if (_typeFilter == 'all') return _incidents;
    return _incidents.where((i) => i.type == _typeFilter).toList();
  }

  List<IncidentModel> get allIncidents => _incidents;
  String get typeFilter => _typeFilter;
  bool get isSubmitting => _isSubmitting;

  int get openIncidentsCount => _incidents.where((i) => i.status == 'open').length;

  IncidentProvider() {
    _incidents = _firestore.incidents;
    _firestore.incidentsStream.listen((updated) {
      _incidents = updated;
      notifyListeners();
    });
  }

  void setTypeFilter(String filter) {
    _typeFilter = filter;
    notifyListeners();
  }

  Future<IncidentModel?> reportIncident({
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
    _isSubmitting = true;
    notifyListeners();

    try {
      final incident = await _firestore.reportIncident(
        routeId: routeId,
        busId: busId,
        type: type,
        description: description,
        severity: severity,
        delayMinutes: delayMinutes,
        locationName: locationName,
        photoUrl: photoUrl,
        driverId: driverId,
        driverName: driverName,
      );
      _isSubmitting = false;
      notifyListeners();
      return incident;
    } catch (e) {
      _isSubmitting = false;
      notifyListeners();
      return null;
    }
  }

  void resolveIncident(String incidentId, [String notes = 'Resolved by Operations Dispatch']) {
    _firestore.resolveIncident(incidentId, notes);
  }
}
