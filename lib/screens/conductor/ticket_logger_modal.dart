import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/trip_model.dart';
import '../../models/route_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/route_provider.dart';
import '../../providers/ticket_provider.dart';
import '../../providers/trip_provider.dart';

class TicketLoggerModal extends StatefulWidget {
  final TripModel trip;

  const TicketLoggerModal({required this.trip});

  @override
  _TicketLoggerModalState createState() => _TicketLoggerModalState();
}

class _TicketLoggerModalState extends State<TicketLoggerModal> {
  String? _fromStop;
  String? _toStop;
  int _passengerCount = 1;
  String _paymentType = 'cash'; // Conductor defaults to cash
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final routeProv = Provider.of<RouteProvider>(context, listen: false);
    final route = routeProv.routes.firstWhere(
      (r) => r.routeId == widget.trip.routeId,
      orElse: () => routeProv.routes.first,
    );

    if (route.scheduledStops.length >= 2) {
      _fromStop = widget.trip.currentStopName.isNotEmpty ? widget.trip.currentStopName : route.scheduledStops.first.name;
      _toStop = route.scheduledStops.last.name;
    }
  }

  @override
  Widget build(BuildContext context) {
    final routeProv = Provider.of<RouteProvider>(context);
    final ticketProv = Provider.of<TicketProvider>(context);
    final auth = Provider.of<AuthProvider>(context);

    final route = routeProv.routes.firstWhere(
      (r) => r.routeId == widget.trip.routeId,
      orElse: () => routeProv.routes.first,
    );

    final stops = route.scheduledStops;
    final fare = (_fromStop != null && _toStop != null)
        ? route.calculateFare(_fromStop!, _toStop!)
        : route.baseFare;
    final totalFare = fare * _passengerCount;

    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        left: 20,
        right: 20,
        top: 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.confirmation_number_rounded, color: AppColors.primary, size: 22),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Issue Passenger Ticket',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                  ),
                  Text(
                    'Bus ${widget.trip.busNumber} • Corridor ${widget.trip.routeNumber}',
                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                  ),
                ],
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.close_rounded),
                onPressed: () => Navigator.of(context).pop(),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
          const Divider(height: 20),

          // From & To Stops
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Boarding (From)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _fromStop,
                      items: stops.map((s) => DropdownMenuItem(value: s.name, child: Text(s.name, overflow: TextOverflow.ellipsis))).toList(),
                      onChanged: (val) => setState(() => _fromStop = val),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Alighting (To)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _toStop,
                      items: stops.map((s) => DropdownMenuItem(value: s.name, child: Text(s.name, overflow: TextOverflow.ellipsis))).toList(),
                      onChanged: (val) => setState(() => _toStop = val),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Passenger Count & Payment Method
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Passenger Count', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.remove_circle_outline_rounded),
                          onPressed: _passengerCount > 1 ? () => setState(() => _passengerCount--) : null,
                        ),
                        Text('$_passengerCount', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                        IconButton(
                          icon: const Icon(Icons.add_circle_outline_rounded),
                          onPressed: _passengerCount < 10 ? () => setState(() => _passengerCount++) : null,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Payment Method', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    SegmentedButton<String>(
                      segments: const [
                        ButtonSegment(value: 'cash', label: Text('Cash', style: TextStyle(fontSize: 11))),
                        ButtonSegment(value: 'razorpay_digital', label: Text('Digital', style: TextStyle(fontSize: 11))),
                      ],
                      selected: {_paymentType},
                      onSelectionChanged: (val) => setState(() => _paymentType = val.first),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Total Fare Box
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.primary.withOpacity(0.3)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Total Fare Collected', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    Text(
                      '${Formatters.currency(fare)} × $_passengerCount Pax',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                Text(
                  Formatters.currency(totalFare),
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.primary),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Print / Issue Ticket Button
          ElevatedButton.icon(
            icon: _isSaving
                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Icon(Icons.print_rounded),
            label: Text(_isSaving ? 'Logging to Central System...' : 'Log & Print Ticket (₹${totalFare.toStringAsFixed(0)})'),
            onPressed: _isSaving
                ? null
                : () async {
                    if (_fromStop == null || _toStop == null || _fromStop == _toStop) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please select two different stops.')),
                      );
                      return;
                    }

                    setState(() => _isSaving = true);
                    final user = auth.currentUser;

                    final ticket = await ticketProv.issueTicket(
                      tripId: widget.trip.tripId,
                      routeId: widget.trip.routeId,
                      fromStop: _fromStop!,
                      toStop: _toStop!,
                      passengerCount: _passengerCount,
                      paymentType: _paymentType,
                      conductorId: user?.uid,
                      conductorName: user?.name,
                      issuedByRole: 'conductor',
                    );

                    setState(() => _isSaving = false);

                    if (ticket != null) {
                      Navigator.of(context).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: AppColors.success,
                          content: Text('Ticket #${ticket.ticketId} issued! Shift revenue updated.'),
                        ),
                      );
                    }
                  },
          ),
        ],
      ),
    );
  }
}
