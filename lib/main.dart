import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'firebase_options.dart';
import 'core/constants/app_constants.dart';
import 'core/theme/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/bus_provider.dart';
import 'providers/dashboard_provider.dart';
import 'providers/incident_provider.dart';
import 'providers/route_provider.dart';
import 'providers/ticket_provider.dart';
import 'providers/trip_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/signup_screen.dart';
import 'screens/auth/splash_screen.dart';
import 'screens/main_shell_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase with platform-appropriate options
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    debugPrint('Firebase.initializeApp warning/notice: $e');
  }

  runApp(const RouteSenseApp());
}

class RouteSenseApp extends StatelessWidget {
  const RouteSenseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => RouteProvider()),
        ChangeNotifierProvider(create: (_) => BusProvider()),
        ChangeNotifierProvider(create: (_) => TripProvider()),
        ChangeNotifierProvider(create: (_) => TicketProvider()),
        ChangeNotifierProvider(create: (_) => IncidentProvider()),
        ChangeNotifierProvider(create: (_) => DashboardProvider()),
      ],
      child: MaterialApp(
        title: AppConstants.appName,
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const AppEntryCoordinator(),
      ),
    );
  }
}

class AppEntryCoordinator extends StatefulWidget {
  const AppEntryCoordinator({super.key});

  @override
  State<AppEntryCoordinator> createState() => _AppEntryCoordinatorState();
}

class _AppEntryCoordinatorState extends State<AppEntryCoordinator> {
  bool _hasSeenSplash = true; // Auto-pass splash for fluid instant preview
  bool _isSignUp = false;

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    if (!_hasSeenSplash) {
      return SplashScreen(
        onContinue: () => setState(() => _hasSeenSplash = true),
      );
    }

    if (!auth.isAuthenticated) {
      if (_isSignUp) {
        return SignUpScreen(
          onSwitchToLogin: () => setState(() => _isSignUp = false),
        );
      }
      return LoginScreen(
        onSwitchToSignUp: () => setState(() => _isSignUp = true),
      );
    }

    return MainShellScreen();
  }
}
