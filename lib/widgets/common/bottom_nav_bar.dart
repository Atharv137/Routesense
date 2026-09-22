import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class BottomNavBar extends StatelessWidget {
  final String activeTab;
  final Function(String) onTabChanged;
  final String role;

  const BottomNavBar({
    required this.activeTab,
    required this.onTabChanged,
    required this.role,
  });

  @override
  Widget build(BuildContext context) {
    List<Map<String, dynamic>> items;

    switch (role) {
      case 'operations_manager':
        items = [
          {'id': 'home', 'label': 'Overview', 'icon': Icons.dashboard_rounded},
          {'id': 'fleet', 'label': 'Fleet Map', 'icon': Icons.map_rounded},
          {'id': 'dashboard', 'label': 'Analytics', 'icon': Icons.bar_chart_rounded},
          {'id': 'issues', 'label': 'Issues', 'icon': Icons.warning_amber_rounded},
          {'id': 'profile', 'label': 'Profile', 'icon': Icons.person_rounded},
        ];
        break;

      case 'conductor':
        items = [
          {'id': 'home', 'label': 'Shift Home', 'icon': Icons.point_of_sale_rounded},
          {'id': 'trips', 'label': 'Reconcile', 'icon': Icons.receipt_long_rounded},
          {'id': 'tickets', 'label': 'Issued Log', 'icon': Icons.confirmation_number_rounded},
          {'id': 'profile', 'label': 'Profile', 'icon': Icons.person_rounded},
        ];
        break;

      case 'driver':
        items = [
          {'id': 'home', 'label': 'Cab Home', 'icon': Icons.speed_rounded},
          {'id': 'trips', 'label': 'Waypoints', 'icon': Icons.route_rounded},
          {'id': 'issues', 'label': 'Incidents', 'icon': Icons.report_problem_rounded},
          {'id': 'profile', 'label': 'Profile', 'icon': Icons.person_rounded},
        ];
        break;

      case 'passenger':
      default:
        items = [
          {'id': 'home', 'label': 'Home', 'icon': Icons.home_rounded},
          {'id': 'routes', 'label': 'Routes', 'icon': Icons.alt_route_rounded},
          {'id': 'tickets', 'label': 'My Tickets', 'icon': Icons.qr_code_rounded},
          {'id': 'tracking', 'label': 'Live Sim', 'icon': Icons.navigation_rounded},
          {'id': 'profile', 'label': 'Profile', 'icon': Icons.person_rounded},
        ];
        break;
    }

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.border, width: 1)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: items.map((item) {
              final isSelected = activeTab == item['id'];
              return InkWell(
                onTap: () => onTabChanged(item['id'] as String),
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        item['icon'] as IconData,
                        color: isSelected ? AppColors.primary : AppColors.textSecondary,
                        size: 22,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        item['label'] as String,
                        style: TextStyle(
                          color: isSelected ? AppColors.primary : AppColors.textSecondary,
                          fontSize: 11,
                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}
