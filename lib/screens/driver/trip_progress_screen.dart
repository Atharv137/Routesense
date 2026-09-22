import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../models/trip_model.dart';
import '../../models/route_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/route_provider.dart';
import '../../providers/trip_provider.dart';
import '../../widgets/common/status_badge.dart';

class TripProgressScreen extends StatelessWidget {
  final VoidCallback onBack;

  const TripProgressScreen({required this.onBack});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final tripProv = Provider.of<TripProvider>(context);
    final routeProv = Provider.of<RouteProvider>(context);

    final user = auth.currentUser;
    final trip = tripProv.getTripForDriver(user?.uid ?? 'user_driver_1');
    final route = routeProv.routes.firstWhere(
      (r) => r.routeId == trip?.routeId,
      orElse: () => routeProv.routes.first,
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                onPressed: onBack,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              const SizedBox(width: 12),
              const Text(
                'Trip Waypoints & Route Manifest',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Trip overview card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Trip #${trip?.tripId ?? "TRIP-01"}',
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                    ),
                    StatusBadge(status: trip?.status ?? 'in_progress'),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '${route.startPoint} ⇄ ${route.endPoint}',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                ),
                const Divider(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildStat('Vehicle', trip?.busNumber ?? 'MH 12 AB 1234'),
                    _buildStat('Conductor', trip?.conductorName ?? 'Anita Deshmukh'),
                    _buildStat('Load Factor', '${trip?.passengerLoad ?? 68}%'),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          const Text(
            'Scheduled Stops Manifest',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 12),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: route.scheduledStops.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, idx) {
              final stop = route.scheduledStops[idx];
              final isCurrent = stop.name == trip?.currentStopName;

              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: isCurrent ? AppColors.primaryLight : Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isCurrent ? AppColors.primary : AppColors.border,
                    width: isCurrent ? 1.5 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      isCurrent ? Icons.radio_button_checked_rounded : Icons.check_circle_outline_rounded,
                      color: isCurrent ? AppColors.primary : AppColors.textSecondary,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            stop.name,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: isCurrent ? FontWeight.w800 : FontWeight.w600,
                              color: isCurrent ? AppColors.primary : AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            '+${stop.distanceFromPrevKm} km from previous stop',
                            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                    if (isCurrent)
                      const StatusBadge(status: 'in_progress', label: 'APPROACHING')
                    else
                      Text(
                        'Stop ${idx + 1}',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textMuted),
                      ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildStat(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
