import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../providers/dashboard_provider.dart';

class NotificationDialog extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final dash = Provider.of<DashboardProvider>(context);
    final notifs = dash.notifications;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Container(
        width: double.infinity,
        constraints: const BoxConstraints(maxHeight: 520, maxWidth: 500),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.notifications_active_rounded, color: AppColors.primary, size: 24),
                const SizedBox(width: 10),
                const Text(
                  'Operational Alerts',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                ),
                const Spacer(),
                if (dash.unreadNotificationCount > 0)
                  TextButton(
                    onPressed: () => dash.markAllNotificationsRead(),
                    child: const Text('Mark all read', style: TextStyle(fontSize: 12)),
                  ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Navigator.of(context).pop(),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
            const Divider(height: 24),
            Expanded(
              child: notifs.isEmpty
                  ? const Center(
                      child: Text('No notifications at this time', style: TextStyle(color: AppColors.textMuted)),
                    )
                  : ListView.separated(
                      itemCount: notifs.length,
                      separatorBuilder: (_, __) => const Divider(height: 16),
                      itemBuilder: (context, idx) {
                        final n = notifs[idx];
                        Color iconColor = AppColors.primary;
                        IconData iconData = Icons.info_outline_rounded;

                        if (n.type == 'delay') {
                          iconColor = AppColors.warning;
                          iconData = Icons.access_time_rounded;
                        } else if (n.type == 'breakdown') {
                          iconColor = AppColors.error;
                          iconData = Icons.car_crash_rounded;
                        } else if (n.type == 'ticket') {
                          iconColor = AppColors.success;
                          iconData = Icons.confirmation_number_rounded;
                        }

                        return InkWell(
                          onTap: () => dash.markNotificationRead(n.id),
                          child: Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: n.read ? Colors.transparent : AppColors.primaryLight.withOpacity(0.5),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                CircleAvatar(
                                  radius: 16,
                                  backgroundColor: iconColor.withOpacity(0.12),
                                  child: Icon(iconData, size: 16, color: iconColor),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              n.title,
                                              style: TextStyle(
                                                fontSize: 13,
                                                fontWeight: n.read ? FontWeight.w600 : FontWeight.w800,
                                                color: AppColors.textPrimary,
                                              ),
                                            ),
                                          ),
                                          Text(
                                            Formatters.fromIsoString(n.timestamp),
                                            style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        n.message,
                                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.3),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
