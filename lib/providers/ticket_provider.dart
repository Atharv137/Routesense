import 'package:flutter/material.dart';
import '../models/ticket_model.dart';
import '../services/firestore_service.dart';

class TicketProvider extends ChangeNotifier {
  final FirestoreService _firestore = FirestoreService();
  List<TicketModel> _tickets = [];
  bool _isIssuing = false;

  List<TicketModel> get tickets => _tickets;
  bool get isIssuing => _isIssuing;

  TicketProvider() {
    _tickets = _firestore.tickets;
    _firestore.ticketsStream.listen((updated) {
      _tickets = updated;
      notifyListeners();
    });
  }

  List<TicketModel> getTicketsForPassenger(String passengerId) {
    return _tickets.where((t) => t.passengerId == passengerId).toList();
  }

  List<TicketModel> getTicketsForConductor(String conductorId) {
    return _tickets.where((t) => t.conductorId == conductorId || t.conductorId == null).toList();
  }

  Future<TicketModel?> issueTicket({
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
    _isIssuing = true;
    notifyListeners();

    try {
      final ticket = await _firestore.issueTicket(
        tripId: tripId,
        routeId: routeId,
        fromStop: fromStop,
        toStop: toStop,
        passengerCount: passengerCount,
        paymentType: paymentType,
        passengerId: passengerId,
        passengerName: passengerName,
        conductorId: conductorId,
        conductorName: conductorName,
        issuedByRole: issuedByRole,
      );
      _isIssuing = false;
      notifyListeners();
      return ticket;
    } catch (e) {
      _isIssuing = false;
      notifyListeners();
      return null;
    }
  }
}
