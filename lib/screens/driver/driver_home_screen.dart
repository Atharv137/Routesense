import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/bus_provider.dart';
import '../../providers/route_provider.dart';
import '../../providers/trip_provider.dart';
import '../../widgets/common/simulation_map_widget.dart';
import '../../widgets/common/status_badge.dart';
import 'incident_report_modal.dart';

class DriverHomeScreen extends StatelessWidget {
  final Function(String) onNavigateTab;

  const DriverHomeScreen({required this.onNavigateTab});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final tripProv = Provider.of<TripProvider>(context);
    final busProv = Provider.of<BusProvider>(context);
    final routeProv = Provider.of<RouteProvider>(context);

    final user = auth.currentUser;
    final trip = tripProv.getTripForDriver(user?.uid ?? 'user_driver_1');
    final bus = busProv.allBuses.firstWhere(
      (b) => b.busId == trip?.busId,
      orElse: () => busProv.allBuses.first,
    );
    final route = routeProv.routes.firstWhere(
      (r) => r.routeId == bus.routeId,
      orElse: () => routeProv.routes.first,
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Driver Cab Banner
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Driver Cockpit Console',
                          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900),
                        ),
                        Text(
                          'Driver: ${user?.name ?? "Rajesh Kumar"} • Bus: ${bus.busNumber}',
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                        ),
                      ],
                    ),
                    StatusBadge(status: bus.status),
                  ],
                ),
                const Divider(color: Color(0xFF334155), height: 24),

                // Speedometer & Telemetry Cluster
                Row(
                  children: [
                    // Speed Dial Card
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF334155).withOpacity(0.5),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF475569)),
                      ),
                      child: Column(
                        children: [
                          Text(
                            '${bus.currentSpeed}',
                            style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900),
                          ),
                          const Text('KM / H', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 9, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 14),
                    // Next Stop & ETA
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('NEXT SCHEDULED STOP', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 2),
                          Text(
                            bus.nextStop,
                            style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'ETA ~${bus.etaNextStopMin} min • Passenger Load: ${bus.currentLoad}% (${bus.currentPassengers}/${bus.capacity})',
                            style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 18),

                // Report Incident Emergency CTA
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.report_problem_rounded, color: Colors.white, size: 20),
                    label: const Text('REPORT INCIDENT / DELAY / BREAKDOWN', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.error,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () {
                      if (trip != null) {
                        showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          backgroundColor: Colors.white,
                          shape: const RoundedRectangleBorder(
                            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                          ),
                          builder: (_) => IncidentReportModal(trip: trip),
                        );
                      }
                    },
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Live Route Map Visualizer
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Corridor Telemetry',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
              Text(
                'Corridor ${route.routeNumber}',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary),
              ),
            ],
          ),
          const SizedBox(height: 8),
          SimulationMapWidget(
            route: route,
            buses: [bus],
            height: 220,
          ),

          const SizedBox(height: 24),

          // Next Stops Sequence Checklist
          const Text(
            'Upcoming Waypoints Sequence',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 12),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics),
            itemCount: route.scheduledStops.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, idx) {
              final stop = route.scheduledStops[idx];
              final isNext = stop.name == bus.nextStop;

              return Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isNext ? AppColors.primaryLight : Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isNext ? AppColors.primary : AppColors.border,
                    width: isNext ? 1.5 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 12,
                      backgroundColor: isNext ? AppColors.primary : const Color(0xFFE2E8F0),
                      child: Text(
                        '${idx + 1}',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isNext ? Colors.white : AppColors.textSecondary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            stop.name,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: isNext ? FontWeight.w800 : FontWeight.w600,
                              color: isNext ? AppColors.primary : AppColors.textPrimary,
                            ),
                          ),
                          if (stop.isMajor)
                            const Text(
                              'Major Transit Interchange',
                              style: TextStyle(fontSize: 10, color: AppColors.textMuted),
                            ),
                        ],
                      ),
                    ),
                    if (isNext)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          'ETA ~${bus.etaNextStopMin}M',
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
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
}
