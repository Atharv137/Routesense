import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../providers/ticket_provider.dart';
import '../../providers/trip_provider.dart';
import '../../widgets/common/status_badge.dart';
import 'ticket_logger_modal.dart';

class ConductorHomeScreen extends StatelessWidget {
  final Function(String) onNavigateTab;

  const ConductorHomeScreen({required this.onNavigateTab});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final tripProv = Provider.of<TripProvider>(context);
    final ticketProv = Provider.of<TicketProvider>(context);
    final dash = Provider.of<DashboardProvider>(context);

    final user = auth.currentUser;
    final trip = tripProv.getTripForConductor(user?.uid ?? 'user_conductor_1');
    final shift = dash.getShiftSummary(user?.uid ?? 'user_conductor_1');
    final tickets = ticketProv.getTicketsForConductor(user?.uid ?? 'user_conductor_1');

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Conductor Duty Card
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
                          'Conductor Shift Console',
                          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900),
                        ),
                        Text(
                          'Conductor: ${user?.name ?? "Anita Deshmukh"} • ID: ${user?.employeeId ?? "CND-4092"}',
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                        ),
                      ],
                    ),
                    const StatusBadge(status: 'paid', label: 'ON DUTY'),
                  ],
                ),
                const Divider(color: Color(0xFF334155), height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildShiftStat('Assigned Bus', trip?.busNumber ?? 'MH 12 AB 1234'),
                    _buildShiftStat('Corridor', trip?.routeNumber ?? '101-EXP'),
                    _buildShiftStat('Shift Started', shift.startTime),
                  ],
                ),
                const SizedBox(height: 18),
                // Prominent CTA to log tickets
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.confirmation_number_rounded, size: 20),
                    label: const Text('ISSUE NEW TICKET (POS)', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 16),
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
                          builder: (_) => TicketLoggerModal(trip: trip),
                        );
                      }
                    },
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Shift Revenue Summary Grid
          const Text(
            'Current Shift Collection',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildMetricCard(
                  title: 'Total Revenue',
                  value: Formatters.currency(shift.shiftTotalRevenue),
                  subtitle: '${shift.totalTickets} tickets issued',
                  icon: Icons.currency_rupee_rounded,
                  accentColor: AppColors.primary,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildMetricCard(
                  title: 'Cash in Hand',
                  value: Formatters.currency(shift.cashRevenue),
                  subtitle: 'Physical collection',
                  icon: Icons.payments_rounded,
                  accentColor: AppColors.success,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildMetricCard(
                  title: 'Digital UPI',
                  value: Formatters.currency(shift.digitalRevenue),
                  subtitle: 'Razorpay / QR',
                  icon: Icons.qr_code_2_rounded,
                  accentColor: AppColors.info,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildMetricCard(
                  title: 'Passengers Carried',
                  value: '${shift.totalPassengers}',
                  subtitle: 'Occupancy: ${trip?.passengerLoad ?? 68}%',
                  icon: Icons.people_alt_rounded,
                  accentColor: AppColors.warning,
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Recent Issued Tickets
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Recent Ticket Logs',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
              TextButton(
                onPressed: () => onNavigateTab('tickets'),
                child: const Text('View All Tickets', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 8),

          tickets.isEmpty
              ? Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: const Center(child: Text('No tickets issued on this shift yet.')),
                )
              : ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: tickets.take(5).length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, idx) {
                    final t = tickets[idx];
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
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: t.paymentType == 'cash' ? AppColors.successLight : AppColors.infoLight,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(
                              t.paymentType == 'cash' ? Icons.money_rounded : Icons.qr_code_rounded,
                              color: t.paymentType == 'cash' ? AppColors.success : AppColors.info,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      '#${t.ticketId}',
                                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      '• ${t.passengerCount} Pax',
                                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                    ),
                                  ],
                                ),
                                Text(
                                  '${t.fromStop} → ${t.toStop}',
                                  style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                Formatters.currency(t.totalFare),
                                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: AppColors.textPrimary),
                              ),
                              Text(
                                Formatters.fromIsoString(t.timestamp),
                                style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
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

  Widget _buildShiftStat(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
      ],
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color accentColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
              Icon(icon, size: 16, color: accentColor),
            ],
          ),
          const SizedBox(height: 6),
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: accentColor)),
          const SizedBox(height: 2),
          Text(subtitle, style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
        ],
      ),
    );
  }
}
