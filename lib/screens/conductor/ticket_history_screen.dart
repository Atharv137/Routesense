import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../providers/auth_provider.dart';
import '../../providers/ticket_provider.dart';
import '../../widgets/common/status_badge.dart';

class TicketHistoryScreen extends StatefulWidget {
  final VoidCallback onBack;

  const TicketHistoryScreen({required this.onBack});

  @override
  _TicketHistoryScreenState createState() => _TicketHistoryScreenState();
}

class _TicketHistoryScreenState extends State<TicketHistoryScreen> {
  String _filter = 'all'; // all, cash, razorpay_digital

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final ticketProv = Provider.of<TicketProvider>(context);

    final allTickets = ticketProv.getTicketsForConductor(auth.currentUser?.uid ?? 'user_conductor_1');
    final tickets = _filter == 'all'
        ? allTickets
        : allTickets.where((t) => t.paymentType == _filter).toList();

    final totalRev = tickets.fold<double>(0.0, (sum, t) => sum + t.totalFare);

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
                'Shift Ticket Audit Log',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Filter Segmented Chips & Total
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  _buildFilterChip('all', 'All (${allTickets.length})'),
                  const SizedBox(width: 8),
                  _buildFilterChip('cash', 'Cash'),
                  const SizedBox(width: 8),
                  _buildFilterChip('razorpay_digital', 'Digital'),
                ],
              ),
              Text(
                Formatters.currency(totalRev),
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppColors.primary),
              ),
            ],
          ),

          const SizedBox(height: 16),

          tickets.isEmpty
              ? const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: Text('No tickets found matching this filter.'),
                  ),
                )
              : ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: tickets.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, idx) {
                    final t = tickets[idx];
                    return Container(
                      padding: const EdgeInsets.all(16),
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
                              Text(
                                'Ticket #${t.ticketId}',
                                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                              ),
                              StatusBadge(
                                status: 'paid',
                                label: t.paymentType == 'cash' ? 'CASH FARE' : 'DIGITAL UPI',
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '${t.fromStop}  ➔  ${t.toStop}',
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.textPrimary),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${t.passengerCount} passenger(s) • Unit: ${Formatters.currency(t.fare)}',
                                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                              ),
                              Text(
                                Formatters.currency(t.totalFare),
                                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppColors.primary),
                              ),
                            ],
                          ),
                          const Divider(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Issued by ${t.conductorName ?? "Conductor"}',
                                style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
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

  Widget _buildFilterChip(String value, String label) {
    final isSelected = _filter == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      selectedColor: AppColors.primary,
      backgroundColor: Colors.white,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : AppColors.textPrimary,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
        fontSize: 11,
      ),
      onSelected: (val) {
        if (val) setState(() => _filter = value);
      },
    );
  }
}
