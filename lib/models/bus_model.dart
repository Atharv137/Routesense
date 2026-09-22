class BusModel {
  final String busId;
  final String busNumber;
  final String routeId;
  final String routeName;
  final String routeNumber;
  final String driverId;
  final String driverName;
  final String conductorId;
  final String conductorName;
  final int capacity;
  final int currentLoad; // Percentage 0-100
  final int currentPassengers;
  final String status; // 'on_time' | 'delayed' | 'breakdown' | 'idle' | 'maintenance'
  final int currentSpeed; // km/h
  final String nextStop;
  final int etaNextStopMin;
  final double latitude;
  final double longitude;
  final String lastUpdated;
  final int delayMinutes;

  BusModel({
    required this.busId,
    required this.busNumber,
    required this.routeId,
    required this.routeName,
    required this.routeNumber,
    required this.driverId,
    required this.driverName,
    required this.conductorId,
    required this.conductorName,
    required this.capacity,
    required this.currentLoad,
    required this.currentPassengers,
    required this.status,
    required this.currentSpeed,
    required this.nextStop,
    required this.etaNextStopMin,
    required this.latitude,
    required this.longitude,
    required this.lastUpdated,
    this.delayMinutes = 0,
  });

  bool get isOnTime => status == 'on_time';
  bool get isDelayed => status == 'delayed';
  bool get isBreakdown => status == 'breakdown';

  factory BusModel.fromJson(Map<String, dynamic> json) {
    return BusModel(
      busId: json['busId'] as String? ?? '',
      busNumber: json['busNumber'] as String? ?? '',
      routeId: json['routeId'] as String? ?? '',
      routeName: json['routeName'] as String? ?? '',
      routeNumber: json['routeNumber'] as String? ?? '',
      driverId: json['driverId'] as String? ?? '',
      driverName: json['driverName'] as String? ?? '',
      conductorId: json['conductorId'] as String? ?? '',
      conductorName: json['conductorName'] as String? ?? '',
      capacity: (json['capacity'] as num?)?.toInt() ?? 50,
      currentLoad: (json['currentLoad'] as num?)?.toInt() ?? 0,
      currentPassengers: (json['currentPassengers'] as num?)?.toInt() ?? 0,
      status: json['status'] as String? ?? 'on_time',
      currentSpeed: (json['currentSpeed'] as num?)?.toInt() ?? 0,
      nextStop: json['nextStop'] as String? ?? '',
      etaNextStopMin: (json['etaNextStopMin'] as num?)?.toInt() ?? 0,
      latitude: (json['latitude'] as num?)?.toDouble() ?? 18.5204,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 73.8567,
      lastUpdated: json['lastUpdated'] as String? ?? DateTime.now().toIso8601String(),
      delayMinutes: (json['delayMinutes'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'busId': busId,
      'busNumber': busNumber,
      'routeId': routeId,
      'routeName': routeName,
      'routeNumber': routeNumber,
      'driverId': driverId,
      'driverName': driverName,
      'conductorId': conductorId,
      'conductorName': conductorName,
      'capacity': capacity,
      'currentLoad': currentLoad,
      'currentPassengers': currentPassengers,
      'status': status,
      'currentSpeed': currentSpeed,
      'nextStop': nextStop,
      'etaNextStopMin': etaNextStopMin,
      'latitude': latitude,
      'longitude': longitude,
      'lastUpdated': lastUpdated,
      'delayMinutes': delayMinutes,
    };
  }

  BusModel copyWith({
    String? busId,
    String? busNumber,
    String? routeId,
    String? routeName,
    String? routeNumber,
    String? driverId,
    String? driverName,
    String? conductorId,
    String? conductorName,
    int? capacity,
    int? currentLoad,
    int? currentPassengers,
    String? status,
    int? currentSpeed,
    String? nextStop,
    int? etaNextStopMin,
    double? latitude,
    double? longitude,
    String? lastUpdated,
    int? delayMinutes,
  }) {
    return BusModel(
      busId: busId ?? this.busId,
      busNumber: busNumber ?? this.busNumber,
      routeId: routeId ?? this.routeId,
      routeName: routeName ?? this.routeName,
      routeNumber: routeNumber ?? this.routeNumber,
      driverId: driverId ?? this.driverId,
      driverName: driverName ?? this.driverName,
      conductorId: conductorId ?? this.conductorId,
      conductorName: conductorName ?? this.conductorName,
      capacity: capacity ?? this.capacity,
      currentLoad: currentLoad ?? this.currentLoad,
      currentPassengers: currentPassengers ?? this.currentPassengers,
      status: status ?? this.status,
      currentSpeed: currentSpeed ?? this.currentSpeed,
      nextStop: nextStop ?? this.nextStop,
      etaNextStopMin: etaNextStopMin ?? this.etaNextStopMin,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      delayMinutes: delayMinutes ?? this.delayMinutes,
    );
  }
}
