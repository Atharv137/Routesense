import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../models/bus_model.dart';
import '../../models/route_model.dart';
import '../../providers/bus_provider.dart';
import '../../providers/route_provider.dart';
import '../../widgets/common/simulation_map_widget.dart';
import '../../widgets/common/status_badge.dart';

class FleetLiveScreen extends StatefulWidget {
  final VoidCallback onBack;

  const FleetLiveScreen({required this.onBack});

  @override
  _FleetLiveScreenState createState() => _FleetLiveScreenState();
}

class _FleetLiveScreenState extends State<FleetLiveScreen> {
  String _selectedRouteId = 'route_101';

  @override
  Widget build(BuildContext context) {
    final routeProv = Provider.of<RouteProvider>(context);
    final busProv = Provider.of<BusProvider>(context);

    if (routeProv.routes.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    final route = routeProv.routes.firstWhere(
      (r) => r.routeId == _selectedRouteId,
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
                onPressed: widget.onBack,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              const SizedBox(width: 12),
              const Text(
                'Network Fleet Map & Telemetry',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Corridor Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: routeProv.routes.map((r) {
                final isSelected = r.routeId == _selectedRouteId;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text('${r.routeNumber}: ${r.routeName.split(" ").first}'),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    backgroundColor: Colors.white,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                      fontSize: 12,
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

          // Full Simulation Map Canvas
          SimulationMapWidget(
            route: route,
            buses: busProv.allBuses,
            height: 300,
          ),

          const SizedBox(height: 20),

          // Detailed Fleet Roster
          const Text(
            'Active Vehicle Roster & Telemetry',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 12),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: busProv.allBuses.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, idx) {
              final b = busProv.allBuses[idx];
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
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.primaryLight,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                b.routeNumber,
                                style: const TextStyle(fontWeight: FontWeight.w900, color: AppColors.primary, fontSize: 12),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Text(
                              b.busNumber,
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                            ),
                          ],
                        ),
                        StatusBadge(status: b.status),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildRosterDetail('Driver', b.driverName),
                        _buildRosterDetail('Speed', '${b.currentSpeed} km/h'),
                        _buildRosterDetail('Occupancy', '${b.currentLoad}% (${b.currentPassengers}/${b.capacity})'),
                        _buildRosterDetail('Next Stop', '${b.nextStop} (${b.etaNextStopMin}m)'),
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

  Widget _buildRosterDetail(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
      ],
    );
  }
}
