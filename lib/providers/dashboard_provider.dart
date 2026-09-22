import 'package:flutter/material.dart';
import '../models/notification_model.dart';
import '../models/recurring_issue_model.dart';
import '../models/shift_model.dart';
import '../services/firestore_service.dart';

class DashboardProvider extends ChangeNotifier {
  final FirestoreService _firestore = FirestoreService();
  List<NotificationModel> _notifications = [];
  List<RecurringIssueModel> _recurringIssues = [];

  List<NotificationModel> get notifications => _notifications;
  List<RecurringIssueModel> get recurringIssues => _recurringIssues;
  int get unreadNotificationCount => _notifications.where((n) => !n.read).length;

  bool get isOffline => _firestore.isOffline;
  int get offlineQueueCount => _firestore.offlineQueueCount;

  DashboardProvider() {
    _notifications = _firestore.notifications;
    _recurringIssues = _firestore.recurringIssues;

    _firestore.notificationsStream.listen((updated) {
      _notifications = updated;
      notifyListeners();
    });

    _firestore.recurringIssuesStream.listen((updated) {
      _recurringIssues = updated;
      notifyListeners();
    });
  }

  void toggleOfflineMode() {
    _firestore.toggleOfflineMode();
    notifyListeners();
  }

  int syncOfflineQueue() {
    final count = _firestore.syncOfflineQueue();
    notifyListeners();
    return count;
  }

  void markNotificationRead(String id) {
    _firestore.markNotificationRead(id);
    notifyListeners();
  }

  void markAllNotificationsRead() {
    _firestore.markAllNotificationsRead();
    notifyListeners();
  }

  ShiftModel getShiftSummary(String conductorId) {
    return _firestore.getShiftSummary(conductorId);
  }
}
