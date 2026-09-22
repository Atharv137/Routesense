import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/bus_provider.dart';
import '../../providers/route_provider.dart';
import '../../widgets/common/simulation_map_widget.dart';
import '../../widgets/common/status_badge.dart';

class LiveTrackingScreen extends StatefulWidget {
  final VoidCallback onBack;

  const LiveTrackingScreen({required this.onBack});

  @override
  _LiveTrackingScreenState createState() => _LiveTrackingScreenState();
}

class _LiveTrackingScreenState extends State<LiveTrackingScreen> {
  String? _selectedRouteId;

  @override
  Widget build(BuildContext context) {
    final routeProv = Provider.of<RouteProvider>(context);
    final busProv = Provider.of<BusProvider>(context);

    if (routeProv.routes.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    _selectedRouteId ??= routeProv.routes.first.routeId;

    final route = routeProv.routes.firstWhere(
      (r) => r.routeId == _selectedRouteId,
      orElse: () => routeProv.routes.first,
    );

    final busesOnRoute = busProv.buses.where((b) => b.routeId == route.routeId).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                onPressed: widget.onBack,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              const SizedBox(width: 12),
              const Text(
                'Live Bus Simulation Tracker',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Corridor Selector Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: routeProv.routes.map((r) {
                final isSelected = r.routeId == _selectedRouteId;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text('${r.routeNumber} (${r.startPoint.split(" ").first})'),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    backgroundColor: Colors.white,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                    ),
                    onSelected: (val) {
                      if (val) setState(() => _selectedRouteId = r.routeId);
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 16),

          // Primary Simulation Map Widget
          SimulationMapWidget(
            route: route,
            buses: busProv.allBuses,
            height: 280,
          ),

          const SizedBox(height: 20),

          // Corridor Stops & Approaching Bus Telemetry
          const Text(
            'Buses Currently En Route',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 12),

          busesOnRoute.isEmpty
              ? Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: const Center(child: Text('No active buses assigned to this corridor at present.')),
                )
              : ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: busesOnRoute.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, idx) {
                    final bus = busesOnRoute[idx];
                    return Container(
                      padding: const EdgeInsets.all(16),
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
                              Row(
                                children: [
                                  const Icon(Icons.directions_bus_rounded, color: AppColors.primary, size: 20),
                                  const SizedBox(width: 8),
                                  Text(
                                    bus.busNumber,
                                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                                  ),
                                ],
                              ),
                              StatusBadge(status: bus.status),
                            ],
                          ),
                          const Divider(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Next Approaching Stop', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                                  Text(
                                    bus.nextStop,
                                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                                  ),
                                ],
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  const Text('ETA', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                                  Text(
                                    '~${bus.etaNextStopMin} min',
                                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: AppColors.primary),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          // Passenger Load Bar
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Occupancy Load: ${bus.currentLoad}% (${bus.currentPassengers}/${bus.capacity} Seats)',
                                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                                  ),
                                  Text(
                                    '${bus.currentSpeed} km/h',
                                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(4),
                                child: LinearProgressIndicator(
                                  value: (bus.currentLoad / 100).clamp(0.0, 1.0),
                                  backgroundColor: const Color(0xFFE2E8F0),
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    bus.currentLoad > 85 ? AppColors.error : AppColors.primary,
                                  ),
                                  minHeight: 6,
                                ),
                              ),
                            ],
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
