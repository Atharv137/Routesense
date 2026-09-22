import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../models/route_model.dart';
import '../../providers/bus_provider.dart';
import '../../providers/route_provider.dart';
import '../../providers/ticket_provider.dart';
import '../../widgets/common/simulation_map_widget.dart';
import '../../widgets/common/status_badge.dart';
import 'digital_ticketing_modal.dart';

class PassengerHomeScreen extends StatelessWidget {
  final Function(String) onNavigateTab;

  const PassengerHomeScreen({required this.onNavigateTab});

  @override
  Widget build(BuildContext context) {
    final routeProv = Provider.of<RouteProvider>(context);
    final busProv = Provider.of<BusProvider>(context);
    final ticketProv = Provider.of<TicketProvider>(context);

    final activeRoute = routeProv.routes.isNotEmpty ? routeProv.routes.first : null;
    final activeBuses = busProv.allBuses;
    final recentTickets = ticketProv.tickets;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Greeting & Quick Action Banner
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Live Transit Network',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.success.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.circle, size: 8, color: AppColors.success),
                          SizedBox(width: 6),
                          Text('NETWORK NORMAL', style: TextStyle(color: AppColors.success, fontSize: 10, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '${activeBuses.length} buses running active simulated telemetry across ${routeProv.routes.length} key transit corridors.',
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13, height: 1.4),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.qr_code_2_rounded, size: 18),
                        label: const Text('Book Ticket / Pass'),
                        onPressed: () {
                          showModalBottomSheet(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.white,
                            shape: const RoundedRectangleBorder(
                              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                            ),
                            builder: (_) => const DigitalTicketingModal(),
                          );
                        },
                      ),
                    ),
                    const SizedBox(width: 10),
                    OutlinedButton.icon(
                      icon: const Icon(Icons.map_rounded, size: 18, color: Colors.white),
                      label: const Text('Live Tracking', style: TextStyle(color: Colors.white)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF475569)),
                      ),
                      onPressed: () => onNavigateTab('tracking'),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Live Route Telemetry Visualizer
          if (activeRoute != null) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Primary Corridor Status',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                ),
                TextButton(
                  onPressed: () => onNavigateTab('routes'),
                  child: const Text('View All Routes', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            SimulationMapWidget(
              route: activeRoute,
              buses: activeBuses,
              height: 220,
            ),
          ],

          const SizedBox(height: 24),

          // Approaching Buses List
          const Text(
            'Live Approaching Buses',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: activeBuses.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, idx) {
              final bus = activeBuses[idx];
              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.directions_bus_rounded, color: AppColors.primary, size: 24),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                bus.routeNumber,
                                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.textPrimary),
                              ),
                              const SizedBox(width: 8),
                              StatusBadge(status: bus.status),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Approaching: ${bus.nextStop}',
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Speed: ${bus.currentSpeed} km/h • Load: ${bus.currentLoad}% (${bus.currentPassengers}/${bus.capacity})',
                            style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '${bus.etaNextStopMin} min',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary),
                        ),
                        const Text('ETA', style: TextStyle(fontSize: 10, color: AppColors.textMuted, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),

          const SizedBox(height: 24),

          // Active Digital Tickets Widget
          if (recentTickets.isNotEmpty) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Recent Digital Tickets',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                ),
                TextButton(
                  onPressed: () => onNavigateTab('tickets'),
                  child: const Text('All Tickets', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  const Icon(Icons.qr_code_rounded, size: 36, color: AppColors.primary),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Ticket #${recentTickets.first.ticketId}',
                          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                        ),
                        Text(
                          '${recentTickets.first.fromStop} → ${recentTickets.first.toStop}',
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                  OutlinedButton(
                    onPressed: () => onNavigateTab('tickets'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                    child: const Text('Show QR', style: TextStyle(fontSize: 12)),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
