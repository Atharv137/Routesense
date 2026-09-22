import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class AiCopilotMessage {
  final String id;
  final String role; // 'user' or 'model'
  final String content;
  final String timestamp;
  final String? modelUsed;
  final List<dynamic>? citations;
  final bool isError;

  AiCopilotMessage({
    required this.id,
    required this.role,
    required this.content,
    required this.timestamp,
    this.modelUsed,
    this.citations,
    this.isError = false,
  });
}

class AiCopilotService {
  static final AiCopilotService _instance = AiCopilotService._internal();
  factory AiCopilotService() => _instance;
  AiCopilotService._internal();

  /// Configured backend URL provided via --dart-define=AI_BACKEND_URL=https://your-domain.com
  static const String configuredBackendUrl = String.fromEnvironment('AI_BACKEND_URL');

  /// Checks if the backend endpoint is configured or accessible.
  static bool get isBackendConfigured {
    if (configuredBackendUrl.isNotEmpty) return true;
    return kIsWeb; // On web, relative /api/chat works via same-origin reverse proxy
  }

  /// Resolves the secure HTTPS backend endpoint.
  static Uri? getApiEndpoint() {
    if (configuredBackendUrl.isNotEmpty) {
      final sanitized = configuredBackendUrl.endsWith('/')
          ? configuredBackendUrl.substring(0, configuredBackendUrl.length - 1)
          : configuredBackendUrl;
      return Uri.tryParse('$sanitized/api/chat');
    }
    if (kIsWeb) {
      return Uri.parse('/api/chat');
    }
    return null;
  }

  /// Communicates with RouteSense secure server-side Gemini API (/api/chat).
  /// Never exposes Gemini secrets on the client side.
  Future<AiCopilotMessage> sendMessage({
    required List<AiCopilotMessage> history,
    required String prompt,
    required String role,
    String preferredModel = 'gemini-3.5-flash',
    String grounding = 'maps',
    Map<String, dynamic>? contextData,
  }) async {
    final endpoint = getApiEndpoint();

    if (endpoint == null) {
      return AiCopilotMessage(
        id: 'bot_unconfigured_${DateTime.now().millisecondsSinceEpoch}',
        role: 'model',
        content: 'AI Copilot backend URL is not configured.\n\n'
            'Please build/run the application with:\n'
            '--dart-define=AI_BACKEND_URL=https://your-backend-domain.com\n\n'
            'The Gemini API key remains securely managed on the backend.',
        timestamp: _formatTime(DateTime.now()),
        modelUsed: preferredModel,
        isError: true,
      );
    }

    final formattedMessages = history.map((m) => {
      'role': m.role,
      'content': m.content,
    }).toList();

    formattedMessages.add({
      'role': 'user',
      'content': prompt,
    });

    try {
      final response = await http.post(
        endpoint,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'messages': formattedMessages,
          'role': role,
          'preferredModel': preferredModel,
          'grounding': grounding,
          'contextData': contextData ?? {},
        }),
      ).timeout(const Duration(seconds: 25));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return AiCopilotMessage(
          id: 'bot_${DateTime.now().millisecondsSinceEpoch}',
          role: 'model',
          content: data['content'] ?? 'Response received.',
          timestamp: _formatTime(DateTime.now()),
          modelUsed: data['modelUsed'] ?? preferredModel,
          citations: data['citations'],
        );
      } else {
        debugPrint('AI Copilot received HTTP status ${response.statusCode}');
        return AiCopilotMessage(
          id: 'bot_err_${DateTime.now().millisecondsSinceEpoch}',
          role: 'model',
          content: 'AI Copilot is currently unavailable. Please try again later.',
          timestamp: _formatTime(DateTime.now()),
          modelUsed: preferredModel,
          isError: true,
        );
      }
    } catch (e) {
      debugPrint('AI Copilot request error: $e');
      return AiCopilotMessage(
        id: 'bot_err_${DateTime.now().millisecondsSinceEpoch}',
        role: 'model',
        content: 'AI Copilot is currently unavailable. Please try again later.',
        timestamp: _formatTime(DateTime.now()),
        modelUsed: preferredModel,
        isError: true,
      );
    }
  }

  static String _formatTime(DateTime dt) {
    final hour = dt.hour.toString().padLeft(2, '0');
    final minute = dt.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}
