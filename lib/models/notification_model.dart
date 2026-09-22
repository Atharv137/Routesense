class NotificationModel {
  final String id;
  final String title;
  final String message;
  final String type; // 'delay' | 'breakdown' | 'ticket' | 'system' | 'obstruction'
  final String severity; // 'info' | 'warning' | 'error' | 'success'
  final String timestamp;
  final bool read;
  final List<String> targetRoles;
  final String? routeId;
  final String? link;

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.severity,
    required this.timestamp,
    this.read = false,
    required this.targetRoles,
    this.routeId,
    this.link,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    final rawRoles = json['targetRoles'] as List<dynamic>? ?? [];
    return NotificationModel(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      message: json['message'] as String? ?? '',
      type: json['type'] as String? ?? 'system',
      severity: json['severity'] as String? ?? 'info',
      timestamp: json['timestamp'] as String? ?? DateTime.now().toIso8601String(),
      read: json['read'] as bool? ?? false,
      targetRoles: rawRoles.map((e) => e.toString()).toList(),
      routeId: json['routeId'] as String?,
      link: json['link'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'type': type,
      'severity': severity,
      'timestamp': timestamp,
      'read': read,
      'targetRoles': targetRoles,
      'routeId': routeId,
      'link': link,
    };
  }

  NotificationModel copyWith({bool? read}) {
    return NotificationModel(
      id: id,
      title: title,
      message: message,
      type: type,
      severity: severity,
      timestamp: timestamp,
      read: read ?? this.read,
      targetRoles: targetRoles,
      routeId: routeId,
      link: link,
    );
  }
}
