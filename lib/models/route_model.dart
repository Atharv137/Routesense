class StopModel {
  final String stopId;
  final String name;
  final int order;
  final int etaMinutes;
  final double lat;
  final double lng;
  final bool isMajor;

  StopModel({
    required this.stopId,
    required this.name,
    required this.order,
    required this.etaMinutes,
    required this.lat,
    required this.lng,
    this.isMajor = false,
  });

  factory StopModel.fromJson(Map<String, dynamic> json) {
    return StopModel(
      stopId: json['stopId'] as String? ?? '',
      name: json['name'] as String? ?? '',
      order: (json['order'] as num?)?.toInt() ?? 0,
      etaMinutes: (json['etaMinutes'] as num?)?.toInt() ?? 0,
      lat: (json['lat'] as num?)?.toDouble() ?? 0.0,
      lng: (json['lng'] as num?)?.toDouble() ?? 0.0,
      isMajor: json['isMajor'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'stopId': stopId,
      'name': name,
      'order': order,
      'etaMinutes': etaMinutes,
      'lat': lat,
      'lng': lng,
      'isMajor': isMajor,
    };
  }
}

class RouteModel {
  final String routeId;
  final String routeName;
  final String routeNumber;
  final String startPoint;
  final String endPoint;
  final List<StopModel> scheduledStops;
  final double farePerStop;
  final double baseFare;
  final bool activeFlag;
  final double totalDistanceKm;
  final int avgDurationMin;
  final int frequencyMin;
  final int activeBusesCount;
  final String createdAt;

  RouteModel({
    required this.routeId,
    required this.routeName,
    required this.routeNumber,
    required this.startPoint,
    required this.endPoint,
    required this.scheduledStops,
    required this.farePerStop,
    required this.baseFare,
    this.activeFlag = true,
    required this.totalDistanceKm,
    required this.avgDurationMin,
    required this.frequencyMin,
    this.activeBusesCount = 1,
    required this.createdAt,
  });

  factory RouteModel.fromJson(Map<String, dynamic> json) {
    final rawStops = json['scheduledStops'] as List<dynamic>? ?? [];
    final stops = rawStops
        .map((s) => StopModel.fromJson(s as Map<String, dynamic>))
        .toList();

    return RouteModel(
      routeId: json['routeId'] as String? ?? '',
      routeName: json['routeName'] as String? ?? '',
      routeNumber: json['routeNumber'] as String? ?? '',
      startPoint: json['startPoint'] as String? ?? '',
      endPoint: json['endPoint'] as String? ?? '',
      scheduledStops: stops,
      farePerStop: (json['farePerStop'] as num?)?.toDouble() ?? 5.0,
      baseFare: (json['baseFare'] as num?)?.toDouble() ?? 10.0,
      activeFlag: json['activeFlag'] as bool? ?? true,
      totalDistanceKm: (json['totalDistanceKm'] as num?)?.toDouble() ?? 12.0,
      avgDurationMin: (json['avgDurationMin'] as num?)?.toInt() ?? 45,
      frequencyMin: (json['frequencyMin'] as num?)?.toInt() ?? 15,
      activeBusesCount: (json['activeBusesCount'] as num?)?.toInt() ?? 1,
      createdAt: json['createdAt'] as String? ?? DateTime.now().toIso8601String(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'routeId': routeId,
      'routeName': routeName,
      'routeNumber': routeNumber,
      'startPoint': startPoint,
      'endPoint': endPoint,
      'scheduledStops': scheduledStops.map((s) => s.toJson()).toList(),
      'farePerStop': farePerStop,
      'baseFare': baseFare,
      'activeFlag': activeFlag,
      'totalDistanceKm': totalDistanceKm,
      'avgDurationMin': avgDurationMin,
      'frequencyMin': frequencyMin,
      'activeBusesCount': activeBusesCount,
      'createdAt': createdAt,
    };
  }

  double calculateFare(String fromStop, String toStop) {
    final fromIdx = scheduledStops.indexWhere((s) => s.name == fromStop);
    final toIdx = scheduledStops.indexWhere((s) => s.name == toStop);
    if (fromIdx == -1 || toIdx == -1) return baseFare;
    final dist = (toIdx - fromIdx).abs();
    if (dist <= 1) return baseFare;
    return baseFare + (dist - 1) * farePerStop;
  }
}
