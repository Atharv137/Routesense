import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/ticket_model.dart';
import '../../providers/ticket_provider.dart';
import '../../widgets/common/status_badge.dart';

class PassengerTicketsScreen extends StatefulWidget {
  final VoidCallback onBack;

  const PassengerTicketsScreen({required this.onBack});

  @override
  _PassengerTicketsScreenState createState() => _PassengerTicketsScreenState();
}

class _PassengerTicketsScreenState extends State<PassengerTicketsScreen> {
  TicketModel? _expandedTicket;

  @override
  Widget build(BuildContext context) {
    final ticketProv = Provider.of<TicketProvider>(context);
    final tickets = ticketProv.tickets;

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
                'My Digital QR Tickets',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Detail Modal / Banner if ticket tapped
          if (_expandedTicket != null) ...[
            _buildQrInspector(_expandedTicket!),
            const SizedBox(height: 24),
          ],

          // Tickets list
          tickets.isEmpty
              ? const Center(
                  child: Padding(
                    padding: EdgeInsets.all(40),
                    child: Text('No tickets issued yet. Book a ticket to receive a QR pass!'),
                  ),
                )
              : ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: tickets.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 14),
                  itemBuilder: (context, idx) {
                    final t = tickets[idx];
                    return _buildTicketCard(t);
                  },
                ),
        ],
      ),
    );
  }

  Widget _buildQrInspector(TicketModel t) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary, width: 2),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.12),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'TICKET #${t.ticketId}',
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 0.5),
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded),
                onPressed: () => setState(() => _expandedTicket = null),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // High Contrast QR Code
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: QrImageView(
              data: t.qrCodeData,
              version: QrVersions.auto,
              size: 200,
              gapless: true,
              eyeStyle: const QrEyeStyle(
                eyeShape: QrEyeShape.square,
                color: Colors.black,
              ),
              dataModuleStyle: const QrDataModuleStyle(
                dataModuleShape: QrDataModuleShape.square,
                color: Colors.black,
              ),
            ),
          ),

          const SizedBox(height: 14),
          const Text(
            'Present this QR Code to Conductor Anita upon boarding',
            style: TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFF3F4F6),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              t.qrCodeData,
              style: const TextStyle(fontSize: 9, fontFamily: 'monospace', color: AppColors.textSecondary),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTicketCard(TicketModel t) {
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
                      t.routeNumber,
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: AppColors.primary),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '#${t.ticketId}',
                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                  ),
                ],
              ),
              StatusBadge(status: t.paymentStatus),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.trip_origin_rounded, size: 16, color: AppColors.primary),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  '${t.fromStop}  ➔  ${t.toStop}',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            '${t.passengerCount} Pax • ${Formatters.currency(t.totalFare)} • ${t.paymentType == "cash" ? "Cash Fare" : "Razorpay Digital"}',
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
          const Divider(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                Formatters.fromIsoString(t.timestamp),
                style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
              ),
              ElevatedButton.icon(
                icon: const Icon(Icons.qr_code_rounded, size: 16),
                label: const Text('Inspect QR'),
                onPressed: () => setState(() => _expandedTicket = t),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
