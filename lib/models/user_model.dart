class UserModel {
  final String uid;
  final String name;
  final String email;
  final String phone;
  final String role; // 'passenger' | 'conductor' | 'driver' | 'operations_manager' | 'admin'
  final String? routeAssigned;
  final String? busAssigned;
  final String? profilePhoto;
  final String createdAt;
  final String? employeeId;
  final String? shiftStatus; // 'on_duty' | 'off_duty' | 'on_break'

  UserModel({
    required this.uid,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    this.routeAssigned,
    this.busAssigned,
    this.profilePhoto,
    required this.createdAt,
    this.employeeId,
    this.shiftStatus = 'on_duty',
  });

  bool get isPassenger => role == 'passenger';
  bool get isConductor => role == 'conductor';
  bool get isDriver => role == 'driver';
  bool get isOpsManager => role == 'operations_manager' || role == 'admin';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      uid: json['uid'] as String? ?? '',
      name: json['name'] as String? ?? 'User',
      email: json['email'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      role: json['role'] as String? ?? 'passenger',
      routeAssigned: json['routeAssigned'] as String?,
      busAssigned: json['busAssigned'] as String?,
      profilePhoto: json['profilePhoto'] as String?,
      createdAt: json['createdAt'] as String? ?? DateTime.now().toIso8601String(),
      employeeId: json['employeeId'] as String?,
      shiftStatus: json['shiftStatus'] as String? ?? 'on_duty',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'uid': uid,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role,
      'routeAssigned': routeAssigned,
      'busAssigned': busAssigned,
      'profilePhoto': profilePhoto,
      'createdAt': createdAt,
      'employeeId': employeeId,
      'shiftStatus': shiftStatus,
    };
  }

  UserModel copyWith({
    String? uid,
    String? name,
    String? email,
    String? phone,
    String? role,
    String? routeAssigned,
    String? busAssigned,
    String? profilePhoto,
    String? createdAt,
    String? employeeId,
    String? shiftStatus,
  }) {
    return UserModel(
      uid: uid ?? this.uid,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      routeAssigned: routeAssigned ?? this.routeAssigned,
      busAssigned: busAssigned ?? this.busAssigned,
      profilePhoto: profilePhoto ?? this.profilePhoto,
      createdAt: createdAt ?? this.createdAt,
      employeeId: employeeId ?? this.employeeId,
      shiftStatus: shiftStatus ?? this.shiftStatus,
    );
  }
}
