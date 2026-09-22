import 'package:flutter/material.dart';
import '../models/route_model.dart';
import '../services/firestore_service.dart';

class RouteProvider extends ChangeNotifier {
  final FirestoreService _firestore = FirestoreService();
  List<RouteModel> _routes = [];
  String _searchQuery = '';

  List<RouteModel> get routes {
    if (_searchQuery.trim().isEmpty) return _routes;
    final q = _searchQuery.toLowerCase();
    return _routes.where((r) {
      return r.routeName.toLowerCase().contains(q) ||
          r.routeNumber.toLowerCase().contains(q) ||
          r.scheduledStops.any((s) => s.name.toLowerCase().contains(q));
    }).toList();
  }

  String get searchQuery => _searchQuery;

  RouteProvider() {
    _routes = _firestore.routes;
    _firestore.routesStream.listen((updated) {
      _routes = updated;
      notifyListeners();
    });
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  RouteModel? getRouteById(String routeId) {
    try {
      return _routes.firstWhere((r) => r.routeId == routeId);
    } catch (_) {
      return null;
    }
  }
}
