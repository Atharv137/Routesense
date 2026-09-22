import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/bus_provider.dart';
import '../../providers/route_provider.dart';
import '../../services/ai_copilot_service.dart';

class AiCopilotDialog extends StatefulWidget {
  const AiCopilotDialog({super.key});

  @override
  State<AiCopilotDialog> createState() => _AiCopilotDialogState();
}

class _AiCopilotDialogState extends State<AiCopilotDialog> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final AiCopilotService _aiService = AiCopilotService();

  final List<AiCopilotMessage> _messages = [];
  bool _isLoading = false;
  final String _selectedModel = 'gemini-3.5-flash';
  String _grounding = 'maps';

  @override
  void initState() {
    super.initState();
    _messages.add(
      AiCopilotMessage(
        id: 'welcome',
        role: 'model',
        content: '👋 Hello! I am **RouteSense AI Copilot**, grounded in live transit telemetry and Google Maps.\n\n'
            'Ask me about active corridors, fare computations, schedule bottlenecks, or driver incident protocols.',
        timestamp: 'Just now',
        modelUsed: 'gemini-3.5-flash',
      ),
    );
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage([String? textToSend]) async {
    final text = (textToSend ?? _controller.text).trim();
    if (text.isEmpty || _isLoading) return;

    final userMsg = AiCopilotMessage(
      id: 'usr_${DateTime.now().millisecondsSinceEpoch}',
      role: 'user',
      content: text,
      timestamp: 'Now',
    );

    setState(() {
      _messages.add(userMsg);
      _isLoading = true;
      if (textToSend == null) _controller.clear();
    });
    _scrollToBottom();

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final busProv = Provider.of<BusProvider>(context, listen: false);
    final routeProv = Provider.of<RouteProvider>(context, listen: false);

    final contextData = {
      'routesCount': routeProv.routes.length,
      'busesCount': busProv.allBuses.length,
      'role': auth.currentRole,
    };

    final response = await _aiService.sendMessage(
      history: _messages.sublist(0, _messages.length - 1),
      prompt: text,
      role: auth.currentRole,
      preferredModel: _selectedModel,
      grounding: _grounding,
      contextData: contextData,
    );

    if (mounted) {
      setState(() {
        _messages.add(response);
        _isLoading = false;
      });
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width > 600;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      insetPadding: EdgeInsets.symmetric(
        horizontal: isDesktop ? 40 : 12,
        vertical: 20,
      ),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: 640,
          maxHeight: MediaQuery.of(context).size.height * 0.85,
        ),
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                color: Color(0xFF0F172A),
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.auto_awesome, color: Colors.white, size: 18),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'RouteSense AI Copilot',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        Text(
                          'Gemini Grounded • Real-Time Fleet Context',
                          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white70),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),

            // Controls Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              color: Colors.grey.shade50,
              child: Row(
                children: [
                  const Text('Grounding: ', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black54)),
                  ChoiceChip(
                    label: const Text('Maps', style: TextStyle(fontSize: 10)),
                    selected: _grounding == 'maps',
                    onSelected: (v) => setState(() => _grounding = 'maps'),
                    padding: EdgeInsets.zero,
                  ),
                  const SizedBox(width: 4),
                  ChoiceChip(
                    label: const Text('Search', style: TextStyle(fontSize: 10)),
                    selected: _grounding == 'search',
                    onSelected: (v) => setState(() => _grounding = 'search'),
                    padding: EdgeInsets.zero,
                  ),
                  const SizedBox(width: 4),
                  ChoiceChip(
                    label: const Text('Off', style: TextStyle(fontSize: 10)),
                    selected: _grounding == 'none',
                    onSelected: (v) => setState(() => _grounding = 'none'),
                    padding: EdgeInsets.zero,
                  ),
                ],
              ),
            ),

            // Message Stream
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(12),
                itemCount: _messages.length,
                itemBuilder: (context, index) {
                  final msg = _messages[index];
                  final isUser = msg.role == 'user';
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isUser
                            ? const Color(0xFF0F172A)
                            : (msg.isError ? const Color(0xFFFEF2F2) : Colors.white),
                        border: isUser
                            ? null
                            : Border.all(
                                color: msg.isError ? const Color(0xFFFCA5A5) : Colors.grey.shade200,
                              ),
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 4, offset: const Offset(0, 2)),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (msg.isError)
                            Padding(
                              padding: const EdgeInsets.only(bottom: 6),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.info_outline, size: 14, color: Colors.red.shade700),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Notice',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.red.shade700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          Text(
                            msg.content,
                            style: TextStyle(
                              color: isUser
                                  ? Colors.white
                                  : (msg.isError ? Colors.red.shade900 : Colors.black87),
                              fontSize: 13,
                              height: 1.4,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            msg.timestamp,
                            style: TextStyle(
                              color: isUser ? Colors.white54 : Colors.black38,
                              fontSize: 10,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            if (_isLoading)
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary)),
                    SizedBox(width: 8),
                    Text('RouteSense AI is thinking...', style: TextStyle(fontSize: 11, color: Colors.black54)),
                  ],
                ),
              ),

            // Suggestions
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              child: Row(
                children: [
                  ActionChip(
                    label: const Text('Live fleet status?', style: TextStyle(fontSize: 11)),
                    onPressed: () => _sendMessage('What is the current status of Route 101 buses?'),
                  ),
                  const SizedBox(width: 6),
                  ActionChip(
                    label: const Text('Calculate fare Swargate', style: TextStyle(fontSize: 11)),
                    onPressed: () => _sendMessage('How much is the ticket fare between Swargate and Pune Station?'),
                  ),
                  const SizedBox(width: 6),
                  ActionChip(
                    label: const Text('Emergency protocol', style: TextStyle(fontSize: 11)),
                    onPressed: () => _sendMessage('What is the protocol for breakdown or engine overheating?'),
                  ),
                ],
              ),
            ),

            // Input Bar
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: Colors.grey.shade200)),
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(20)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      decoration: const InputDecoration(
                        hintText: 'Ask RouteSense AI...',
                        hintStyle: TextStyle(fontSize: 13),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 12),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.send_rounded, color: AppColors.primary),
                    onPressed: () => _sendMessage(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
