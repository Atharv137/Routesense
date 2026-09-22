import 'dart:async';
import '../models/user_model.dart';
import '../core/constants/initial_data.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal() {
    // Default logged in user is Conductor Anita Deshmukh as in PRD
    _currentUser = InitialData.users[0];
    _userController.add(_currentUser);
  }

  UserModel? _currentUser;
  final StreamController<UserModel?> _userController = StreamController<UserModel?>.broadcast();

  UserModel? get currentUser => _currentUser;
  Stream<UserModel?> get authStateChanges => _userController.stream;

  Future<UserModel> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final cleanEmail = email.trim().toLowerCase();
    final matched = InitialData.users.firstWhere(
      (u) => u.email.toLowerCase() == cleanEmail,
      orElse: () => UserModel(
        uid: 'user_${DateTime.now().millisecondsSinceEpoch}',
        name: email.split('@').first,
        email: email,
        phone: '+91 98000 00000',
        role: 'passenger',
        createdAt: DateTime.now().toIso8601String(),
      ),
    );

    _currentUser = matched;
    _userController.add(_currentUser);
    return matched;
  }

  Future<UserModel> signUpWithEmailAndPassword({
    required String name,
    required String email,
    required String phone,
    required String role,
    required String password,
  }) async {
    await Future.delayed(const Duration(milliseconds: 400));
    final newUser = UserModel(
      uid: 'user_${DateTime.now().millisecondsSinceEpoch}',
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: role,
      createdAt: DateTime.now().toIso8601String(),
      employeeId: role != 'passenger' ? 'EMP-${DateTime.now().millisecondsSinceEpoch % 10000}' : null,
      routeAssigned: role == 'conductor' || role == 'driver' ? 'route_101' : null,
      busAssigned: role == 'conductor' || role == 'driver' ? 'bus_MH12_AB1234' : null,
    );

    _currentUser = newUser;
    _userController.add(_currentUser);
    return newUser;
  }

  Future<void> switchRole(String role) async {
    final demoUser = InitialData.users.firstWhere(
      (u) => u.role == role,
      orElse: () => InitialData.users[0],
    );
    _currentUser = demoUser;
    _userController.add(_currentUser);
  }

  Future<void> signOut() async {
    _currentUser = null;
    _userController.add(null);
  }

  void dispose() {
    _userController.close();
  }
}
