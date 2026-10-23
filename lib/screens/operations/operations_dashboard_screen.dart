import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../providers/auth_provider.dart';
import '../../providers/bus_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../providers/incident_provider.dart';
import '../../providers/ticket_provider.dart';
import '../../widgets/common/status_badge.dart';

class OperationsDashboardScreen extends StatelessWidget {
  final Function(String) onNavigateTab;

  const OperationsDashboardScreen({required this.onNavigateTab});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final busProv = Provider.of<BusProvider>(context);
    final incidentProv = Provider.of<IncidentProvider>(context);
    final ticketProv = Provider.of<TicketProvider>(context);
    final dash = Provider.of<DashboardProvider>(context);

    final buses = busProv.allBuses;
    final onTimeCount = buses.where((b) => b.isOnTime).length;
    final onTimePercent = buses.isNotEmpty ? ((onTimeCount / buses.length) * 100).round() : 100;
    final totalRevenue = ticketProv.tickets.fold<double>(0.0, (sum, t) => sum + t.totalFare);
    final openIncidents = incidentProv.allIncidents.where((i) => i.status == 'open').toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Command Center Welcome
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
                          'Operations Command Center',
                          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                        ),
                        Text(
                          'Officer: ${auth.currentUser?.name ?? "Siddharth Rao"} • Central Depot',
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'DISPATCH ACTIVE',
                        style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const Divider(color: Color(0xFF334155), height: 24),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.map_rounded, size: 18),
                        label: const Text('Fleet Visibility Map'),
                        onPressed: () => onNavigateTab('fleet'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    OutlinedButton.icon(
                      icon: const Icon(Icons.warning_amber_rounded, size: 18, color: Colors.white),
                      label: Text('Issues (${dash.recurringIssues.length})', style: const TextStyle(color: Colors.white)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF475569)),
                      ),
                      onPressed: () => onNavigateTab('issues'),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // High-level KPI Metric Cards
          const Text(
            'Live System Performance Metrics',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildKpiCard(
                  title: 'Active Buses',
                  value: '${buses.length}',
                  subtitle: '${buses.where((b) => b.isDelayed).length} delayed',
                  icon: Icons.directions_bus_rounded,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildKpiCard(
                  title: 'On-Time Rate',
                  value: '$onTimePercent%',
                  subtitle: '$onTimeCount of ${buses.length} on time',
                  icon: Icons.check_circle_rounded,
                  color: onTimePercent >= 80 ? AppColors.success : AppColors.warning,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildKpiCard(
                  title: 'Total Revenue',
                  value: Formatters.currency(totalRevenue),
                  subtitle: '${ticketProv.tickets.length} tickets',
                  icon: Icons.account_balance_wallet_rounded,
                  color: AppColors.info,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildKpiCard(
                  title: 'Open Incidents',
                  value: '${openIncidents.length}',
                  subtitle: '${dash.recurringIssues.length} recurring spots',
                  icon: Icons.report_problem_rounded,
                  color: openIncidents.isNotEmpty ? AppColors.error : AppColors.success,
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Active Incidents Dispatch Triage
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Live Incident Dispatch Feed',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
              if (openIncidents.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.errorLight,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '${openIncidents.length} Action Needed',
                    style: const TextStyle(color: AppColors.error, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),

          openIncidents.isEmpty
              ? Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: const Center(
                    child: Text('All systems nominal. No open critical incidents across fleet.'),
                  ),
                )
              : ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: openIncidents.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, idx) {
                    final inc = openIncidents[idx];
                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.error.withOpacity(0.4), width: 1.5),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.warning_amber_rounded, color: AppColors.error, size: 20),
                                  const SizedBox(width: 8),
                                  Text(
                                    '${inc.type.toUpperCase()}: ${inc.routeNumber}',
                                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                                  ),
                                ],
                              ),
                              StatusBadge(status: inc.severity),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            inc.description,
                            style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Location: ${inc.locationName} • Bus: ${inc.busNumber} • Delay: +${inc.delayMinutes} min',
                            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                          ),
                          const Divider(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Reported by ${inc.driverName} • ${Formatters.fromIsoString(inc.timestamp)}',
                                style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                              ),
                              ElevatedButton(
                                onPressed: () {
                                  incidentProv.resolveIncident(inc.incidentId, 'Resolved by Central Dispatch');
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Incident on ${inc.routeNumber} resolved! Bus restored to On-Time.')),
                                  );
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.success,
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  minimumSize: Size.zero,
                                ),
                                child: const Text('Mark Resolved', style: TextStyle(fontSize: 11)),
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

  Widget _buildKpiCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color color,
  }) {
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
              Text(title, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
              Icon(icon, color: color, size: 18),
            ],
          ),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: color)),
          const SizedBox(height: 4),
          Text(subtitle, style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
        ],
      ),
    );
  }
}
