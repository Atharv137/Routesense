import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/route_model.dart';
import '../../providers/route_provider.dart';
import 'digital_ticketing_modal.dart';

class RouteSearchScreen extends StatelessWidget {
  final VoidCallback onBack;

  const RouteSearchScreen({required this.onBack});

  @override
  Widget build(BuildContext context) {
    final routeProv = Provider.of<RouteProvider>(context);

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
                'Transit Corridors & Stops',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Search Bar
          TextField(
            onChanged: (val) => routeProv.setSearchQuery(val),
            decoration: InputDecoration(
              hintText: 'Search by corridor, number, or stop name...',
              prefixIcon: const Icon(Icons.search_rounded, size: 20),
              suffixIcon: routeProv.searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear_rounded, size: 18),
                      onPressed: () => routeProv.setSearchQuery(''),
                    )
                  : null,
            ),
          ),

          const SizedBox(height: 20),

          // Routes list
          routeProv.routes.isEmpty
              ? const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: Text('No routes matched your query.', style: TextStyle(color: AppColors.textMuted)),
                  ),
                )
              : ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: routeProv.routes.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 16),
                  itemBuilder: (context, idx) {
                    final route = routeProv.routes[idx];
                    return _buildRouteCard(context, route);
                  },
                ),
        ],
      ),
    );
  }

  Widget _buildRouteCard(BuildContext context, RouteModel route) {
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
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  route.routeNumber,
                  style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 12),
                ),
              ),
              Text(
                'Every ${route.frequencyMin} mins',
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            route.routeName,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 4),
          Text(
            '${route.startPoint} ⇄ ${route.endPoint}',
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
          const Divider(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Base Fare', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                  Text(Formatters.currency(route.baseFare), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Stops', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                  Text('${route.scheduledStops.length}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Distance', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                  Text('${route.totalDistanceKm} km', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                ],
              ),
              ElevatedButton(
                onPressed: () {
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.white,
                    shape: const RoundedRectangleBorder(
                      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                    ),
                    builder: (_) => DigitalTicketingModal(preselectedRouteId: route.routeId),
                  );
                },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                ),
                child: const Text('Book Ticket', style: TextStyle(fontSize: 12)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
