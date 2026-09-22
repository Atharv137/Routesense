import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/auth_provider.dart';

class QuickRoleSwitcher extends StatelessWidget {
  final VoidCallback? onRoleSwitched;

  const QuickRoleSwitcher({this.onRoleSwitched});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final currentRole = auth.currentRole;

    final roles = [
      {'id': 'passenger', 'label': 'Passenger', 'icon': Icons.directions_walk_rounded},
      {'id': 'conductor', 'label': 'Conductor', 'icon': Icons.confirmation_number_rounded},
      {'id': 'driver', 'label': 'Driver', 'icon': Icons.directions_bus_rounded},
      {'id': 'operations_manager', 'label': 'Operations', 'icon': Icons.dashboard_rounded},
    ];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              const Icon(Icons.swap_horiz_rounded, size: 16, color: AppColors.textSecondary),
              const SizedBox(width: 6),
              const Text(
                'ROLE TESTING BAR',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.textSecondary, letterSpacing: 0.8),
              ),
              const Spacer(),
              Text(
                'Active: ${currentRole.replaceAll('_', ' ').toUpperCase()}',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
            ],
          ),
          const SizedBox(height: 6),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: roles.map((r) {
                final isSelected = currentRole == r['id'];
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    avatar: Icon(
                      r['icon'] as IconData,
                      size: 14,
                      color: isSelected ? Colors.white : AppColors.textSecondary,
                    ),
                    label: Text(r['label'] as String),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    backgroundColor: const Color(0xFFF3F4F6),
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                      fontSize: 12,
                    ),
                    onSelected: (selected) {
                      if (selected) {
                        auth.switchRole(r['id'] as String);
                        onRoleSwitched?.call();
                      }
                    },
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
