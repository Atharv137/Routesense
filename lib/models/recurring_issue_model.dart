class RecurringIssueModel {
  final String id;
  final String routeId;
  final String routeName;
  final String routeNumber;
  final int incidentCount;
  final String period; // '7_days' | '30_days'
  final String mostCommonType;
  final String peakProblemPeriod;
  final String lastIncidentTime;
  final String recommendation;
  final int confidenceScore;
  final List<String> affectedStops;

  RecurringIssueModel({
    required this.id,
    required this.routeId,
    required this.routeName,
    required this.routeNumber,
    required this.incidentCount,
    required this.period,
    required this.mostCommonType,
    required this.peakProblemPeriod,
    required this.lastIncidentTime,
    required this.recommendation,
    required this.confidenceScore,
    required this.affectedStops,
  });

  factory RecurringIssueModel.fromJson(Map<String, dynamic> json) {
    final rawStops = json['affectedStops'] as List<dynamic>? ?? [];
    return RecurringIssueModel(
      id: json['id'] as String? ?? '',
      routeId: json['routeId'] as String? ?? '',
      routeName: json['routeName'] as String? ?? '',
      routeNumber: json['routeNumber'] as String? ?? '',
      incidentCount: (json['incidentCount'] as num?)?.toInt() ?? 0,
      period: json['period'] as String? ?? '7_days',
      mostCommonType: json['mostCommonType'] as String? ?? 'delay',
      peakProblemPeriod: json['peakProblemPeriod'] as String? ?? 'Morning Peak',
      lastIncidentTime: json['lastIncidentTime'] as String? ?? '',
      recommendation: json['recommendation'] as String? ?? '',
      confidenceScore: (json['confidenceScore'] as num?)?.toInt() ?? 80,
      affectedStops: rawStops.map((e) => e.toString()).toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'routeId': routeId,
      'routeName': routeName,
      'routeNumber': routeNumber,
      'incidentCount': incidentCount,
      'period': period,
      'mostCommonType': mostCommonType,
      'peakProblemPeriod': peakProblemPeriod,
      'lastIncidentTime': lastIncidentTime,
      'recommendation': recommendation,
      'confidenceScore': confidenceScore,
      'affectedStops': affectedStops,
    };
  }
}
