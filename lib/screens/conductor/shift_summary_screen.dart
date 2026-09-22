import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';

class ShiftSummaryScreen extends StatefulWidget {
  final VoidCallback onBack;

  const ShiftSummaryScreen({required this.onBack});

  @override
  _ShiftSummaryScreenState createState() => _ShiftSummaryScreenState();
}

class _ShiftSummaryScreenState extends State<ShiftSummaryScreen> {
  final _cashCountedController = TextEditingController();
  bool _isReconciled = false;

  @override
  void dispose() {
    _cashCountedController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final dash = Provider.of<DashboardProvider>(context);
    final user = auth.currentUser;
    final shift = dash.getShiftSummary(user?.uid ?? 'user_conductor_1');

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
                'Shift Cash Reconciliation',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Overview Card
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
                  'SHIFT AUDIT SUMMARY',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textSecondary, letterSpacing: 0.6),
                ),
                const SizedBox(height: 12),
                _buildRow('Conductor Name', user?.name ?? 'Anita Deshmukh'),
                _buildRow('Employee ID', user?.employeeId ?? 'CND-4092'),
                _buildRow('Date / Started', '${shift.date} • ${shift.startTime}'),
                _buildRow('Total Completed Trips', '${shift.totalTrips} Trips'),
                _buildRow('Total Passengers Logged', '${shift.totalPassengers} Pax'),
                const Divider(height: 24),
                _buildRow('Total Fare Collection', Formatters.currency(shift.shiftTotalRevenue), isBold: true),
                _buildRow('Digital / QR Revenue', Formatters.currency(shift.digitalRevenue)),
                _buildRow('Expected Physical Cash', Formatters.currency(shift.cashRevenue), isBold: true, highlightColor: AppColors.primary),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // End of Shift Cash Entry
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
                  'Physical Cash Handover Entry',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Count physical bank notes and coins collected during this shift and enter below for automated verification.',
                  style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.3),
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _cashCountedController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.currency_rupee_rounded),
                    hintText: 'Enter counted cash amount in ₹',
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      final entered = double.tryParse(_cashCountedController.text) ?? 0.0;
                      final expected = shift.cashRevenue;
                      final diff = (entered - expected).abs();

                      setState(() => _isReconciled = true);

                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: diff < 1.0 ? AppColors.success : AppColors.warning,
                          content: Text(
                            diff < 1.0
                                ? 'Cash Reconciled Perfectly! Ready for Depot Depot Handover.'
                                : 'Cash Discrepancy of ${Formatters.currency(diff)}. Flagged for Depot Cashier review.',
                          ),
                        ),
                      );
                    },
                    child: const Text('Verify & Reconcile Cash Handover'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRow(String label, String value, {bool isBold = false, Color? highlightColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
          Text(
            value,
            style: TextStyle(
              fontSize: isBold ? 15 : 13,
              fontWeight: isBold ? FontWeight.w900 : FontWeight.w600,
              color: highlightColor ?? AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
