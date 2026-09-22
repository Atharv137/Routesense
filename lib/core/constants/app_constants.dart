class AppConstants {
  static const String appName = 'RouteSense';
  static const String appTagline = 'Smarter Operations. Better Journeys.';
  static const String appVersion = '1.0.0';

  // Role names
  static const String rolePassenger = 'passenger';
  static const String roleConductor = 'conductor';
  static const String roleDriver = 'driver';
  static const String roleOperationsManager = 'operations_manager';
  static const String roleAdmin = 'admin';

  // Storage and Collection Keys
  static const String usersCollection = 'users';
  static const String routesCollection = 'routes';
  static const String busesCollection = 'buses';
  static const String tripsCollection = 'trips';
  static const String ticketsCollection = 'tickets';
  static const String incidentsCollection = 'incidents';
  static const String shiftsCollection = 'shifts';
  static const String notificationsCollection = 'notifications';
  static const String recurringIssuesCollection = 'recurring_issues';
  static const String smartInsightsCollection = 'smart_insights';

  // Simulation parameters
  static const Duration simulationInterval = Duration(seconds: 3);
}
