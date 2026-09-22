import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import 'status_badge.dart';

class ProfileDrawer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.currentUser;

    if (user == null) {
      return const Center(child: Text('No active session'));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: AppColors.primary.withOpacity(0.12),
                  child: Text(
                    user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.primary),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.name,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user.email,
                        style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          StatusBadge(status: user.role, label: user.role.replaceAll('_', ' ').toUpperCase()),
                          const SizedBox(width: 8),
                          if (user.shiftStatus != null)
                            StatusBadge(status: 'paid', label: user.shiftStatus!.replaceAll('_', ' ').toUpperCase()),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Details List
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'OPERATIONAL CREDENTIALS',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textSecondary, letterSpacing: 0.6),
                ),
                const Divider(height: 20),
                _buildInfoRow('User ID', user.uid),
                _buildInfoRow('Phone', user.phone),
                if (user.employeeId != null) _buildInfoRow('Employee ID', user.employeeId!),
                if (user.routeAssigned != null) _buildInfoRow('Assigned Route', user.routeAssigned!),
                if (user.busAssigned != null) _buildInfoRow('Assigned Bus', user.busAssigned!),
                _buildInfoRow('Account Created', user.createdAt.split('T').first),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Logout Button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              icon: const Icon(Icons.logout_rounded, color: AppColors.error),
              label: const Text('Log Out of RouteSense', style: TextStyle(color: AppColors.error)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.error),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              onPressed: () {
                auth.logout();
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
        ],
      ),
    );
  }
}
