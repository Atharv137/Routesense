class ShiftModel {
  final String conductorId;
  final String conductorName;
  final String date;
  final int totalTickets;
  final int totalPassengers;
  final int totalTrips;
  final double shiftTotalRevenue;
  final double cashRevenue;
  final double digitalRevenue;
  final String startTime;
  final String? endTime;
  final String status; // 'active' | 'closed' | 'reconciled'

  ShiftModel({
    required this.conductorId,
    required this.conductorName,
    required this.date,
    required this.totalTickets,
    required this.totalPassengers,
    required this.totalTrips,
    required this.shiftTotalRevenue,
    required this.cashRevenue,
    required this.digitalRevenue,
    required this.startTime,
    this.endTime,
    this.status = 'active',
  });

  factory ShiftModel.fromJson(Map<String, dynamic> json) {
    return ShiftModel(
      conductorId: json['conductorId'] as String? ?? '',
      conductorName: json['conductorName'] as String? ?? '',
      date: json['date'] as String? ?? '',
      totalTickets: (json['totalTickets'] as num?)?.toInt() ?? 0,
      totalPassengers: (json['totalPassengers'] as num?)?.toInt() ?? 0,
      totalTrips: (json['totalTrips'] as num?)?.toInt() ?? 0,
      shiftTotalRevenue: (json['shiftTotalRevenue'] as num?)?.toDouble() ?? 0.0,
      cashRevenue: (json['cashRevenue'] as num?)?.toDouble() ?? 0.0,
      digitalRevenue: (json['digitalRevenue'] as num?)?.toDouble() ?? 0.0,
      startTime: json['startTime'] as String? ?? '',
      endTime: json['endTime'] as String?,
      status: json['status'] as String? ?? 'active',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'conductorId': conductorId,
      'conductorName': conductorName,
      'date': date,
      'totalTickets': totalTickets,
      'totalPassengers': totalPassengers,
      'totalTrips': totalTrips,
      'shiftTotalRevenue': shiftTotalRevenue,
      'cashRevenue': cashRevenue,
      'digitalRevenue': digitalRevenue,
      'startTime': startTime,
      'endTime': endTime,
      'status': status,
    };
  }
}
