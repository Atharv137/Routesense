import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/bus_model.dart';
import '../../models/route_model.dart';

class SimulationMapWidget extends StatelessWidget {
  final RouteModel route;
  final List<BusModel> buses;
  final double height;
  final bool interactive;

  const SimulationMapWidget({
    required this.route,
    required this.buses,
    this.height = 280,
    this.interactive = true,
  });

  @override
  Widget build(BuildContext context) {
    final routeBuses = buses.where((b) => b.routeId == route.routeId).toList();

    return Container(
      height: height,
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A), // Tactical Dark Navy Canvas
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Stack(
        children: [
          // Grid background pattern
          Positioned.fill(
            child: CustomPaint(
              painter: _GridPatternPainter(),
            ),
          ),

          // Corridor Header Badge
          Positioned(
            top: 12,
            left: 14,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B).withOpacity(0.9),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${route.routeNumber}: ${route.startPoint} ⇄ ${route.endPoint}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.3,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Simulation Label
          Positioned(
            top: 12,
            right: 14,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.15),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: AppColors.primary.withOpacity(0.4)),
              ),
              child: const Text(
                'LIVE SIMULATION (3s)',
                style: TextStyle(
                  color: AppColors.primary,
                  fontSize: 9,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.6,
                ),
              ),
            ),
          ),

          // Interactive Route Schematic & Bus Markers
          Positioned.fill(
            top: 48,
            bottom: 16,
            left: 16,
            right: 16,
            child: LayoutBuilder(
              builder: (context, constraints) {
                final stops = route.scheduledStops;
                if (stops.isEmpty) return const SizedBox.shrink();

                final count = stops.length;
                final spacing = constraints.maxWidth / (count - 1);

                return Stack(
                  alignment: Alignment.centerLeft,
                  children: [
                    // Route Guideline
                    Positioned(
                      left: 10,
                      right: 10,
                      child: Container(
                        height: 4,
                        decoration: BoxDecoration(
                          color: const Color(0xFF334155),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),

                    // Stops along the line
                    ...List.generate(count, (idx) {
                      final stop = stops[idx];
                      final xPos = (idx * spacing).clamp(0.0, constraints.maxWidth - 20);

                      return Positioned(
                        left: xPos,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: stop.isMajor ? 14 : 10,
                              height: stop.isMajor ? 14 : 10,
                              decoration: BoxDecoration(
                                color: stop.isMajor ? Colors.white : const Color(0xFF94A3B8),
                                shape: BoxShape.circle,
                                border: Border.all(color: const Color(0xFF0F172A), width: 2),
                              ),
                            ),
                            const SizedBox(height: 6),
                            SizedBox(
                              width: 60,
                              child: Text(
                                stop.name,
                                textAlign: TextAlign.center,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: stop.isMajor ? Colors.white : const Color(0xFF94A3B8),
                                  fontSize: 9,
                                  fontWeight: stop.isMajor ? FontWeight.w700 : FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    }),

                    // Active Simulated Buses
                    ...routeBuses.map((bus) {
                      // Find which stop it's near
                      int matchIdx = 0;
                      for (int i = 0; i < stops.length; i++) {
                        if (stops[i].name == bus.nextStop) {
                          matchIdx = math.max(0, i - 1);
                          break;
                        }
                      }

                      final busX = (matchIdx * spacing + spacing * 0.45).clamp(10.0, constraints.maxWidth - 50);

                      Color busColor = AppColors.success;
                      if (bus.isDelayed) busColor = AppColors.warning;
                      if (bus.isBreakdown) busColor = AppColors.error;

                      return Positioned(
                        left: busX,
                        top: constraints.maxHeight * 0.15,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                          decoration: BoxDecoration(
                            color: busColor,
                            borderRadius: BorderRadius.circular(8),
                            boxShadow: [
                              BoxShadow(
                                color: busColor.withOpacity(0.4),
                                blurRadius: 8,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.directions_bus_rounded, size: 12, color: Colors.white),
                                  const SizedBox(width: 4),
                                  Text(
                                    bus.busNumber.split(' ').last,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${bus.currentSpeed} km/h • ${bus.currentLoad}% Load',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 8,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                'Next: ${bus.nextStop} (${bus.etaNextStopMin}m)',
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.9),
                                  fontSize: 8,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ],
                );
              },
            ),
          ),

          // Bottom telemetry footer
          Positioned(
            bottom: 8,
            left: 14,
            right: 14,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${routeBuses.length} Bus(es) Active in Corridor',
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.w600),
                ),
                Text(
                  'Avg Headway: ${route.frequencyMin}m • Total dist: ${route.totalDistanceKm} km',
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _GridPatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF1E293B).withOpacity(0.4)
      ..strokeWidth = 0.5;

    const spacing = 24.0;
    for (double x = 0; x < size.width; x += spacing) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += spacing) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
