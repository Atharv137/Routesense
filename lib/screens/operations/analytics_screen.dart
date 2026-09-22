import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../providers/bus_provider.dart';
import '../../providers/route_provider.dart';
import '../../providers/ticket_provider.dart';

class AnalyticsScreen extends StatelessWidget {
  final VoidCallback onBack;

  const AnalyticsScreen({required this.onBack});

  @override
  Widget build(BuildContext context) {
    final ticketProv = Provider.of<TicketProvider>(context);
    final busProv = Provider.of<BusProvider>(context);
    final routeProv = Provider.of<RouteProvider>(context);

    final tickets = ticketProv.tickets;
    final totalRev = tickets.fold<double>(0.0, (sum, t) => sum + t.totalFare);
    final cashRev = tickets.where((t) => t.paymentType == 'cash').fold<double>(0.0, (sum, t) => sum + t.totalFare);
    final digitalRev = tickets.where((t) => t.paymentType != 'cash').fold<double>(0.0, (sum, t) => sum + t.totalFare);
    final digitalShare = totalRev > 0 ? ((digitalRev / totalRev) * 100).round() : 0;

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
                'Transit Operations Analytics',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Payment Mode Breakdown
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
                const Text(
                  'Revenue Channel Distribution',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 4),
                Text(
                  'Digital UPI vs Physical Cash Fares (${tickets.length} total tickets)',
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 16),

                // Distribution Bar
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Row(
                    children: [
                      Expanded(
                        flex: totalRev > 0 ? (cashRev / totalRev * 100).round() : 50,
                        child: Container(
                          height: 20,
                          color: AppColors.primary,
                          alignment: Alignment.center,
                          child: const Text('Cash', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      Expanded(
                        flex: totalRev > 0 ? (digitalRev / totalRev * 100).round() : 50,
                        child: Container(
                          height: 20,
                          color: AppColors.info,
                          alignment: Alignment.center,
                          child: const Text('Digital', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildChannelStat('Physical Cash', Formatters.currency(cashRev), '${100 - digitalShare}%', AppColors.primary),
                    _buildChannelStat('Digital / QR', Formatters.currency(digitalRev), '$digitalShare%', AppColors.info),
                    _buildChannelStat('Total Net', Formatters.currency(totalRev), '100%', AppColors.success),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Corridor Ridership
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
                const Text(
                  'Corridor Ridership & Load Factors',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 14),
                ...routeProv.routes.map((route) {
                  final buses = busProv.allBuses.where((b) => b.routeId == route.routeId).toList();
                  final avgLoad = buses.isNotEmpty
                      ? (buses.fold<int>(0, (sum, b) => sum + b.currentLoad) / buses.length).round()
                      : 65;

                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${route.routeNumber} (${route.startPoint} ⇄ ${route.endPoint})',
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                            ),
                            Text(
                              '$avgLoad% Load',
                              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: avgLoad > 80 ? AppColors.warning : AppColors.primary),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: avgLoad / 100,
                            minHeight: 8,
                            backgroundColor: const Color(0xFFF1F5F9),
                            valueColor: AlwaysStoppedAnimation<Color>(avgLoad > 80 ? AppColors.warning : AppColors.primary),
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChannelStat(String label, String value, String share, Color color) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: color)),
        Text(share, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
