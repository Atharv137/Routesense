import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../providers/auth_provider.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/common/app_header.dart';
import '../widgets/common/bottom_nav_bar.dart';
import '../widgets/common/offline_banner.dart';
import '../widgets/common/profile_drawer.dart';
import '../widgets/common/quick_role_switcher.dart';
import 'conductor/conductor_home_screen.dart';
import 'conductor/shift_summary_screen.dart';
import 'conductor/ticket_history_screen.dart';
import 'driver/driver_home_screen.dart';
import 'driver/trip_progress_screen.dart';
import 'operations/analytics_screen.dart';
import 'operations/fleet_live_screen.dart';
import 'operations/operations_dashboard_screen.dart';
import 'operations/recurring_issues_screen.dart';
import 'passenger/live_tracking_screen.dart';
import 'passenger/passenger_home_screen.dart';
import 'passenger/passenger_tickets_screen.dart';
import 'passenger/route_search_screen.dart';

class MainShellScreen extends StatefulWidget {
  @override
  _MainShellScreenState createState() => _MainShellScreenState();
}

class _MainShellScreenState extends State<MainShellScreen> {
  String _activeTab = 'home';
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  void _onTabChanged(String tab) {
    setState(() => _activeTab = tab);
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final dash = Provider.of<DashboardProvider>(context);
    final role = auth.currentRole;

    Widget content;

    switch (role) {
      case 'operations_manager':
        switch (_activeTab) {
          case 'fleet':
            content = FleetLiveScreen(onBack: () => _onTabChanged('home'));
            break;
          case 'dashboard':
            content = AnalyticsScreen(onBack: () => _onTabChanged('home'));
            break;
          case 'issues':
            content = RecurringIssuesScreen(onBack: () => _onTabChanged('home'));
            break;
          case 'profile':
            content = ProfileDrawer();
            break;
          case 'home':
          default:
            content = OperationsDashboardScreen(onNavigateTab: _onTabChanged);
            break;
        }
        break;

      case 'conductor':
        switch (_activeTab) {
          case 'trips':
            content = ShiftSummaryScreen(onBack: () => _onTabChanged('home'));
            break;
          case 'tickets':
            content = TicketHistoryScreen(onBack: () => _onTabChanged('home'));
            break;
          case 'profile':
            content = ProfileDrawer();
            break;
          case 'home':
          default:
            content = ConductorHomeScreen(onNavigateTab: _onTabChanged);
            break;
        }
        break;

      case 'driver':
        switch (_activeTab) {
          case 'trips':
            content = TripProgressScreen(onBack: () => _onTabChanged('home'));
            break;
          case 'issues':
            content = RecurringIssuesScreen(onBack: () => _onTabChanged('home'));
            break;
          case 'profile':
            content = ProfileDrawer();
            break;
          case 'home':
          default:
            content = DriverHomeScreen(onNavigateTab: _onTabChanged);
            break;
        }
        break;

      case 'passenger':
      default:
        switch (_activeTab) {
          case 'routes':
            content = RouteSearchScreen(onBack: () => _onTabChanged('home'));
            break;
          case 'tickets':
            content = PassengerTicketsScreen(onBack: () => _onTabChanged('home'));
            break;
          case 'tracking':
            content = LiveTrackingScreen(onBack: () => _onTabChanged('home'));
            break;
          case 'profile':
            content = ProfileDrawer();
            break;
          case 'home':
          default:
            content = PassengerHomeScreen(onNavigateTab: _onTabChanged);
            break;
        }
        break;
    }

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppColors.background,
      appBar: AppHeader(
        onProfileTap: () => _onTabChanged('profile'),
      ),
      body: Column(
        children: [
          // Offline Banner
          OfflineBanner(
            isOffline: dash.isOffline,
            pendingCount: dash.offlineQueueCount,
            onSync: () => dash.syncOfflineQueue(),
          ),

          // Quick Role Testing Switcher (Floating at top for easy review of all roles)
          QuickRoleSwitcher(
            onRoleSwitched: () {
              setState(() => _activeTab = 'home');
            },
          ),

          const Divider(height: 1, color: AppColors.border),

          // Role Content Area
          Expanded(child: content),
        ],
      ),
      bottomNavigationBar: BottomNavBar(
        activeTab: _activeTab,
        onTabChanged: _onTabChanged,
        role: role,
      ),
    );
  }
}
