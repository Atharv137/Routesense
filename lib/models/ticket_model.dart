class TicketModel {
  final String ticketId;
  final String tripId;
  final String routeId;
  final String routeName;
  final String routeNumber;
  final String busNumber;
  final String? passengerId;
  final String? passengerName;
  final String fromStop;
  final String toStop;
  final int passengerCount;
  final double fare;
  final double totalFare;
  final String paymentType; // 'cash' | 'razorpay_digital' | 'pass'
  final String paymentStatus; // 'paid' | 'pending' | 'refunded'
  final String timestamp;
  final String qrCodeData;
  final String? conductorId;
  final String? conductorName;
  final String issuedByRole; // 'conductor' | 'passenger'

  TicketModel({
    required this.ticketId,
    required this.tripId,
    required this.routeId,
    required this.routeName,
    required this.routeNumber,
    required this.busNumber,
    this.passengerId,
    this.passengerName,
    required this.fromStop,
    required this.toStop,
    required this.passengerCount,
    required this.fare,
    required this.totalFare,
    required this.paymentType,
    this.paymentStatus = 'paid',
    required this.timestamp,
    required this.qrCodeData,
    this.conductorId,
    this.conductorName,
    this.issuedByRole = 'conductor',
  });

  bool get isDigital => paymentType == 'razorpay_digital';
  bool get isCash => paymentType == 'cash';

  factory TicketModel.fromJson(Map<String, dynamic> json) {
    return TicketModel(
      ticketId: json['ticketId'] as String? ?? '',
      tripId: json['tripId'] as String? ?? '',
      routeId: json['routeId'] as String? ?? '',
      routeName: json['routeName'] as String? ?? '',
      routeNumber: json['routeNumber'] as String? ?? '',
      busNumber: json['busNumber'] as String? ?? '',
      passengerId: json['passengerId'] as String?,
      passengerName: json['passengerName'] as String?,
      fromStop: json['fromStop'] as String? ?? '',
      toStop: json['toStop'] as String? ?? '',
      passengerCount: (json['passengerCount'] as num?)?.toInt() ?? 1,
      fare: (json['fare'] as num?)?.toDouble() ?? 0.0,
      totalFare: (json['totalFare'] as num?)?.toDouble() ?? 0.0,
      paymentType: json['paymentType'] as String? ?? 'cash',
      paymentStatus: json['paymentStatus'] as String? ?? 'paid',
      timestamp: json['timestamp'] as String? ?? DateTime.now().toIso8601String(),
      qrCodeData: json['qrCodeData'] as String? ?? '',
      conductorId: json['conductorId'] as String?,
      conductorName: json['conductorName'] as String?,
      issuedByRole: json['issuedByRole'] as String? ?? 'conductor',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ticketId': ticketId,
      'tripId': tripId,
      'routeId': routeId,
      'routeName': routeName,
      'routeNumber': routeNumber,
      'busNumber': busNumber,
      'passengerId': passengerId,
      'passengerName': passengerName,
      'fromStop': fromStop,
      'toStop': toStop,
      'passengerCount': passengerCount,
      'fare': fare,
      'totalFare': totalFare,
      'paymentType': paymentType,
      'paymentStatus': paymentStatus,
      'timestamp': timestamp,
      'qrCodeData': qrCodeData,
      'conductorId': conductorId,
      'conductorName': conductorName,
      'issuedByRole': issuedByRole,
    };
  }
}
