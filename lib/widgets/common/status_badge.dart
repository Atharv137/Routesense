import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final String? label;

  const StatusBadge({required this.status, this.label});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    String text = label ?? status.replaceAll('_', ' ').toUpperCase();

    switch (status.toLowerCase()) {
      case 'on_time':
      case 'paid':
      case 'active':
      case 'resolved':
      case 'completed':
        bg = AppColors.successLight;
        fg = AppColors.success;
        if (label == null) text = 'ON TIME';
        break;

      case 'delayed':
      case 'in_progress':
      case 'warning':
        bg = AppColors.warningLight;
        fg = AppColors.warning;
        if (label == null) text = 'DELAYED';
        break;

      case 'breakdown':
      case 'critical':
      case 'error':
      case 'open':
        bg = AppColors.errorLight;
        fg = AppColors.error;
        if (label == null) text = status.toUpperCase();
        break;

      default:
        bg = const Color(0xFFF0F0F0);
        fg = AppColors.textSecondary;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: fg.withOpacity(0.2), width: 1),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: fg,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
