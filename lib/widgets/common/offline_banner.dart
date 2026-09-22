import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class OfflineBanner extends StatelessWidget {
  final bool isOffline;
  final int pendingCount;
  final VoidCallback onSync;

  const OfflineBanner({
    required this.isOffline,
    required this.pendingCount,
    required this.onSync,
  });

  @override
  Widget build(BuildContext context) {
    if (!isOffline && pendingCount == 0) return const SizedBox.shrink();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: isOffline ? const Color(0xFF1E293B) : AppColors.warning,
      child: Row(
        children: [
          Icon(
            isOffline ? Icons.wifi_off_rounded : Icons.sync_problem_rounded,
            color: Colors.white,
            size: 18,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              isOffline
                  ? 'OFFLINE MODE: Tickets and incident reports stored locally ($pendingCount queued)'
                  : '$pendingCount operational update(s) ready to sync to central servers',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          if (pendingCount > 0)
            TextButton(
              onPressed: onSync,
              style: TextButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: const Text('SYNC NOW', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
            ),
        ],
      ),
    );
  }
}
