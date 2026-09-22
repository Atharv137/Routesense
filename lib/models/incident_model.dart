class IncidentModel {
  final String incidentId;
  final String routeId;
  final String routeName;
  final String routeNumber;
  final String busId;
  final String busNumber;
  final String driverId;
  final String driverName;
  final String type; // 'delay' | 'breakdown' | 'obstruction'
  final String description;
  final String? photoUrl;
  final String severity; // 'low' | 'medium' | 'high' | 'critical'
  final String status; // 'open' | 'in_review' | 'resolved'
  final int delayMinutes;
  final String locationName;
  final double? lat;
  final double? lng;
  final String timestamp;
  final String? resolvedAt;
  final String? resolutionNotes;

  IncidentModel({
    required this.incidentId,
    required this.routeId,
    required this.routeName,
    required this.routeNumber,
    required this.busId,
    required this.busNumber,
    required this.driverId,
    required this.driverName,
    required this.type,
    required this.description,
    this.photoUrl,
    required this.severity,
    this.status = 'open',
    this.delayMinutes = 0,
    required this.locationName,
    this.lat,
    this.lng,
    required this.timestamp,
    this.resolvedAt,
    this.resolutionNotes,
  });

  bool get isOpen => status == 'open';
  bool get isResolved => status == 'resolved';

  factory IncidentModel.fromJson(Map<String, dynamic> json) {
    return IncidentModel(
      incidentId: json['incidentId'] as String? ?? '',
      routeId: json['routeId'] as String? ?? '',
      routeName: json['routeName'] as String? ?? '',
      routeNumber: json['routeNumber'] as String? ?? '',
      busId: json['busId'] as String? ?? '',
      busNumber: json['busNumber'] as String? ?? '',
      driverId: json['driverId'] as String? ?? '',
      driverName: json['driverName'] as String? ?? '',
      type: json['type'] as String? ?? 'delay',
      description: json['description'] as String? ?? '',
      photoUrl: json['photoUrl'] as String?,
      severity: json['severity'] as String? ?? 'medium',
      status: json['status'] as String? ?? 'open',
      delayMinutes: (json['delayMinutes'] as num?)?.toInt() ?? 0,
      locationName: json['locationName'] as String? ?? '',
      lat: (json['lat'] as num?)?.toDouble(),
      lng: (json['lng'] as num?)?.toDouble(),
      timestamp: json['timestamp'] as String? ?? DateTime.now().toIso8601String(),
      resolvedAt: json['resolvedAt'] as String?,
      resolutionNotes: json['resolutionNotes'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'incidentId': incidentId,
      'routeId': routeId,
      'routeName': routeName,
      'routeNumber': routeNumber,
      'busId': busId,
      'busNumber': busNumber,
      'driverId': driverId,
      'driverName': driverName,
      'type': type,
      'description': description,
      'photoUrl': photoUrl,
      'severity': severity,
      'status': status,
      'delayMinutes': delayMinutes,
      'locationName': locationName,
      'lat': lat,
      'lng': lng,
      'timestamp': timestamp,
      'resolvedAt': resolvedAt,
      'resolutionNotes': resolutionNotes,
    };
  }
}
