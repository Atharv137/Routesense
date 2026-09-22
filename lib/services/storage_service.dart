class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  /// Simulates/executes file upload to Firebase Storage
  /// Returns a download URL (or mock data URL) for the uploaded image.
  Future<String> uploadIncidentPhoto({
    required String incidentId,
    required String userId,
    required String fileName,
    List<int>? bytes,
  }) async {
    await Future.delayed(const Duration(milliseconds: 350));
    // In production, would use:
    // final ref = FirebaseStorage.instance.ref().child('incidents/$userId/$incidentId/$fileName');
    // await ref.putData(bytes);
    // return await ref.getDownloadURL();

    // Returns a high-contrast simulated photo indicator
    return 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80';
  }

  Future<String> uploadProfilePhoto({
    required String userId,
    required String fileName,
  }) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  }
}
