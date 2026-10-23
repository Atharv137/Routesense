import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../providers/auth_provider.dart';
import '../../providers/route_provider.dart';
import '../../providers/ticket_provider.dart';
import '../../providers/trip_provider.dart';

class DigitalTicketingModal extends StatefulWidget {
  final String? preselectedRouteId;

  const DigitalTicketingModal({this.preselectedRouteId});

  @override
  _DigitalTicketingModalState createState() => _DigitalTicketingModalState();
}

class _DigitalTicketingModalState extends State<DigitalTicketingModal> {
  late String _selectedRouteId;
  String? _fromStop;
  String? _toStop;
  int _passengerCount = 1;
  final String _paymentMethod = 'razorpay_digital';
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    final routes = Provider.of<RouteProvider>(context, listen: false).routes;
    _selectedRouteId = widget.preselectedRouteId ?? (routes.isNotEmpty ? routes.first.routeId : 'route_101');
    _updateStops();
  }

  void _updateStops() {
    final routes = Provider.of<RouteProvider>(context, listen: false).routes;
    final r = routes.firstWhere((item) => item.routeId == _selectedRouteId, orElse: () => routes.first);
    if (r.scheduledStops.length >= 2) {
      _fromStop = r.scheduledStops.first.name;
      _toStop = r.scheduledStops.last.name;
    }
  }

  @override
  Widget build(BuildContext context) {
    final routeProv = Provider.of<RouteProvider>(context);
    final ticketProv = Provider.of<TicketProvider>(context);
    final tripProv = Provider.of<TripProvider>(context);
    final auth = Provider.of<AuthProvider>(context);

    final route = routeProv.routes.firstWhere(
      (r) => r.routeId == _selectedRouteId,
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
              const Icon(Icons.qr_code_2_rounded, color: AppColors.primary, size: 24),
              const SizedBox(width: 8),
              const Text(
                'Book Digital Bus Pass / Ticket',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
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

          // Route selection
          const Text('Select Bus Corridor', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _selectedRouteId,
            items: routeProv.routes.map((r) {
              return DropdownMenuItem(
                value: r.routeId,
                child: Text('${r.routeNumber} — ${r.routeName}', overflow: TextOverflow.ellipsis),
              );
            }).toList(),
            onChanged: (val) {
              if (val != null) {
                setState(() {
                  _selectedRouteId = val;
                  _updateStops();
                });
              }
            },
          ),
          const SizedBox(height: 12),

          // From and To stops
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Boarding Stop', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
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
                    const Text('Destination Stop', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
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
          const SizedBox(height: 12),

          // Passenger count
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Passengers', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.remove_circle_outline_rounded),
                    onPressed: _passengerCount > 1 ? () => setState(() => _passengerCount--) : null,
                  ),
                  Text(
                    '$_passengerCount',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                  ),
                  IconButton(
                    icon: const Icon(Icons.add_circle_outline_rounded),
                    onPressed: _passengerCount < 6 ? () => setState(() => _passengerCount++) : null,
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Fare Summary Box
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
                    const Text('Total Fare (Inclusive of taxes)', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    Text(
                      '${Formatters.currency(fare)} × $_passengerCount passenger(s)',
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

          // Pay & Generate QR Ticket Button
          ElevatedButton.icon(
            icon: _isProcessing
                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Icon(Icons.check_circle_rounded),
            label: Text(_isProcessing ? 'Issuing Ticket...' : 'Pay with UPI / Card & Issue QR Ticket'),
            onPressed: _isProcessing
                ? null
                : () async {
                    if (_fromStop == null || _toStop == null || _fromStop == _toStop) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please choose two distinct stops.')),
                      );
                      return;
                    }

                    setState(() => _isProcessing = true);
                    final trip = tripProv.trips.isNotEmpty ? tripProv.trips.first : null;

                    final ticket = await ticketProv.issueTicket(
                      tripId: trip?.tripId ?? 'trip_demo',
                      routeId: _selectedRouteId,
                      fromStop: _fromStop!,
                      toStop: _toStop!,
                      passengerCount: _passengerCount,
                      paymentType: _paymentMethod,
                      passengerId: auth.currentUser?.uid,
                      passengerName: auth.currentUser?.name,
                      issuedByRole: 'passenger',
                    );

                    setState(() => _isProcessing = false);
                    if (!mounted) return;

                    if (ticket != null) {
                      Navigator.of(context).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: AppColors.success,
                          content: Text('Ticket #${ticket.ticketId} booked successfully! QR code is ready in My Tickets.'),
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
