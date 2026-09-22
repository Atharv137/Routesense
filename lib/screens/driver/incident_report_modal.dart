import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../models/trip_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/incident_provider.dart';
import '../../services/storage_service.dart';

class IncidentReportModal extends StatefulWidget {
  final TripModel trip;

  const IncidentReportModal({required this.trip});

  @override
  _IncidentReportModalState createState() => _IncidentReportModalState();
}

class _IncidentReportModalState extends State<IncidentReportModal> {
  String _selectedType = 'delay';
  String _selectedSeverity = 'medium';
  final _descriptionController = TextEditingController();
  final _delayMinutesController = TextEditingController(text: '15');
  final _locationController = TextEditingController();
  bool _isUploadingPhoto = false;
  String? _uploadedPhotoUrl;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _locationController.text = widget.trip.currentStopName.isNotEmpty
        ? 'Near ${widget.trip.currentStopName}'
        : 'On route ${widget.trip.routeNumber}';
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    _delayMinutesController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final incidentProv = Provider.of<IncidentProvider>(context);
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.currentUser;

    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        left: 20,
        right: 20,
        top: 20,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.errorLight,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.warning_rounded, color: AppColors.error, size: 22),
                ),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Report Transit Incident',
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

            // Incident Type
            const Text('Incident Category', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              value: _selectedType,
              items: const [
                DropdownMenuItem(value: 'delay', child: Text('Traffic Delay / Congestion')),
                DropdownMenuItem(value: 'breakdown', child: Text('Mechanical Breakdown (Engine/Tire)')),
                DropdownMenuItem(value: 'accident', child: Text('Vehicle Collision / Accident')),
                DropdownMenuItem(value: 'medical', child: Text('Passenger Medical Emergency')),
                DropdownMenuItem(value: 'other', child: Text('Route Diversion / Roadwork')),
              ],
              onChanged: (val) => setState(() => _selectedType = val ?? 'delay'),
            ),

            const SizedBox(height: 12),

            // Severity & Delay in Minutes
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Severity Level', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 6),
                      DropdownButtonFormField<String>(
                        value: _selectedSeverity,
                        items: const [
                          DropdownMenuItem(value: 'low', child: Text('Low')),
                          DropdownMenuItem(value: 'medium', child: Text('Medium')),
                          DropdownMenuItem(value: 'high', child: Text('High')),
                          DropdownMenuItem(value: 'critical', child: Text('Critical')),
                        ],
                        onChanged: (val) => setState(() => _selectedSeverity = val ?? 'medium'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Est. Delay (Minutes)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _delayMinutesController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(hintText: '15'),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Current Location Landmark
            const Text('Location / Landmark', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            TextFormField(
              controller: _locationController,
              decoration: const InputDecoration(hintText: 'e.g. Near Shivajinagar Overpass'),
            ),

            const SizedBox(height: 12),

            // Incident Description
            const Text('Description & Operational Details', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            TextFormField(
              controller: _descriptionController,
              maxLines: 2,
              decoration: const InputDecoration(hintText: 'Describe issue, lane blockages, or passenger condition...'),
            ),

            const SizedBox(height: 14),

            // Attach Photo simulation (Firebase Storage)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Icon(
                    _uploadedPhotoUrl != null ? Icons.check_circle_rounded : Icons.camera_alt_outlined,
                    color: _uploadedPhotoUrl != null ? AppColors.success : AppColors.textSecondary,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _uploadedPhotoUrl != null
                          ? 'Incident Photo Attached to Storage ✓'
                          : 'Attach On-Scene Evidence Photo',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: _uploadedPhotoUrl != null ? AppColors.success : AppColors.textPrimary,
                      ),
                    ),
                  ),
                  OutlinedButton(
                    onPressed: _isUploadingPhoto
                        ? null
                        : () async {
                            setState(() => _isUploadingPhoto = true);
                            final url = await StorageService().uploadIncidentPhoto(
                              incidentId: 'inc_${DateTime.now().millisecondsSinceEpoch}',
                              userId: user?.uid ?? 'driver_uid',
                              fileName: 'evidence.jpg',
                            );
                            setState(() {
                              _uploadedPhotoUrl = url;
                              _isUploadingPhoto = false;
                            });
                          },
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      minimumSize: Size.zero,
                    ),
                    child: _isUploadingPhoto
                        ? const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 2))
                        : Text(_uploadedPhotoUrl != null ? 'Retake' : 'Attach Photo', style: const TextStyle(fontSize: 11)),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Submit Incident Button
            ElevatedButton.icon(
              icon: _isSubmitting
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.send_rounded),
              label: Text(_isSubmitting ? 'Transmitting to Dispatch...' : 'Broadcast Incident to Operations Center'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
              ),
              onPressed: _isSubmitting
                  ? null
                  : () async {
                      if (_descriptionController.text.trim().isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Please enter a brief description of the incident.')),
                        );
                        return;
                      }

                      setState(() => _isSubmitting = true);
                      final delayMin = int.tryParse(_delayMinutesController.text) ?? 15;

                      final incident = await incidentProv.reportIncident(
                        routeId: widget.trip.routeId,
                        busId: widget.trip.busId,
                        type: _selectedType,
                        description: _descriptionController.text.trim(),
                        severity: _selectedSeverity,
                        delayMinutes: delayMin,
                        locationName: _locationController.text.trim().isNotEmpty
                            ? _locationController.text.trim()
                            : 'Near ${widget.trip.currentStopName}',
                        photoUrl: _uploadedPhotoUrl,
                        driverId: user?.uid,
                        driverName: user?.name,
                      );

                      setState(() => _isSubmitting = false);
                      if (!mounted) return;

                      if (incident != null) {
                        Navigator.of(context).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: AppColors.error,
                            content: Text('Incident reported! Operations dispatch and passengers alerted (${incident.delayMinutes}m delay logged).'),
                          ),
                        );
                      }
                    },
            ),
          ],
        ),
      ),
    );
  }
}
