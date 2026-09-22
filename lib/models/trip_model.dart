class TripModel {
  final String tripId;
  final String routeId;
  final String routeName;
  final String routeNumber;
  final String busId;
  final String busNumber;
  final String conductorId;
  final String conductorName;
  final String driverId;
  final String driverName;
  final int ticketCount;
  final int passengerLoad; // percentage 0-100
  final int capacity;
  final int currentPassengers;
  final String status; // 'scheduled' | 'in_progress' | 'completed' | 'delayed' | 'cancelled'
  final String startTime;
  final String? endTime;
  final String timestamp;
  final int currentStopIndex;
  final String currentStopName;
  final String nextStopName;
  final String direction; // 'UP' | 'DOWN'
  final double totalRevenue;
  final int delayMinutes;

  TripModel({
    required this.tripId,
    required this.routeId,
    required this.routeName,
    required this.routeNumber,
    required this.busId,
    required this.busNumber,
    required this.conductorId,
    required this.conductorName,
    required this.driverId,
    required this.driverName,
    required this.ticketCount,
    required this.passengerLoad,
    required this.capacity,
    required this.currentPassengers,
    required this.status,
    required this.startTime,
    this.endTime,
    required this.timestamp,
    required this.currentStopIndex,
    required this.currentStopName,
    required this.nextStopName,
    this.direction = 'UP',
    required this.totalRevenue,
    this.delayMinutes = 0,
  });

  factory TripModel.fromJson(Map<String, dynamic> json) {
    return TripModel(
      tripId: json['tripId'] as String? ?? '',
      routeId: json['routeId'] as String? ?? '',
      routeName: json['routeName'] as String? ?? '',
      routeNumber: json['routeNumber'] as String? ?? '',
      busId: json['busId'] as String? ?? '',
      busNumber: json['busNumber'] as String? ?? '',
      conductorId: json['conductorId'] as String? ?? '',
      conductorName: json['conductorName'] as String? ?? '',
      driverId: json['driverId'] as String? ?? '',
      driverName: json['driverName'] as String? ?? '',
      ticketCount: (json['ticketCount'] as num?)?.toInt() ?? 0,
      passengerLoad: (json['passengerLoad'] as num?)?.toInt() ?? 0,
      capacity: (json['capacity'] as num?)?.toInt() ?? 50,
      currentPassengers: (json['currentPassengers'] as num?)?.toInt() ?? 0,
      status: json['status'] as String? ?? 'in_progress',
      startTime: json['startTime'] as String? ?? '',
      endTime: json['endTime'] as String?,
      timestamp: json['timestamp'] as String? ?? DateTime.now().toIso8601String(),
      currentStopIndex: (json['currentStopIndex'] as num?)?.toInt() ?? 0,
      currentStopName: json['currentStopName'] as String? ?? '',
      nextStopName: json['nextStopName'] as String? ?? '',
      direction: json['direction'] as String? ?? 'UP',
      totalRevenue: (json['totalRevenue'] as num?)?.toDouble() ?? 0.0,
      delayMinutes: (json['delayMinutes'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tripId': tripId,
      'routeId': routeId,
      'routeName': routeName,
      'routeNumber': routeNumber,
      'busId': busId,
      'busNumber': busNumber,
      'conductorId': conductorId,
      'conductorName': conductorName,
      'driverId': driverId,
      'driverName': driverName,
      'ticketCount': ticketCount,
      'passengerLoad': passengerLoad,
      'capacity': capacity,
      'currentPassengers': currentPassengers,
      'status': status,
      'startTime': startTime,
      'endTime': endTime,
      'timestamp': timestamp,
      'currentStopIndex': currentStopIndex,
      'currentStopName': currentStopName,
      'nextStopName': nextStopName,
      'direction': direction,
      'totalRevenue': totalRevenue,
      'delayMinutes': delayMinutes,
    };
  }

  TripModel copyWith({
    String? tripId,
    String? routeId,
    String? routeName,
    String? routeNumber,
    String? busId,
    String? busNumber,
    String? conductorId,
    String? conductorName,
    String? driverId,
    String? driverName,
    int? ticketCount,
    int? passengerLoad,
    int? capacity,
    int? currentPassengers,
    String? status,
    String? startTime,
    String? endTime,
    String? timestamp,
    int? currentStopIndex,
    String? currentStopName,
    String? nextStopName,
    String? direction,
    double? totalRevenue,
    int? delayMinutes,
  }) {
    return TripModel(
      tripId: tripId ?? this.tripId,
      routeId: routeId ?? this.routeId,
      routeName: routeName ?? this.routeName,
      routeNumber: routeNumber ?? this.routeNumber,
      busId: busId ?? this.busId,
      busNumber: busNumber ?? this.busNumber,
      conductorId: conductorId ?? this.conductorId,
      conductorName: conductorName ?? this.conductorName,
      driverId: driverId ?? this.driverId,
      driverName: driverName ?? this.driverName,
      ticketCount: ticketCount ?? this.ticketCount,
      passengerLoad: passengerLoad ?? this.passengerLoad,
      capacity: capacity ?? this.capacity,
      currentPassengers: currentPassengers ?? this.currentPassengers,
      status: status ?? this.status,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      timestamp: timestamp ?? this.timestamp,
      currentStopIndex: currentStopIndex ?? this.currentStopIndex,
      currentStopName: currentStopName ?? this.currentStopName,
      nextStopName: nextStopName ?? this.nextStopName,
      direction: direction ?? this.direction,
      totalRevenue: totalRevenue ?? this.totalRevenue,
      delayMinutes: delayMinutes ?? this.delayMinutes,
    );
  }
}
